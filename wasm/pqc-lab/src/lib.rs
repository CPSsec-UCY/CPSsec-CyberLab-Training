#![cfg_attr(all(not(test), target_arch = "wasm32"), no_std)]
#![cfg_attr(all(not(test), target_arch = "wasm32"), no_main)]
#![allow(clippy::missing_safety_doc)]

//! Instructional negacyclic NTT and polynomial arithmetic over Z_3329.
//!
//! The lab uses n = 128 because 3329 - 1 = 2^8 * 13 admits a primitive
//! 256th root of unity, hence a full 128-point negacyclic NTT. ML-KEM uses
//! n = 256 with a seven-layer incomplete NTT and a 2x2 base-case multiply.
//! The arithmetic here is real: results are compared against a schoolbook
//! negacyclic convolution in `self_test`.

pub const Q: i32 = 3329;
pub const N: usize = 128;
const PSI: i64 = 17; // primitive 256th root of unity mod 3329
const OMEGA: i64 = 289; // PSI^2, primitive 128th root

static mut A: [i32; N] = [0; N];
static mut B: [i32; N] = [0; N];
static mut OUT: [i32; N] = [0; N];
static mut TMP: [i32; N] = [0; N];

#[cfg(all(not(test), target_arch = "wasm32"))]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}

#[inline]
fn mod_q(value: i64) -> i32 {
    let mut reduced = value % Q as i64;
    if reduced < 0 {
        reduced += Q as i64;
    }
    reduced as i32
}

#[inline]
fn pow_mod(mut base: i64, mut exponent: usize) -> i64 {
    base = mod_q(base) as i64;
    let mut result: i64 = 1;
    while exponent > 0 {
        if exponent & 1 == 1 {
            result = (result * base) % Q as i64;
        }
        base = (base * base) % Q as i64;
        exponent >>= 1;
    }
    result
}

#[inline]
fn bitrev7(value: usize) -> usize {
    let mut result = 0usize;
    for bit in 0..7 {
        result |= ((value >> bit) & 1) << (6 - bit);
    }
    result
}

#[inline]
unsafe fn ptr_for(id: i32) -> *mut i32 {
    match id {
        0 => core::ptr::addr_of_mut!(A) as *mut i32,
        1 => core::ptr::addr_of_mut!(B) as *mut i32,
        2 => core::ptr::addr_of_mut!(OUT) as *mut i32,
        3 => core::ptr::addr_of_mut!(TMP) as *mut i32,
        _ => core::ptr::null_mut(),
    }
}

#[inline]
unsafe fn get(id: i32, index: usize) -> i32 {
    ptr_for(id).add(index).read()
}

#[inline]
unsafe fn set(id: i32, index: usize, value: i32) {
    ptr_for(id).add(index).write(mod_q(value as i64));
}

unsafe fn bit_reverse(buf: i32) {
    let mut index = 0usize;
    while index < N {
        let reversed = bitrev7(index);
        if reversed > index {
            let left = get(buf, index);
            let right = get(buf, reversed);
            set(buf, index, right);
            set(buf, reversed, left);
        }
        index += 1;
    }
}

/// DIT butterfly network. Expects input in bit-reversed order.
unsafe fn dit(buf: i32, root: i64) {
    let mut len = 2usize;
    while len <= N {
        let wlen = pow_mod(root, N / len);
        let half = len / 2;
        let mut start = 0usize;
        while start < N {
            let mut w: i64 = 1;
            let mut j = 0usize;
            while j < half {
                let u = get(buf, start + j) as i64;
                let v = (get(buf, start + j + half) as i64 * w) % Q as i64;
                set(buf, start + j, mod_q(u + v));
                set(buf, start + j + half, mod_q(u - v));
                w = (w * wlen) % Q as i64;
                j += 1;
            }
            start += len;
        }
        len <<= 1;
    }
}

unsafe fn pre_twist(buf: i32) {
    let mut twiddle: i64 = 1;
    let mut index = 0usize;
    while index < N {
        let value = (get(buf, index) as i64 * twiddle) % Q as i64;
        set(buf, index, value as i32);
        twiddle = (twiddle * PSI) % Q as i64;
        index += 1;
    }
}

unsafe fn untwist(buf: i32) {
    let psi_inv = pow_mod(PSI, (Q as usize) - 2);
    let mut twiddle: i64 = 1;
    let mut index = 0usize;
    while index < N {
        let value = (get(buf, index) as i64 * twiddle) % Q as i64;
        set(buf, index, value as i32);
        twiddle = (twiddle * psi_inv) % Q as i64;
        index += 1;
    }
}

unsafe fn forward_ntt(buf: i32) {
    pre_twist(buf);
    bit_reverse(buf);
    dit(buf, OMEGA);
}

