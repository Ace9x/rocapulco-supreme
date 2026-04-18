import { useState } from "react";
import { supabase } from "../lib/supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) setError(err.message);
  };

  return (
    <div className="layout" style={{ maxWidth: 400, marginTop: 80 }}>
      <div className="brand" style={{ textAlign: "center", marginBottom: 32 }}>ROCAPULCO</div>
      <div className="muted" style={{ textAlign: "center", marginBottom: 24 }}>Dispatch</div>

      <form className="card" onSubmit={submit}>
        <label className="muted" style={{ fontSize: 12 }}>Email</label>
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="muted" style={{ fontSize: 12, marginTop: 16, display: "block" }}>Password</label>
        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error ? <div className="error">{error}</div> : null}

        <button type="submit" style={{ width: "100%", marginTop: 16 }} disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
