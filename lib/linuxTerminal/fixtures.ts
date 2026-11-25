import type { LinuxLabFixture } from "./engine";

const fixture = (
  slug: string,
  user: string,
  files: Record<string, string>,
  intro?: string,
): LinuxLabFixture => ({
  slug,
  user,
  hostname: "cyberlab",
  files,
  intro,
});

const LABS: LinuxLabFixture[] = [
  fixture("asymmetric-primitives", "student", {
    "README.txt": "Primitive lab\nCompare X25519 agreement with Ed25519 signing.\nThe key files are inert text fixtures, not real keys.\n",
    "message.txt": "release: v1.4.2\nartifact: demo-service\nrequested-by: release-team\n",
    "alice-sign.pub": "Ed25519 verification key\nstudent-alice\n32-byte key (simulated fixture)\n",
    "alice.pub": "X25519 agreement key\nstudent-alice-session\n32-byte public share (simulated fixture)\n",
    "bob.pub": "X25519 agreement key\nstudent-bob-session\n32-byte public share (simulated fixture)\n",
  }, "Practise X25519 agreement and Ed25519 signature workflows."),
  fixture("symmetric-crypto", "student", {
    "README.txt": "Symmetric record lab\nThe files model plaintext, key material and a tamper test.\nCBC alone does not authenticate a record.\n",
    "note.txt": "transfer 100 EUR to alice\nreference: invoice-42\n",
    "key.bin": "simulated 32-byte AES key\n00112233445566778899aabbccddeeff\n",
    "nonce.txt": "9f3c1a7b44e28d05c6b1a9f2\nunique-per-key planning fixture\n",
    "note.enc": "simulated encrypted record\nciphertext bytes are represented as text\n",
  }, "Practise inspecting plaintext, key material and encrypted records."),
  fixture("hashing-mac-kdf", "student", {
    "README.txt": "Hashing lab\nUse sha256sum to compare two messages.\nUse grep to find the changed amount.\n",
    "message.txt": "transfer 100 EUR to alice\n",
    "message-changed.txt": "transfer 900 EUR to alice\n",
    "salt.txt": "demo-salt-32-bytes\nstore the salt and cost parameters with a password hash\n",
    "hkdf-labels.txt": "handshake\nrecord-keys\nhandshake-mac\n",
  }, "Practise digesting, comparing and separating KDF labels."),
  fixture("web-application-security", "appsec", {
    "README.txt": "Authorised staging fixtures\nAll requests refer to fictional hosts.\nTest object authorisation with a positive and a negative case.\n",
    "orders.json": '[\n  {"id": 42, "tenant": "alpha", "owner": "user-7", "total": 100},\n  {"id": 43, "tenant": "beta", "owner": "user-9", "total": 250}\n]\n',
    "headers.txt": "HTTP/2 200\ncontent-type: application/json\ncache-control: no-store\nstrict-transport-security: max-age=31536000\n",
    "ReportTitle.tsx": "export function ReportTitle({ report }) {\n  return <h1>{report.title}</h1>;\n}\n",
    "headers-missing-csp.txt": "HTTP/2 200\ncontent-type: text/html\nserver: demo-nginx\n",
  }, "Practise reviewing authorised HTTP fixtures and object-level tests."),
  fixture("identity-access-management", "iam", {
    "README.txt": "OIDC fixture lab\nDecode with cat and grep.\nA decoded token is not a verified token.\n",
    "token.json": '{\n  "iss": "https://id.example.test",\n  "aud": "orders-api",\n  "sub": "user-7f21",\n  "scope": "orders:read profile",\n  "exp": 1795559400\n}\n',
    "pkce.env": "CODE_VERIFIER=demo-verifier\nCODE_CHALLENGE=demo-challenge\nCLIENT_ID=demo-web\n",
    "refresh-events.txt": "2026-11-25T09:20:00Z rotate accepted\n2026-11-25T09:21:00Z reuse detected\n2026-11-25T09:21:01Z token family revoked\n",
  }, "Practise reading PKCE and token lifecycle fixtures."),
  fixture("cloud-container-security", "cloud", {
    "README.txt": "Toy cloud audit\nFollow identity, storage, workload and network edges.\nThe account and cluster are fictional.\n",
    "scope.yaml": "engagement: LAB-2026-014\naccount: 111122223333\ncluster: demo\n",
    "bucket-policy.json": '{\n  "PolicyStatus": {"IsPublic": true},\n  "objects": ["deployment.tar.gz"]\n}\n',
    "reporting-policy.json": '{\n  "Effect": "Allow",\n  "Action": ["s3:GetObject"],\n  "Resource": "arn:aws:s3:::reports/reports/*"\n}\n',
    "networkpolicy.yaml": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny\nspec:\n  podSelector: {}\n  policyTypes: [Ingress, Egress]\n",
  }, "Practise reading a toy cloud identity and policy chain."),
  fixture("malware-endpoint-forensics", "analyst", {
    "README.txt": "Malware triage fixtures\nEvery sample is synthetic and inert.\nRecord hashes before interpreting strings.\n",
    "sample.bin": "SYNTHETIC SAMPLE\nformat: PE32+ x86-64 (metadata only)\nNo executable bytes are present.\n",
    "sample.strings": "Invoice_2026_Q4.pdf\npowershell.exe\nFromBase64String\nupdate-check.example.test\n",
    "rule.yar": "rule suspicious_encoded_powershell {\n  strings:\n    $ps = \"powershell.exe\"\n    $enc = \"FromBase64String\"\n  condition:\n    all of them\n}\n",
    "processes.csv": "pid,ppid,image,created\n1844,612,winword.exe,2026-11-24T09:42:07Z\n7212,1844,powershell.exe,2026-11-24T09:42:19Z\n",
  }, "Practise hashing and reading inert malware-triage evidence."),
  fixture("secure-software-supply-chain", "release", {
    "README.txt": "Supply-chain fixtures\nInventory, signature and provenance must agree.\nAll identities are fictional.\n",
    "artifact.tar.gz": "simulated release artifact\ndigest: sha256:demo-artifact\n",
    "sbom.spdx.json": '{\n  "spdxVersion": "SPDX-2.3",\n  "name": "demo-service",\n  "versionInfo": "1.4.2",\n  "packages": [{"name": "openssl", "versionInfo": "3.0.13"}]\n}\n',
    "provenance.json": '{\n  "buildDefinition": {\n    "externalParameters": {\n      "repository": "https://github.com/org/service",\n      "path": ".github/workflows/release.yml",\n      "ref": "refs/tags/v1.4.2"\n    }\n  }\n}\n',
    "release.yml": "name: release\non: push\ntags: [v*]\npermissions:\n  id-token: write\n",
  }, "Practise comparing SBOM, signature and provenance fixtures."),
  fixture("deep-packet-inspection", "sensor", {
    "README.txt": "Packet-analysis fixtures\nThe pcap is represented by text metadata.\nUse conn.log and dns.log to reason about visibility.\n",
    "capture.pcap": "pcap simulation metadata\npackets: 12408\nduration: 301.4 seconds\n",
    "dns.log": "cdn.example.test\nupdates.example.test\na7f3c9e1.sync-node.example\na7f3c9e2.sync-node.example\n",
    "conn.log": "10.20.4.18,203.0.113.9,443,ssl,301.2\n10.20.4.18,198.51.100.24,443,ssl,42.7\n10.20.4.18,203.0.113.9,53,dns,299.8\n",
    "sni.txt": "files.example.test\napi.partner.example\nsync-node.example\n(no SNI)\n",
  }, "Practise reading flow and DNS metadata without decrypting payloads."),
  fixture("soc-operations", "analyst", {
    "README.txt": "SOC fixtures\nUse jq-like inspection through grep and head.\nReport precision and recall together.\n",
    "alerts.json": '[\n  {"severity": "high", "rule": "office_spawned_powershell", "host": "FIN-WS-014"},\n  {"severity": "medium", "rule": "new_device_signin", "host": "FIN-WS-021"},\n  {"severity": "high", "rule": "office_spawned_powershell", "host": "FIN-WS-014"}\n]\n',
    "rule.yml": "title: Office spawned encoded PowerShell\nlogsource:\n  product: windows\ndetection:\n  selection:\n    ParentImage: '*\\\\WINWORD.EXE'\n    Image: '*\\\\powershell.exe'\n    CommandLine: '* -enc*'\n",
    "metrics.txt": "TP=8\nFP=12\nFN=3\nprecision=0.40\nrecall=0.73\n",
  }, "Practise reading an alert queue and a detection-quality fixture."),
  fixture("tls-pki", "pki", {
    "README.txt": "TLS and PKI fixtures\nThe PEM text is illustrative, not a valid certificate.\nVerify a real chain with openssl verify in the guided deck.\n",
    "handshake.txt": "Protocol version: TLSv1.3\nServer Temp Key: X25519MLKEM768, 1216 bits\nCipher: TLS_AES_256_GCM_SHA384\n",
    "leaf.pem": "-----BEGIN CERTIFICATE-----\nDEMO-LEAF-CERTIFICATE\nsubject=CN=demo.example.test\nsignature=ecdsa-with-SHA256\n-----END CERTIFICATE-----\n",
    "intermediate.pem": "-----BEGIN CERTIFICATE-----\nDEMO-INTERMEDIATE-CERTIFICATE\nissuer=Toy Intermediate CA\n-----END CERTIFICATE-----\n",
    "roots.pem": "-----BEGIN CERTIFICATE-----\nDEMO-ROOT-CERTIFICATE\nsubject=CN=Toy Root CA\n-----END CERTIFICATE-----\n",
  }, "Practise inspecting a hybrid handshake and a certificate chain."),
  fixture("centralised-decentralised", "validator", {
    "README.txt": "Consensus fixtures\nA block height is not finality.\nQuorum intersection is the safety argument.\n",
    "replicas.yaml": "replicas: 7\nbyzantine: 2\nquorum: 5\nround: 42\n",
    "votes.json": '{\n  "prepare": ["r1", "r2", "r3", "r4", "r6"],\n  "commit": ["r1", "r2", "r3", "r4", "r6", "r7"],\n  "decision": "0x8a3fc21e"\n}\n',
    "chain.json": '{"block": 4281739, "finalized": 4281736, "proposer": "r3"}\n',
    "failure-drill.txt": "round 43\nreplicas: 7\nbyzantine: 3\nprepare: 4\ncommit: 4\nresult: no quorum\n",
  }, "Practise reading votes, finality and fault-bound fixtures."),
  fixture("federated-learning", "researcher", {
    "README.txt": "Federated-learning fixtures\nAggregation does not prove privacy.\nClipping bounds sensitivity before noise.\n",
    "round.json": '{"round": 3, "clients": 8, "accuracy": 0.874, "loss": 0.312}\n',
    "client-norms.csv": "client,norm\nhospital-1,2.41\nhospital-2,0.88\nhospital-3,4.02\n",
    "dp-config.yaml": "clip_norm: 1.0\nepsilon: 1.0\ndelta: 0.00001\nrounds: 3\n",
    "aggregate-result.json": '{"accepted": 7, "rejected": 1, "reason": "norm exceeds bound"}\n',
  }, "Practise reading round metrics and privacy parameters."),
  fixture("zero-knowledge-mpc", "prover", {
    "README.txt": "Zero-knowledge fixtures\nThe circuit is a toy relation.\nA proof proves the relation, not the truth of external data.\n",
    "circuit.circom": "pragma circom 2.1.0;\ntemplate Balance() {\n  signal input balance;\n  signal input threshold;\n  signal output valid;\n  valid <== balance >= threshold;\n}\ncomponent main = Balance();\n",
    "public.json": '["1"]\n',
    "witness.wtns": "simulated witness\nsecret inputs omitted\nprivate input: threshold\n",
    "verification_key.json": '{"protocol": "groth16", "curve": "bn128", "demo": true}\n',
  }, "Practise inspecting a circuit, witness and public statement."),
  fixture("red-team-penetration-testing", "operator", {
    "README.txt": "Authorised range only\nTargets: 10.10.20.15 and 10.10.20.16\nEverything else is excluded.\n",
    "scope.yaml": "engagement: LAB-2026-014\ntargets: [10.10.20.15, 10.10.20.16]\nwindow: 09:00-17:00 UTC\nstop_triggers: production data, outage, active harm\n",
    "evidence/initial.nmap": "PORT     STATE SERVICE  VERSION\n22/tcp   open  ssh      OpenSSH 9.6\n443/tcp  open  ssl/http nginx 1.26.2\n",
    "evidence/headers.txt": "HTTP/2 200\nserver: nginx/1.26.2\ncontent-length: 1842\n",
    "evidence/SHA256SUMS": "b18e...  initial.nmap\n4c02...  headers.txt\n",
  }, "Practise scope review and evidence hygiene on a toy range."),
  fixture("web-exploitation-offensive-tooling", "toolsmith", {
    "README.txt": "Safe request-comparison fixtures\nNo live target and no executable payload.\nChange one meaningful condition at a time.\n",
    "baseline.json": '{"title": "Q4 planning", "body": "redacted", "request_id": "req-001"}\n',
    "mutated.json": '{"error": "unsupported_header", "request_id": "req-002"}\n',
    "comparator.py": "def compare(baseline, candidate):\n    ignored = {'request_id', 'server_time'}\n    return {k: v for k, v in baseline.items() if k not in ignored and candidate.get(k) != v}\n",
    "trace.txt": "GET /api/notes/42 HTTP/2\nHost: lantern-notes.test\nAccept: application/json\nX-Debug: 1\n",
  }, "Practise comparing baseline and mutated response fixtures."),
  fixture("malware-reverse-engineering-data-science", "re", {
    "README.txt": "Reverse-engineering fixtures\nAll samples are deterministic and inert.\nA disassembly listing cannot prove runtime behaviour.\n",
    "samples/alpha.bin": "SYNTHETIC ALPHA\narch: x86\nbits: 64\nstripped: true\n",
    "features.csv": "sample,entropy,imports,strings,section_count\nalpha,7.42,23,184,7\nbeta,6.11,18,142,6\ngamma,7.88,31,96,8\n",
    "listing.asm": "main:\n  push rbp\n  lea rcx, [invoice.pdf]\n  call fictional_helper\n  cmp eax, 0\n  jne early_exit\n  xor eax, eax\n  ret\n",
    "evaluation.txt": "threshold=0.65\nTP=4 FP=2 FN=1 TN=5\nprecision=0.667 recall=0.800\n",
  }, "Practise comparing static structure and detector metrics."),
  fixture("rootkits-bootkits", "ir", {
    "README.txt": "Boot-integrity fixtures\nA mismatch is a question, not proof of compromise.\nEvery visibility source has an independence assumption.\n",
    "boot-state.txt": "SecureBoot enabled\nkernel: 6.11.0-24-generic\nlockdown: unsigned module loading restricted\n",
    "pcr-values.txt": "PCR0  9A1F...C72B\nPCR2  4E08...11D9\nPCR4  77C1...8A03\nPCR7  B3D2...F610\n",
    "modules.txt": "nf_tables 274432 2\noverlay 151552 1\ndebug_helper 16384 0\ntls 143360 1\n",
    "kernel.log": "module verification failed: signature and/or required key missing\nima: TPM chip not found, activating TPM-bypass\n",
  }, "Practise reading boot, TPM and kernel-integrity fixtures."),
  fixture("digital-forensics-incident-response", "examiner", {
    "README.txt": "DFIR fixtures\nPreserve authority, hashes and timestamps.\nAll evidence is synthetic.\n",
    "evidence/acquire.log": "case: IR-2026-118\nsource: /dev/sdb\nsha256: 8f14e45fceea167a5a36dedd4bea2543...\ncompleted: 2026-11-24T10:41:19Z\n",
    "memory-processes.csv": "pid,ppid,image,created\n1844,612,winword.exe,2026-11-24T09:42:07Z\n7212,1844,powershell.exe,2026-11-24T09:42:19Z\n",
    "timeline.csv": "time,source,type,description\n2026-11-24T09:42:07Z,NTFS,Modified,Invoice_2026_Q4.docm\n2026-11-24T09:42:19Z,EVTX,Write,PowerShell process created\n",
    "case/AUTHORITY.txt": "authorised_by: CISO delegate\nscope: FIN-WS-014 memory and disk\nactive_harm_exception: contain first if encryption is active\n",
  }, "Practise acquisition records and UTC timeline correlation."),
  fixture("blue-team-threat-hunting", "hunter", {
    "README.txt": "Threat-hunting fixtures\nWrite a falsifiable hypothesis before searching.\nMissing telemetry is a finding.\n",
    "H-2026-041.md": "Hypothesis: WINWORD.EXE spawns encoded PowerShell on finance workstations.\nScope: 430 managed hosts.\nWindow: 24 hours.\nFalsifier: approved signed automation explains every match.\n",
    "matches.json": '[\n  {"host": "FIN-WS-014", "account": "svc.report", "command": "powershell.exe -enc SQBFAFgA"},\n  {"host": "FIN-WS-021", "account": "backup.svc", "command": "powershell.exe -enc QwBvAG4AdABvAHMA"}\n]\n',
    "coverage.csv": "host_count,telemetry_status\n412,current\n18,stale\n",
    "metrics.txt": "TP=5\nFP=12\nFN=3\nprecision=0.29\nrecall=0.62\n",
  }, "Practise reading a hypothesis, matches and coverage gap."),
  fixture("quantum-threat", "auditor", {
    "README.txt": "Migration inventory fixtures\nRank by confidentiality lifetime and difficulty of change.\nSymmetric algorithms are a separate risk class.\n",
    "tls-inventory.txt": "key_exchange: X25519\ncertificate_key: ECDSA P-256\ncertificate_signature: ECDSA-SHA256\n",
    "ssh-algorithms.txt": "mlkem768x25519-sha256\ncurve25519-sha256\nssh-ed25519\nrsa-sha2-512\n",
    "migration-plan.md": "priority: long-lived archives\nfirst: hybrid key exchange\nnext: certificate signatures\nverify: provider and HSM support\n",
    "estimates.txt": "RSA-2048 logical qubits: about 4099\nGrover AES-128 search: about 2^64\n",
  }, "Practise reading algorithm inventories and migration priorities."),
  fixture("ntt-polynomials", "student", {
    "README.txt": "NTT fixtures\nX^4 = -1 in the negacyclic ring.\nThe inverse transform includes n^-1.\n",
    "polynomials.py": "a = [1, 2, 3, 4]\nb = [5, 6, 7, 8]\nq = 17\nn = 4\n",
    "q-settings.txt": "q = 3329\nq - 1 = 3328 = 2^8 * 13\nfull negacyclic NTT size 256 needs a 512th root\n",
    "ntt-tests.txt": "round_trip: ok\nnegacyclic_matches_schoolbook: ok\nknown_answer: ok\n",
    "convolution.txt": "forward: [10, 10, 4, 8]\ninverse: [1, 2, 3, 4]\n",
  }, "Practise reading polynomial and transform fixtures."),
  fixture("ml-kem", "student", {
    "README.txt": "ML-KEM fixtures\nEncapsulation returns a ciphertext and a 32-byte secret.\nTampered ciphertexts produce implicit rejection.\n",
    "manifest.json": '{\n  "algorithm": "ML-KEM-768",\n  "encapsulation_key": 1184,\n  "ciphertext": 1088,\n  "shared_secret": 32\n}\n',
    "key-sizes.txt": "ML-KEM-512: ek=800 ct=768\nML-KEM-768: ek=1184 ct=1088\nML-KEM-1024: ek=1568 ct=1568\n",
    "ct-bad.bin": "simulated ciphertext\nbyte 512 changed\nre-encryption mismatch\n",
    "result.txt": "honest: shared secrets match\ntampered: shared secrets differ, no error returned\n",
  }, "Practise reading ML-KEM sizes and rejection fixtures."),
  fixture("ml-dsa", "student", {
    "README.txt": "ML-DSA fixtures\nSign the exact manifest bytes.\nChanging one byte must invalidate verification.\n",
    "manifest.txt": "firmware: router-4\nversion: 2026.11\nrelease: production\n",
    "key-sizes.txt": "ML-DSA-44: pk=1312 sig=2420\nML-DSA-65: pk=1952 sig=3309\nML-DSA-87: pk=2592 sig=4627\n",
    "verification.txt": "original: Signature Verified Successfully\ntampered: Signature Verification Failure\n",
  }, "Practise reading ML-DSA signature and size fixtures."),
  fixture("slh-dsa", "student", {
    "README.txt": "SLH-DSA fixtures\nStateless does not mean the one-time property disappears.\nCompare signature size and signing time.\n",
    "release.bin": "simulated firmware release\nversion: 2026.11\n",
    "key-sizes.txt": "SLH-DSA-SHA2-128s: pk=32 sig=7856\nSLH-DSA-SHA2-128f: pk=32 sig=17088\n",
    "wots-chain.txt": "node0: toy-secret\nnode1: 8f14e45f\nnode2: c9f0f895\nnode3: 45c48cce\nnode4: d3d94468\n",
    "timing.txt": "signing: 0.842s\nverification: 0.004s\n",
  }, "Practise reading SLH-DSA cost and one-time-chain fixtures."),
  fixture("side-channel", "engineer", {
    "README.txt": "Side-channel fixtures\nControl the environment and vary one secret at a time.\nStructural tests cannot prove the absence of all leakage.\n",
    "traces/timing.csv": "secret,median_cycles,p95_cycles\n0x00,412,438\n0xff,487,522\n",
    "traces/cachegrind.txt": "I refs: 1204338\nD1 misses: 12881\nLLd misses: 91204\nsbox_lookup: 88410 LLd misses\n",
    "victim.c": "uint8_t sbox_lookup(uint8_t secret) {\n  return table[secret];\n}\n",
    "ct-checks.txt": "branchless_select: ok\nno_secret_index: ok\n",
  }, "Practise reading timing, cache and constant-time fixtures."),
];

export const LINUX_LABS = Object.fromEntries(LABS.map((lab) => [lab.slug, lab])) as Record<string, LinuxLabFixture>;

export function getLinuxLab(slug: string): LinuxLabFixture | undefined {
  return LINUX_LABS[slug];
}

export const SHELL_SKILLS = [
  { id: "navigate", label: "Navigate", detail: "pwd · ls · cd" },
  { id: "read", label: "Read", detail: "cat · head · tail · wc" },
  { id: "search", label: "Search", detail: "grep · find" },
  { id: "inspect", label: "Inspect", detail: "file · sha256sum · stat" },
  { id: "modify", label: "Modify", detail: "mkdir · touch · rm · cp · mv · >" },
  { id: "pipes", label: "Pipe", detail: "command | command" },
];
