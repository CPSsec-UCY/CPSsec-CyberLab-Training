"use client";

import { useState } from "react";
import { ArrowRight, Fingerprint, KeyRound, MonitorSmartphone, Server, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type SettingKey = "redirectValidation" | "pkce" | "audienceCheck" | "stateNonce";

interface Settings {
  redirectValidation: boolean;
  pkce: boolean;
  audienceCheck: boolean;
  stateNonce: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  redirectValidation: true,
  pkce: true,
  audienceCheck: true,
  stateNonce: true,
};

const CLIENT_ID = "northstar-client";
const REGISTERED_REDIRECT = "https://app.example.test/callback";
const UNREGISTERED_REDIRECT = "https://collector.example.test/callback";
const ISSUER = "https://id.example.test";
const EXPECTED_AUDIENCE = CLIENT_ID;
const TOKEN_AUDIENCE = "other-client.example.test";
const EXPECTED_NONCE = "nonce-29";
const TOKEN_NONCE = "nonce-unbound";
const ACCESS_TOKEN = "toy-access-token-7f3a";
const REFERENCE_TIME = 1999996400;
const EXPIRATION_TIME = 2000000000;

const STAGES = [
  { name: "Authorise", title: "Authorization request", actors: "Relying party → authorization server", detail: "The relying party starts authorization code flow with PKCE. It creates state, nonce and a high-entropy verifier locally." },
  { name: "Code", title: "Authorization response", actors: "Authorization server → browser → relying party", detail: "After authentication and consent, the authorization server returns a short-lived, one-use authorization code." },
  { name: "Exchange", title: "Token exchange", actors: "Relying party ↔ authorization server", detail: "The relying party redeems the code over a protected back-channel and proves possession of the PKCE verifier." },
  { name: "Inspect", title: "ID token inspection", actors: "Relying party validates the token response", detail: "A verified signature is necessary but insufficient. The relying party checks issuer, audience, expiry and nonce against this transaction." },
  { name: "Call API", title: "Resource request", actors: "Relying party → reports API", detail: "The API receives the access token. It validates the token for itself and authorises the subject, scope and report object." },
  { name: "Decide", title: "Accept or reject", actors: "Relying party and resource server", detail: "The flow completes only when browser binding, code protection, token validation and replay policy all succeed." },
];

const ACTORS = [
  { name: "Resource owner", detail: "Person approving access", icon: UserRound },
  { name: "Relying party", detail: "Northstar web client", icon: MonitorSmartphone },
  { name: "Authorization server", detail: "Example identity provider", icon: KeyRound },
  { name: "Reports API", detail: "Protected resource server", icon: Server },
];

const ACTIVE_ACTORS = [
  [0, 1, 2],
  [1, 2],
  [1, 2],
  [1],
  [1, 3],
  [1, 3],
];

function SettingToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-emerald-600" />
      {label}
    </label>
  );
}

