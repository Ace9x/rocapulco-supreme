import { useState } from "react";
import { supabase } from "../lib/supabase";

export function Login() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

  const sendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const { error: err } = await supabase.auth.signInWithOtp({ phone });
        setSubmitting(false);
        if (err) { setError(err.message); return; }
        setStep("otp");
  };

  const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const { error: err } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
        setSubmitting(false);
        if (err) setError(err.message);
  };

  return (
        <div className="layout" style={{ maxWidth: 400, marginTop: 80 }}>
                <div className="brand" style={{ textAlign: "center", marginBottom: 32 }}>ROCAPULCO</div>div>
                <div className="muted" style={{ textAlign: "center", marginBottom: 24 }}>Dispatch</div>div>
          {step === "phone" ? (
                  <form className="card" onSubmit={sendOtp}>
                              <label className="muted" style={{ fontSize: 12 }}>Phone (E.164 format)</label>label>
                              <input
                                            type="tel"
                                            placeholder="+18028291880"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                          />
                    {error ? <div className="error">{error}</div>div> : null}
                            <button type="submit" style={{ width: "100%", marginTop: 16 }} disabled={submitting}>
                              {submitting ? "Sending…" : "Send code"}
                            </button>button>
                  </form>form>
                ) : (
                  <form className="card" onSubmit={verifyOtp}>
                            <label className="muted" style={{ fontSize: 12 }}>Enter the code sent to {phone}</label>label>
                            <input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="123456"
                                          value={otp}
                                          onChange={(e) => setOtp(e.target.value)}
                                        />
                    {error ? <div className="error">{error}</div>div> : null}
                            <button type="submit" style={{ width: "100%", marginTop: 16 }} disabled={submitting}>
                              {submitting ? "Verifying…" : "Sign in"}
                            </button>button>
                            <button type="button" style={{ width: "100%", marginTop: 8, background: "transparent", color: "#888" }} onClick={() => setStep("phone")}>
                                        ← Back
                            </button>button>
                  </form>form>
              )}
        </div>div>
      );
}</div>