unsafe fn inverse_ntt(buf: i32) {
    let omega_inv = pow_mod(OMEGA, (Q as usize) - 2);
    let n_inv = pow_mod(N as i64, (Q as usize) - 2);
    bit_reverse(buf);
    dit(buf, omega_inv);
    let mut index = 0usize;
    while index < N {
        set(buf, index, (get(buf, index) as i64 * n_inv) as i32);
        index += 1;
    }
    untwist(buf);
}

unsafe fn naive_negacyclic(dst: i32, left: i32, right: i32) {
    let mut accumulator = [0i64; N];
    let mut i = 0usize;
    while i < N {
        let a = get(left, i) as i64;
        let mut j = 0usize;
        while j < N {
            let product = a * get(right, j) as i64;
            let index = i + j;
            if index < N {
                accumulator[index] += product;
            } else {
                accumulator[index - N] -= product;
            }
            j += 1;
        }
        i += 1;
    }
    let mut k = 0usize;
    while k < N {
        set(dst, k, mod_q(accumulator[k]));
        k += 1;
    }
}

unsafe fn copy(dst: i32, src: i32) {
    let mut index = 0usize;
    while index < N {
        set(dst, index, get(src, index));
        index += 1;
    }
}

unsafe fn equal(left: i32, right: i32) -> bool {
    let mut index = 0usize;
    while index < N {
        if get(left, index) != get(right, index) {
            return false;
        }
        index += 1;
    }
    true
}

#[no_mangle]
pub extern "C" fn lab_n() -> i32 {
    N as i32
}

#[no_mangle]
pub extern "C" fn lab_q() -> i32 {
    Q
}

#[no_mangle]
pub extern "C" fn buf_a() -> *mut i32 {
    unsafe { ptr_for(0) }
}

#[no_mangle]
pub extern "C" fn buf_b() -> *mut i32 {
    unsafe { ptr_for(1) }
}

#[no_mangle]
pub extern "C" fn buf_out() -> *mut i32 {
    unsafe { ptr_for(2) }
}

#[no_mangle]
pub extern "C" fn seed(value: u32) {
    unsafe {
        let mut state = if value == 0 { 0x9e3779b9 } else { value };
        let mut index = 0usize;
        while index < N {
            state ^= state << 13;
            state ^= state >> 17;
            state ^= state << 5;
            set(0, index, (state % Q as u32) as i32);

            state ^= state << 13;
            state ^= state >> 17;
            state ^= state << 5;
            set(1, index, (state % Q as u32) as i32);

            set(2, index, 0);
            set(3, index, 0);
            index += 1;
        }
    }
}

#[no_mangle]
pub extern "C" fn ntt(id: i32) {
    unsafe {
        if !ptr_for(id).is_null() {
            forward_ntt(id);
        }
    }
}

#[no_mangle]
pub extern "C" fn invntt(id: i32) {
    unsafe {
        if !ptr_for(id).is_null() {
            inverse_ntt(id);
        }
    }
}

#[no_mangle]
pub extern "C" fn pointwise_mul() {
    unsafe {
        let mut index = 0usize;
        while index < N {
            let product = (get(0, index) as i64 * get(1, index) as i64) % Q as i64;
            set(2, index, product as i32);
            index += 1;
        }
    }
}

#[no_mangle]
pub extern "C" fn add() {
    unsafe {
        let mut index = 0usize;
        while index < N {
            set(2, index, get(0, index) + get(1, index));
            index += 1;
        }
    }
}

#[no_mangle]
pub extern "C" fn naive_mul() {
    unsafe {
        naive_negacyclic(2, 0, 1);
    }
}

#[no_mangle]
pub extern "C" fn compress(id: i32, d: i32) {
    if !(1..=12).contains(&d) {
        return;
    }
    unsafe {
        if ptr_for(id).is_null() {
            return;
        }
        let modulus = 1i64 << d;
        let mut index = 0usize;
        while index < N {
            let value = get(id, index) as i64;
            let compressed = (((value << d) + (Q as i64 / 2)) / Q as i64) % modulus;
            set(id, index, compressed as i32);
            index += 1;
        }
    }
}

#[no_mangle]
pub extern "C" fn decompress(id: i32, d: i32) {
    if !(1..=12).contains(&d) {
        return;
    }
    unsafe {
        if ptr_for(id).is_null() {
            return;
        }
        let rounding = 1i64 << (d - 1);
        let mut index = 0usize;
        while index < N {
            let value = get(id, index) as i64;
            let decompressed = (value * Q as i64 + rounding) >> d;
            set(id, index, decompressed as i32);
            index += 1;
        }
    }
}