export function IdentityFlowLab() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [tokenReplay, setTokenReplay] = useState(false);
  const [stage, setStage] = useState(0);

  const redirect = settings.redirectValidation ? REGISTERED_REDIRECT : UNREGISTERED_REDIRECT;
  const audience = settings.audienceCheck ? EXPECTED_AUDIENCE : TOKEN_AUDIENCE;
  const nonce = settings.stateNonce ? EXPECTED_NONCE : TOKEN_NONCE;
  const audienceMatch = settings.audienceCheck && audience === EXPECTED_AUDIENCE;
  const nonceMatch = settings.stateNonce && nonce === EXPECTED_NONCE;
  const canIssueTokens = settings.redirectValidation && settings.pkce;
  const blockingFailure = !canIssueTokens || tokenReplay;
  const insecureAcceptance = !settings.audienceCheck || !settings.stateNonce;
  const accepted = !blockingFailure;
  const failures = [
    ...(!settings.redirectValidation ? ["Unregistered redirect URI accepted; code exposed to a toy collector."] : []),
    ...(!settings.pkce ? ["PKCE omitted; the observing adversary redeems the code without a verifier."] : []),
    ...(!settings.audienceCheck ? ["Audience validation disabled; an ID token for another client is accepted."] : []),
    ...(!settings.stateNonce ? ["State and nonce omitted; login CSRF and token substitution are not bound to this transaction."] : []),
    ...(tokenReplay ? ["The gateway detects a reused token identifier and rejects the replayed API call."] : []),
  ];
  const decision = tokenReplay
    ? "Rejected · token replay"
    : !settings.redirectValidation
      ? "Rejected · redirect not registered"
      : !settings.pkce
        ? "Rejected · intercepted code redeemed"
        : insecureAcceptance
          ? "Accepted · client checks bypassed"
          : "Accepted · transaction bound";
  const enabledCount = Object.values(settings).filter(Boolean).length;

  function setSetting(key: SettingKey, checked: boolean) {
    setSettings((current) => ({ ...current, [key]: checked }));
  }

  function reset() {
    setSettings(DEFAULT_SETTINGS);
    setTokenReplay(false);
    setStage(0);
  }

  const stageMessages = [
    settings.redirectValidation && settings.pkce && settings.stateNonce
      ? "The request uses the exact registered callback, S256 PKCE, state and nonce."
      : "At least one browser-binding control is absent. The request still looks ordinary to the user.",
    !settings.redirectValidation
      ? "The code is delivered to an unregistered collector URI. Exact redirect validation would have rejected this request."
      : settings.pkce
        ? "The code returns to the exact registered callback. A toy observer can copy it, but PKCE prevents redemption without the verifier."
        : "The code returns to the exact registered callback, but PKCE is absent. The toy observer can redeem the copied code without a verifier.",
    !settings.redirectValidation
      ? "The legitimate relying party never received the code, so it cannot complete the exchange."
      : settings.pkce
        ? "The authorization server recomputes S256(code_verifier), matches the challenge, consumes the code once and issues tokens."
        : "The observing adversary redeems the intercepted code without a verifier. The legitimate client's later exchange fails because the code is already used.",
    !canIssueTokens
      ? "No legitimate token response was obtained, so there is no token for the relying party to inspect."
      : audienceMatch && nonceMatch
        ? "The signature, issuer, audience, expiry and nonce checks all pass for this authorization transaction."
        : "The relying party skips at least one binding check. A valid signature does not repair a wrong audience or an unbound nonce.",
    !canIssueTokens
      ? "The legitimate relying party has no access token, so it cannot make this API call. The adversary's earlier redemption does not create a valid client session."
      : tokenReplay
        ? "The API sees a previously consumed jti in its gateway replay cache and rejects the repeated bearer token."
        : "The API accepts the access token for its own audience, checks reports.read and authorises report 42 for the subject.",
    accepted
      ? insecureAcceptance
        ? "The API call can complete, but the relying party accepted an ID token without all client and transaction checks. This is an insecure acceptance, not a safe flow."
        : "All modelled checks pass: exact redirect, S256 PKCE, state, nonce, ID token audience, API audience and replay policy."
      : failures[0] ?? "A modelled check failed and the flow stops.",
  ];

  return (
    <VisualizerShell
      title="OIDC authorization code + PKCE flow"
      description="Safe protocol simulation with toy codes, tokens and identifiers. Advance the flow, disable a control, then inspect the decision."
      onReset={reset}
      controls={
        <button
          type="button"
          onClick={() => setStage((value) => Math.min(value + 1, STAGES.length - 1))}
          disabled={stage === STAGES.length - 1}
          className="btn-primary px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next step <ArrowRight className="h-3 w-3" />
        </button>
      }
      footer={
        <span>
          <strong className="text-navy">Safe simulation.</strong> No token is signed, issued, redeemed or sent anywhere. The replay case models a gateway that records token identifiers; signature checking alone cannot make a bearer access token one-use. <strong>WebAuthn/passkey comparison:</strong> WebAuthn registers a public-key credential and later signs a challenge bound to the relying party and origin. OIDC can federate that authentication result, while OAuth delegates API access. Passkeys may be synced or device-bound, and user verification affects assurance; neither replaces resource-server authorisation.
        </span>
      }
    >
      <div className="rounded-xl border border-gold-200 bg-gold-50 px-3 py-2 text-[10px] font-semibold leading-5 text-gold-900">
        Toy flow · example.test names only · no real credentials, redirects or network requests.
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Flow steps">
        {STAGES.map((item, index) => (
          <StepButton key={item.name} active={stage === index} done={index < stage} onClick={() => setStage(index)}>
            {item.name}
          </StepButton>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-line bg-mist-50 p-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Threat and defence controls · on means enforced</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <SettingToggle label="Redirect URI validation" checked={settings.redirectValidation} onChange={(checked) => setSetting("redirectValidation", checked)} />
          <SettingToggle label="PKCE S256" checked={settings.pkce} onChange={(checked) => setSetting("pkce", checked)} />
          <SettingToggle label="Audience check" checked={settings.audienceCheck} onChange={(checked) => setSetting("audienceCheck", checked)} />
          <SettingToggle label="State + nonce" checked={settings.stateNonce} onChange={(checked) => setSetting("stateNonce", checked)} />
          <SettingToggle label="Replay access token" checked={tokenReplay} onChange={setTokenReplay} />
        </div>
        <p className="mt-2 text-[9px] leading-4 text-muted">Disabling a defence does not change what the adversary sends; it changes whether the receiver rejects it. The replay toggle models an adversary action, with a gateway replay cache enabled.</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ACTORS.map((actor, index) => {
          const Icon = actor.icon;
          const active = ACTIVE_ACTORS[stage].includes(index);
          return (
            <div key={actor.name} className={`rounded-xl border p-3 transition ${active ? "border-brand-300 bg-brand-50" : "border-line bg-white opacity-70"}`}>
              <Icon className={`h-4 w-4 ${active ? "text-brand-600" : "text-muted"}`} />
              <p className="mt-1.5 text-[11px] font-bold text-navy">{actor.name}</p>
              <p className="mt-0.5 text-[9px] text-muted">{actor.detail}</p>
              <p className={`mt-2 text-[8px] font-bold uppercase tracking-[0.1em] ${active ? "text-brand-700" : "text-muted"}`}>{active ? "Active in this step" : "Waiting"}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[10px] font-semibold text-brand-800">
        <ArrowRight className="h-3.5 w-3.5 shrink-0" /> {STAGES[stage].actors}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Step {stage + 1} · {STAGES[stage].title}</p>
          <p className="mt-2 text-[11px] leading-5 text-body">{STAGES[stage].detail}</p>

          {stage === 0 ? (
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-navy p-3 font-mono text-[9px] leading-5 text-mist-100"><code>{`GET ${ISSUER}/authorize\n  response_type=code\n  client_id=${CLIENT_ID}\n  redirect_uri=${redirect}\n  scope=openid profile reports.read\n  ${settings.stateNonce ? "state=state-84&nonce=nonce-29" : "state=(omitted)&nonce=(omitted)"}\n  ${settings.pkce ? "code_challenge=SHA256(toy-verifier)&code_challenge_method=S256" : "code_challenge=(omitted)"}`}</code></pre>
          ) : null}

          {stage === 1 ? (
            <div className="mt-3 rounded-lg border border-line bg-mist-50 p-3 font-mono text-[9px] leading-5 text-navy">
              <p>HTTP/1.1 302 Found</p>
              <p className="mt-1 break-all">Location: {redirect}?code=toy-code-7f3a{settings.stateNonce ? "&state=state-84" : ""}</p>
              <p className="mt-2 text-muted">Toy observer: copied code=toy-code-7f3a</p>
            </div>
          ) : null}

          {stage === 2 ? (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-line bg-mist-50 p-3 font-mono text-[9px] leading-5 text-navy">
                <p>POST /token</p>
                <p>grant_type=authorization_code&amp;code=toy-code-7f3a</p>
                <p>redirect_uri={redirect}</p>
                <p>client_id={CLIENT_ID}</p>
                <p>{settings.pkce ? "code_verifier=toy-high-entropy-verifier" : "code_verifier=(omitted)"}</p>
              </div>
              <p className={`rounded-lg border p-2.5 text-[10px] leading-5 ${!settings.redirectValidation || !settings.pkce ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
                {stageMessages[2]}
              </p>
            </div>
          ) : null}

          {stage === 3 ? (
            <div className="mt-3 rounded-lg border border-line bg-mist-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{canIssueTokens ? "Toy ID token payload · signature already verified" : "Token inspection unavailable"}</p>
              {canIssueTokens ? (
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[9px] leading-5 text-navy"><code>{`{\n  "iss": "${ISSUER}",\n  "sub": "user-204",\n  "aud": "${audience}",\n  "exp": ${EXPIRATION_TIME},\n  "iat": ${REFERENCE_TIME},\n  "nonce": "${nonce}"\n}`}</code></pre>
              ) : (
                <p className="mt-2 text-[10px] leading-5 text-rose-800">The code exchange did not produce a legitimate token response. The claim table below remains available as a separate validation exercise.</p>
              )}
            </div>
          ) : null}

          {stage === 4 ? (
            <div className="mt-3 rounded-lg border border-line bg-navy p-3 font-mono text-[9px] leading-5 text-mist-100">
              <p>GET /reports/42 HTTP/1.1</p>
              <p>Host: reports-api.example.test</p>
              <p className="break-all">{canIssueTokens ? `Authorization: Bearer ${ACCESS_TOKEN}` : "Authorization: (absent · token issuance failed)"}</p>
              {canIssueTokens ? <p className="mt-2 text-mist-300">access token: aud=reports-api · scope=reports.read · jti=token-42</p> : null}
              {canIssueTokens && tokenReplay ? <p className="mt-2 font-bold text-rose-300">Gateway replay cache: jti token-42 already consumed</p> : null}
            </div>
          ) : null}

          {stage === 5 ? (
            <div className={`mt-3 rounded-xl border p-3 ${accepted ? "border-gold-200 bg-gold-50 text-gold-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]">Final decision · {decision}</p>
              {failures.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {failures.map((failure) => (
                    <li key={failure} className="flex items-start gap-2 text-[10px] leading-5"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />{failure}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[11px] leading-5">No modelled failure. The resource server still performs subject, scope and object-level authorisation for report 42.</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-mist-50 p-3" aria-live="polite">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Current step outcome</p>
            <p className="mt-2 text-[10px] leading-5 text-body">{stageMessages[stage]}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Flow controls" value={`${enabledCount} / 4`} tone={enabledCount === 4 ? "teal" : "gold"} />
            <Metric label="PKCE" value={settings.pkce ? "S256" : "Absent"} tone={settings.pkce ? "teal" : "rose"} />
            <Metric label="ID token binding" value={audienceMatch && nonceMatch ? "Valid" : "Bypassed"} tone={audienceMatch && nonceMatch ? "teal" : "rose"} />
            <Metric label="API replay" value={tokenReplay ? "Blocked" : "First use"} tone={tokenReplay ? "coral" : "teal"} />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">JWT claim inspection · ID token</p>
          <span className="text-[9px] text-muted">Reference time {REFERENCE_TIME} · signature verified with toy JWKS</span>
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[10px]">
            <thead className="text-muted">
              <tr><th className="py-1.5 pr-3">Claim</th><th className="py-1.5 pr-3">Expected</th><th className="py-1.5 pr-3">Received</th><th className="py-1.5">Result</th></tr>
            </thead>
            <tbody>
              <tr className="border-t border-line"><td className="py-2 pr-3 font-mono font-bold">iss</td><td className="py-2 pr-3 font-mono">{ISSUER}</td><td className="py-2 pr-3 font-mono">{ISSUER}</td><td className="py-2 font-semibold text-emerald-700">Match</td></tr>
              <tr className="border-t border-line"><td className="py-2 pr-3 font-mono font-bold">aud</td><td className="py-2 pr-3 font-mono">{EXPECTED_AUDIENCE}</td><td className="py-2 pr-3 font-mono">{audience}</td><td className={`py-2 font-semibold ${audienceMatch ? "text-emerald-700" : "text-rose-700"}`}>{audienceMatch ? "Match" : "Bypassed"}</td></tr>
              <tr className="border-t border-line"><td className="py-2 pr-3 font-mono font-bold">exp</td><td className="py-2 pr-3 font-mono">After {REFERENCE_TIME}</td><td className="py-2 pr-3 font-mono">{EXPIRATION_TIME}</td><td className="py-2 font-semibold text-emerald-700">Valid</td></tr>
              <tr className="border-t border-line"><td className="py-2 pr-3 font-mono font-bold">nonce</td><td className="py-2 pr-3 font-mono">{EXPECTED_NONCE}</td><td className="py-2 pr-3 font-mono">{nonce}</td><td className={`py-2 font-semibold ${nonceMatch ? "text-emerald-700" : "text-rose-700"}`}>{nonceMatch ? "Match" : "Bypassed"}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={`mt-3 flex items-start gap-2 rounded-xl border p-3 ${accepted && !insecureAcceptance ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`} aria-live="polite">
        {accepted && !insecureAcceptance ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
        <div className="text-[10px] leading-5">
          <strong>{stage === STAGES.length - 1 ? decision : `Decision preview · ${decision}`}.</strong>{" "}
          {stage === STAGES.length - 1 ? stageMessages[5] : "Advance to Decide for the complete accept/reject result."}
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-[10px] leading-5 text-brand-900">
        <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <span><strong>Passkey comparison:</strong> WebAuthn proves possession of a registered public-key credential with an origin-bound challenge. OIDC authenticates a user and carries claims; OAuth grants scoped delegated access. A passkey can strengthen the authentication step, but the API must still validate its token and authorise the requested object.</span>
      </div>
    </VisualizerShell>
  );
}