/// Returns 1 when NTT round-trips and NTT multiplication matches the
/// schoolbook negacyclic convolution.
#[no_mangle]
pub extern "C" fn self_test() -> i32 {
    unsafe {
        seed(0x1234_5678);
        copy(3, 0);
        forward_ntt(3);
        inverse_ntt(3);
        if !equal(0, 3) {
            seed(0x1234_5678);
            return 0;
        }

        seed(0x1234_5678);
        naive_negacyclic(3, 0, 1);
        forward_ntt(0);
        forward_ntt(1);
        pointwise_mul();
        inverse_ntt(2);
        if !equal(2, 3) {
            seed(0x1234_5678);
            return 0;
        }

        seed(0x1234_5678);
        1
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ntt_round_trip() {
        let values: Vec<i32> = (0..N as i32).map(|value| (value * 37 + 11) % Q).collect();
        let mut transformed = values.clone();
        let mut result = vec![0i32; N];

        // Mirror the exported functions without relying on mutable statics across tests.
        let mut twist = 1i64;
        for (index, value) in transformed.iter_mut().enumerate() {
            *value = mod_q(*value as i64 * twist);
            twist = (twist * PSI) % Q as i64;
            let _ = index;
        }
        for index in 0..N {
            let reversed = bitrev7(index);
            if reversed > index {
                transformed.swap(index, reversed);
            }
        }
        dit_vec(&mut transformed, OMEGA);
        result.clone_from(&transformed);

        let omega_inv = pow_mod(OMEGA, (Q as usize) - 2);
        let n_inv = pow_mod(N as i64, (Q as usize) - 2);
        for index in 0..N {
            let reversed = bitrev7(index);
            if reversed > index {
                result.swap(index, reversed);
            }
        }
        dit_vec(&mut result, omega_inv);
        for value in result.iter_mut() {
            *value = mod_q(*value as i64 * n_inv);
        }
        let psi_inv = pow_mod(PSI, (Q as usize) - 2);
        let mut twist = 1i64;
        for value in result.iter_mut() {
            *value = mod_q(*value as i64 * twist);
            twist = (twist * psi_inv) % Q as i64;
        }

        assert_eq!(result, values);
    }

    #[test]
    fn polynomial_multiplication_matches_naive() {
        let left: Vec<i32> = (0..N as i32).map(|value| (value * 13 + 7) % Q).collect();
        let right: Vec<i32> = (0..N as i32).map(|value| (value * 29 + 3) % Q).collect();

        let mut expected = [0i64; N];
        for i in 0..N {
            for j in 0..N {
                let product = left[i] as i64 * right[j] as i64;
                if i + j < N {
                    expected[i + j] += product;
                } else {
                    expected[i + j - N] -= product;
                }
            }
        }

        let mut transformed_left = left.clone();
        let mut transformed_right = right.clone();
        prepare(&mut transformed_left);
        prepare(&mut transformed_right);
        let product: Vec<i32> = transformed_left
            .iter()
            .zip(transformed_right.iter())
            .map(|(a, b)| mod_q(*a as i64 * *b as i64))
            .collect();
        let mut result = product;
        finish(&mut result);

        let expected: Vec<i32> = expected.iter().map(|value| mod_q(*value)).collect();
        assert_eq!(result, expected);
    }

    fn prepare(values: &mut [i32]) {
        let mut twist = 1i64;
        for value in values.iter_mut() {
            *value = mod_q(*value as i64 * twist);
            twist = (twist * PSI) % Q as i64;
        }
        for index in 0..N {
            let reversed = bitrev7(index);
            if reversed > index {
                values.swap(index, reversed);
            }
        }
        dit_vec(values, OMEGA);
    }

    fn finish(values: &mut [i32]) {
        let omega_inv = pow_mod(OMEGA, (Q as usize) - 2);
        let n_inv = pow_mod(N as i64, (Q as usize) - 2);
        for index in 0..N {
            let reversed = bitrev7(index);
            if reversed > index {
                values.swap(index, reversed);
            }
        }
        dit_vec(values, omega_inv);
        for value in values.iter_mut() {
            *value = mod_q(*value as i64 * n_inv);
        }
        let psi_inv = pow_mod(PSI, (Q as usize) - 2);
        let mut twist = 1i64;
        for value in values.iter_mut() {
            *value = mod_q(*value as i64 * twist);
            twist = (twist * psi_inv) % Q as i64;
        }
    }

    fn dit_vec(values: &mut [i32], root: i64) {
        let mut len = 2usize;
        while len <= N {
            let wlen = pow_mod(root, N / len);
            let half = len / 2;
            let mut start = 0usize;
            while start < N {
                let mut w: i64 = 1;
                for j in 0..half {
                    let u = values[start + j] as i64;
                    let v = (values[start + j + half] as i64 * w) % Q as i64;
                    values[start + j] = mod_q(u + v);
                    values[start + j + half] = mod_q(u - v);
                    w = (w * wlen) % Q as i64;
                }
                start += len;
            }
            len <<= 1;
        }
    }
}
