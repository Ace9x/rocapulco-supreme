import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// ROCAPULCO SUPREME — Premium Ride-Hailing App
// Built to CRUSH Uber & Lyft in Far Rockaway
// ═══════════════════════════════════════════════════════

const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8d48b";
const GOLD_DARK = "#8b6914";
const BG_DARK = "#0a0a0a";
const BG_CARD = "#141414";
const BG_CARD_HOVER = "#1a1a1a";
const BORDER = "#2a2a2a";
const TEXT = "#f5f0e1";
const TEXT_DIM = "#8a8272";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

// ── Simulated Data ────────────────────────────────────
const DRIVERS = [
  { id: 1, name: "Jason M.", car: "2024 Cadillac Escalade", plate: "NYC-7100", rating: 4.9, rides: 2847, status: "online", lat: 40.5920, lng: -73.7654, avatar: "🧑‍✈️", eta: 4 },
  { id: 2, name: "Carlos R.", car: "2023 Cadillac XT5", plate: "NYC-4444", rating: 4.8, rides: 1923, status: "on-ride", lat: 40.5985, lng: -73.7510, avatar: "👨‍✈️", eta: 7 },
  { id: 3, name: "Mike T.", car: "2024 Lincoln Navigator", plate: "NYC-3274", rating: 5.0, rides: 3156, status: "online", lat: 40.5870, lng: -73.7800, avatar: "🧔", eta: 3 },
  { id: 4, name: "David L.", car: "2023 Cadillac CT5", plate: "NYC-1167", rating: 4.7, rides: 987, status: "online", lat: 40.6010, lng: -73.7420, avatar: "👱", eta: 8 },
  { id: 5, name: "Roberto Jr.", car: "2024 Cadillac Escalade ESV", plate: "NYC-0001", rating: 5.0, rides: 5241, status: "on-ride", lat: 40.5950, lng: -73.7560, avatar: "👨‍💼", eta: 12 },
  { id: 6, name: "Anthony P.", car: "2023 Chrysler 300", plate: "NYC-8822", rating: 4.9, rides: 1456, status: "offline", lat: 40.5890, lng: -73.7700, avatar: "🧑", eta: 0 },
];

const POPULAR_DESTINATIONS = [
  { name: "JFK Airport", address: "JFK Airport Terminal 4", fare: "$45.00", time: "25 min" },
  { name: "Rockaway Beach", address: "Beach 116th St", fare: "$8.00", time: "5 min" },
  { name: "Cross Bay Plaza", address: "160-10 Cross Bay Blvd", fare: "$12.00", time: "8 min" },
  { name: "Peninsula Hospital", address: "51-15 Beach Channel Dr", fare: "$10.00", time: "7 min" },
  { name: "Gateway Mall", address: "Gateway Center, Brooklyn", fare: "$28.00", time: "20 min" },
  { name: "LaGuardia Airport", address: "LaGuardia Airport", fare: "$55.00", time: "35 min" },
];

const RIDE_HISTORY = [
  { id: 1, date: "Apr 9, 2026", pickup: "1614 Mott Ave", dropoff: "JFK Terminal 4", fare: "$45.00", driver: "Jason M.", rating: 5, status: "completed", payment: "card" },
  { id: 2, date: "Apr 8, 2026", pickup: "Beach 116th St", dropoff: "Cross Bay Plaza", fare: "$12.00", driver: "Carlos R.", rating: 5, status: "completed", payment: "cash" },
  { id: 3, date: "Apr 7, 2026", pickup: "Arverne by the Sea", dropoff: "Fairmont Hotel", fare: "$15.00", driver: "Mike T.", rating: 5, status: "completed", payment: "zelle" },
  { id: 4, date: "Apr 6, 2026", pickup: "Beach 98th St", dropoff: "Gateway Mall", fare: "$28.00", driver: "Roberto Jr.", rating: 4, status: "completed", payment: "venmo" },
];

const PENDING_RIDES = [
  { id: 101, rider: "Maria S.", pickup: "123 Beach Dr", dropoff: "456 Ocean Pkwy", fare: "$35.50", status: "pending", time: "2 min ago" },
  { id: 102, rider: "James W.", pickup: "1614 Mott Ave", dropoff: "JFK Terminal 4", fare: "$45.00", status: "pending", time: "1 min ago" },
  { id: 103, rider: "Lisa K.", pickup: "Beach 116th St", dropoff: "Cross Bay Plaza", fare: "$12.00", status: "assigned", driver: "Jason M.", time: "3 min ago" },
  { id: 104, rider: "Tom R.", pickup: "Arverne by the Sea", dropoff: "Peninsula Hospital", fare: "$10.00", status: "pending", time: "Just now" },
  { id: 105, rider: "Sarah H.", pickup: "Beach 98th St", dropoff: "LaGuardia Airport", fare: "$55.00", status: "assigned", driver: "Carlos R.", time: "5 min ago" },
];

// ── Icon Components ───────────────────────────────────
const Icon = ({ type, size = 20, color = GOLD }) => {
  const s = { width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" };
  const icons = {
    car: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z"/></svg>,
    pin: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    phone: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>,
    nav: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>,
    cash: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
    card: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
    zelle: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>,
    venmo: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
    menu: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
    back: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
    user: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    map: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/></svg>,
    settings: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.2.65.77 1.1 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    home: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
    history: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
    waze: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
    dispatch: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    earnings: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    send: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  };
  return icons[type] || null;
};

// ── Gold Gradient Text ────────────────────────────────
const GoldText = ({ children, style = {}, as = "span" }) => {
  const Tag = as;
  return (
    <Tag style={{
      background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DARK} 100%)`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      backgroundClip: "text", ...style
    }}>{children}</Tag>
  );
};

// ── Decorative Divider ────────────────────────────────
const GoldDivider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0" }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}44)` }} />
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, opacity: 0.5 }} />
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}44, transparent)` }} />
  </div>
);

// ── Button Component ──────────────────────────────────
const GoldButton = ({ children, onClick, full, variant = "primary", style: extraStyle = {}, disabled }) => {
  const [hovered, setHovered] = useState(false);
  const base = {
    padding: "14px 28px", borderRadius: 12, fontWeight: 700, fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "all 0.3s ease",
    width: full ? "100%" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "'Georgia', serif", letterSpacing: "0.5px", opacity: disabled ? 0.5 : 1,
  };
  const styles = {
    primary: {
      ...base,
      background: hovered ? `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` : `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
      color: BG_DARK, boxShadow: hovered ? `0 8px 32px ${GOLD}44` : `0 4px 16px ${GOLD}22`,
      transform: hovered ? "translateY(-1px)" : "none",
    },
    outline: {
      ...base,
      background: hovered ? `${GOLD}15` : "transparent",
      color: GOLD, border: `1.5px solid ${hovered ? GOLD : GOLD + "66"}`,
    },
    ghost: { ...base, background: hovered ? `${GOLD}10` : "transparent", color: GOLD },
    danger: {
      ...base,
      background: hovered ? RED : `${RED}22`,
      color: hovered ? "#fff" : RED, border: `1.5px solid ${RED}44`,
    },
  };
  return (
    <button style={{ ...styles[variant], ...extraStyle }} onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} disabled={disabled}>
      {children}
    </button>
  );
};

// ── Card Component ────────────────────────────────────
const Card = ({ children, style = {}, glow, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? BG_CARD_HOVER : BG_CARD, borderRadius: 16, padding: 20,
        border: `1px solid ${hovered ? GOLD + "44" : BORDER}`,
        boxShadow: glow && hovered ? `0 0 30px ${glow}33, inset 0 0 30px ${glow}08` : "none",
        transition: "all 0.3s ease", cursor: onClick ? "pointer" : "default", ...style,
      }}>
      {children}
    </div>
  );
};

// ── Stat Badge ────────────────────────────────────────
const StatBadge = ({ icon, value, label }) => (
  <div style={{ textAlign: "center", flex: 1 }}>
    <div style={{ marginBottom: 4 }}><Icon type={icon} size={24} /></div>
    <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, fontFamily: "'Georgia', serif" }}>{value}</div>
    <div style={{ fontSize: 12, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
  </div>
);

// ── Status Pill ───────────────────────────────────────
const StatusPill = ({ status }) => {
  const colors = { pending: [GOLD, BG_DARK], assigned: [BLUE, "#fff"], "on-ride": [GREEN, "#fff"], completed: [GREEN, "#fff"], online: [GREEN, "#fff"], offline: [RED, "#fff"] };
  const [bg, fg] = colors[status] || [BORDER, TEXT];
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: 1, background: bg + "22", color: bg, border: `1px solid ${bg}44`,
    }}>{status}</span>
  );
};

// ── Simulated Map Component ───────────────────────────
const SimulatedMap = ({ drivers, highlight, compact }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const cw = w / 2, ch = h / 2;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, cw, ch);

      // Grid roads
      ctx.strokeStyle = "#1a2332";
      ctx.lineWidth = 1;
      for (let i = 0; i < cw; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, ch); ctx.stroke();
      }
      for (let i = 0; i < ch; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(cw, i); ctx.stroke();
      }

      // Main roads
      ctx.strokeStyle = "#1e3a5f";
      ctx.lineWidth = 3;
      // Beach Channel Dr
      ctx.beginPath(); ctx.moveTo(0, ch * 0.4); ctx.lineTo(cw, ch * 0.35); ctx.stroke();
      // Rockaway Beach Blvd
      ctx.beginPath(); ctx.moveTo(0, ch * 0.6); ctx.lineTo(cw, ch * 0.55); ctx.stroke();
      // Cross Bay Blvd
      ctx.beginPath(); ctx.moveTo(cw * 0.4, 0); ctx.lineTo(cw * 0.35, ch); ctx.stroke();
      // Mott Ave
      ctx.beginPath(); ctx.moveTo(cw * 0.7, 0); ctx.lineTo(cw * 0.65, ch); ctx.stroke();

      // Water effect (Jamaica Bay)
      ctx.fillStyle = "#0a1628";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cw * 0.15, 0);
      for (let x = cw * 0.15; x < cw; x += 20) {
        ctx.lineTo(x, ch * 0.15 + Math.sin(x * 0.02 + frame * 0.02) * 8);
      }
      ctx.lineTo(cw, 0);
      ctx.fill();

      // Beach / Ocean
      ctx.fillStyle = "#0a1628";
      ctx.beginPath();
      ctx.moveTo(0, ch);
      for (let x = 0; x <= cw; x += 15) {
        ctx.lineTo(x, ch * 0.78 + Math.sin(x * 0.03 + frame * 0.015) * 5);
      }
      ctx.lineTo(cw, ch);
      ctx.fill();

      // Road labels
      ctx.font = "9px Georgia";
      ctx.fillStyle = "#2a4a6a";
      ctx.fillText("BEACH CHANNEL DR", 10, ch * 0.38);
      ctx.fillText("ROCKAWAY BEACH BLVD", 10, ch * 0.58);
      ctx.fillText("CROSS BAY", cw * 0.36, 20);
      ctx.fillText("MOTT AVE", cw * 0.66, 20);

      // Base location
      const baseX = cw * 0.5, baseY = ch * 0.45;
      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.arc(baseX, baseY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BG_DARK;
      ctx.beginPath(); ctx.arc(baseX, baseY, 4, 0, Math.PI * 2); ctx.fill();
      // Pulse
      const pulse = (Math.sin(frame * 0.05) + 1) * 0.5;
      ctx.strokeStyle = GOLD + Math.round(pulse * 80).toString(16).padStart(2, "0");
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(baseX, baseY, 12 + pulse * 10, 0, Math.PI * 2); ctx.stroke();
      ctx.font = "bold 9px Georgia";
      ctx.fillStyle = GOLD;
      ctx.fillText("ROCAPULCO HQ", baseX + 14, baseY + 4);

      // Draw drivers
      drivers.forEach((d, i) => {
        const dx = cw * (0.2 + (d.lng + 73.8) * 8) + Math.sin(frame * 0.02 + i) * 3;
        const dy = ch * (0.2 + (40.61 - d.lat) * 15) + Math.cos(frame * 0.025 + i) * 2;
        const isOnRide = d.status === "on-ride";
        const isHighlight = highlight === d.id;
        const color = d.status === "offline" ? "#555" : isOnRide ? BLUE : GREEN;

        if (isHighlight) {
          ctx.fillStyle = color + "22";
          ctx.beginPath(); ctx.arc(dx, dy, 20 + pulse * 8, 0, Math.PI * 2); ctx.fill();
        }

        // Car icon
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(dx, dy, isHighlight ? 7 : 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${isHighlight ? 8 : 7}px sans-serif`;
        ctx.fillText("🚗", dx - 5, dy + 3);

        if (isHighlight || !compact) {
          ctx.font = "bold 8px Georgia";
          ctx.fillStyle = color;
          ctx.fillText(d.name, dx + 10, dy - 2);
          ctx.font = "7px Georgia";
          ctx.fillStyle = TEXT_DIM;
          ctx.fillText(d.status.toUpperCase(), dx + 10, dy + 8);
        }
      });

      // Legend
      if (!compact) {
        const ly = ch - 25;
        ctx.font = "9px Georgia";
        ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(cw - 120, ly, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#aaa"; ctx.fillText("ONLINE", cw - 112, ly + 3);
        ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(cw - 60, ly, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#aaa"; ctx.fillText("ON-RIDE", cw - 52, ly + 3);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [drivers, highlight, compact]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 12 }} />;
};

// ═══════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════

// ── RIDER VIEW ────────────────────────────────────────
const RiderView = ({ onBook, setView }) => {
  const [pickup, setPickup] = useState("1614 Mott Ave, Far Rockaway");
  const [dropoff, setDropoff] = useState("");
  const [selectedDest, setSelectedDest] = useState(null);
  const [payment, setPayment] = useState("card");
  const [step, setStep] = useState("book"); // book, confirm, tracking, complete
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (step === "tracking") {
      const interval = setInterval(() => {
        setTrackingProgress(p => {
          if (p >= 100) { clearInterval(interval); setStep("complete"); return 100; }
          return p + 2;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleConfirm = () => {
    setAssignedDriver(DRIVERS[2]); // Mike T. - nearest
    setStep("tracking");
  };

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: "cash", glow: GREEN, desc: "Pay driver directly" },
    { id: "card", label: "Card", icon: "card", glow: BLUE, desc: "Secure payment" },
    { id: "zelle", label: "Zelle", icon: "zelle", glow: PURPLE, desc: "Bank transfer" },
    { id: "venmo", label: "Venmo", icon: "venmo", glow: "#008CFF", desc: "Mobile payment" },
  ];

  if (showHistory) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div onClick={() => setShowHistory(false)} style={{ cursor: "pointer" }}><Icon type="back" /></div>
          <GoldText style={{ fontSize: 22, fontWeight: 800 }}>Ride History</GoldText>
        </div>
        {RIDE_HISTORY.map(r => (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ color: TEXT_DIM, fontSize: 12 }}>{r.date}</div>
                <div style={{ color: TEXT, fontSize: 14, fontWeight: 600, marginTop: 4 }}>{r.pickup}</div>
                <div style={{ color: GOLD, fontSize: 13 }}>→ {r.dropoff}</div>
                <div style={{ color: TEXT_DIM, fontSize: 12, marginTop: 4 }}>Driver: {r.driver} · {r.payment}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: GOLD, fontSize: 18, fontWeight: 800, fontFamily: "'Georgia', serif" }}>{r.fare}</div>
                <div style={{ display: "flex", gap: 2, marginTop: 4, justifyContent: "flex-end" }}>
                  {[...Array(r.rating)].map((_, i) => <Icon key={i} type="star" size={12} />)}
                </div>
                <StatusPill status={r.status} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
        <GoldText as="h2" style={{ fontSize: 28, fontWeight: 800 }}>Ride Complete!</GoldText>
        <p style={{ color: TEXT_DIM, marginTop: 8 }}>Thank you for riding with Rocapulco Supreme</p>
        <Card style={{ marginTop: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: TEXT_DIM }}>Driver</span>
            <span style={{ color: TEXT, fontWeight: 600 }}>{assignedDriver?.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: TEXT_DIM }}>Vehicle</span>
            <span style={{ color: TEXT }}>{assignedDriver?.car}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: TEXT_DIM }}>Fare</span>
            <GoldText style={{ fontSize: 22, fontWeight: 800 }}>{selectedDest?.fare || "$45.00"}</GoldText>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: TEXT_DIM }}>Payment</span>
            <span style={{ color: TEXT, textTransform: "capitalize" }}>{payment}</span>
          </div>
        </Card>
        <div style={{ marginTop: 20, display: "flex", gap: 4, justifyContent: "center" }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ cursor: "pointer", padding: 4 }}>
              <Icon type="star" size={32} color={GOLD} />
            </div>
          ))}
        </div>
        <p style={{ color: TEXT_DIM, fontSize: 13, marginTop: 8 }}>Rate your ride</p>
        <GoldButton full onClick={() => { setStep("book"); setSelectedDest(null); setDropoff(""); }} style={{ marginTop: 20 }}>
          Book Another Ride
        </GoldButton>
      </div>
    );
  }

  if (step === "tracking") {
    return (
      <div>
        <div style={{ height: 280, position: "relative" }}>
          <SimulatedMap drivers={DRIVERS} highlight={assignedDriver?.id} compact />
          <div style={{
            position: "absolute", bottom: 12, left: 12, right: 12,
            background: BG_CARD + "ee", borderRadius: 12, padding: 12,
            border: `1px solid ${GOLD}33`, backdropFilter: "blur(10px)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>
                  {trackingProgress < 30 ? "DRIVER EN ROUTE" : trackingProgress < 70 ? "DRIVER ARRIVED" : "ON YOUR WAY"}
                </div>
                <div style={{ color: TEXT, fontSize: 16, fontWeight: 700 }}>{assignedDriver?.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: GOLD, fontSize: 20, fontWeight: 800 }}>
                  {trackingProgress < 30 ? `${assignedDriver?.eta} min` : trackingProgress < 70 ? "Here!" : `${Math.round((100 - trackingProgress) * 0.25)} min`}
                </div>
              </div>
            </div>
            <div style={{ height: 4, background: BORDER, borderRadius: 2, marginTop: 8 }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${trackingProgress}%`, background: `linear-gradient(90deg, ${GOLD}, ${GREEN})`, transition: "width 0.3s" }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 40 }}>{assignedDriver?.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT, fontWeight: 700, fontSize: 16 }}>{assignedDriver?.name}</div>
                <div style={{ color: TEXT_DIM, fontSize: 13 }}>{assignedDriver?.car}</div>
                <div style={{ color: GOLD, fontSize: 13, fontWeight: 600 }}>{assignedDriver?.plate}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="tel:7184747100" style={{
                  width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${GREEN}`,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                  <Icon type="phone" size={18} color={GREEN} />
                </a>
                <a href={`https://waze.com/ul?navigate=yes`} target="_blank" style={{
                  width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${BLUE}`,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                  <Icon type="nav" size={18} color={BLUE} />
                </a>
              </div>
            </div>
          </Card>
          <Card style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN }} />
                <div style={{ width: 2, height: 30, background: `linear-gradient(${GREEN}, ${GOLD})` }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: "uppercase" }}>Pickup</div>
                <div style={{ color: TEXT, fontWeight: 600, marginBottom: 16 }}>{pickup}</div>
                <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: "uppercase" }}>Dropoff</div>
                <div style={{ color: TEXT, fontWeight: 600 }}>{dropoff || selectedDest?.address}</div>
              </div>
            </div>
          </Card>
          {payment === "cash" && (
            <Card style={{ marginTop: 12, border: `1px solid ${GOLD}44` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon type="phone" size={16} color={GOLD} />
                <span style={{ color: GOLD, fontSize: 13 }}>Cash ride — Call base to confirm: </span>
                <a href="tel:7184747100" style={{ color: GOLD, fontWeight: 800, textDecoration: "none" }}>(718) 474-7100</a>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Booking Form */}
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN }} />
              <div style={{ width: 2, height: 40, background: `linear-gradient(${GREEN}, ${GOLD})` }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
            </div>
            <div style={{ flex: 1 }}>
              <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Pickup location"
                style={{
                  width: "100%", padding: "14px 16px", background: BG_CARD, border: `1px solid ${BORDER}`,
                  borderRadius: 12, color: TEXT, fontSize: 14, outline: "none", marginBottom: 8,
                  fontFamily: "'Georgia', serif", boxSizing: "border-box",
                }} />
              <input value={dropoff || (selectedDest?.address || "")} onChange={e => { setDropoff(e.target.value); setSelectedDest(null); }}
                placeholder="Where to?"
                style={{
                  width: "100%", padding: "14px 16px", background: BG_CARD, border: `1px solid ${BORDER}`,
                  borderRadius: 12, color: TEXT, fontSize: 14, outline: "none",
                  fontFamily: "'Georgia', serif", boxSizing: "border-box",
                }} />
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        {!selectedDest && (
          <>
            <div style={{ color: TEXT_DIM, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Popular Destinations
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {POPULAR_DESTINATIONS.map((d, i) => (
                <Card key={i} onClick={() => { setSelectedDest(d); setDropoff(d.address); setStep("confirm"); }}
                  style={{ padding: 14, cursor: "pointer" }} glow={GOLD}>
                  <div style={{ color: TEXT, fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ color: GOLD, fontWeight: 800, fontSize: 16 }}>{d.fare}</span>
                    <span style={{ color: TEXT_DIM, fontSize: 12 }}>{d.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Confirmation Step */}
        {(selectedDest || step === "confirm") && (
          <>
            <Card style={{ marginTop: 16, border: `1px solid ${GOLD}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: "uppercase" }}>Estimated Fare</div>
                  <GoldText style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Georgia', serif" }}>
                    {selectedDest?.fare || "$45.00"}
                  </GoldText>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: "uppercase" }}>ETA</div>
                  <div style={{ color: TEXT, fontSize: 28, fontWeight: 800 }}>{selectedDest?.time || "25 min"}</div>
                </div>
              </div>
              <div style={{ color: GREEN, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                ✓ Fixed price — no surge, no surprises
              </div>
              <div style={{ color: TEXT_DIM, fontSize: 12 }}>
                Price includes all fees. What you see is what you pay.
              </div>
            </Card>

            {/* Payment Selection */}
            <div style={{ color: TEXT_DIM, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, margin: "20px 0 12px" }}>
              Payment Method
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {paymentMethods.map(pm => (
                <Card key={pm.id} onClick={() => setPayment(pm.id)}
                  glow={payment === pm.id ? pm.glow : undefined}
                  style={{
                    padding: 16, cursor: "pointer", textAlign: "center",
                    border: payment === pm.id ? `2px solid ${pm.glow}` : `1px solid ${BORDER}`,
                  }}>
                  <Icon type={pm.icon} size={28} color={payment === pm.id ? pm.glow : TEXT_DIM} />
                  <div style={{ color: payment === pm.id ? pm.glow : TEXT, fontWeight: 700, fontSize: 14, marginTop: 8 }}>
                    {pm.label}
                  </div>
                  <div style={{ color: TEXT_DIM, fontSize: 11, marginTop: 2 }}>{pm.desc}</div>
                </Card>
              ))}
            </div>

            {payment === "cash" && (
              <Card style={{ marginTop: 12, background: `${GOLD}08`, border: `1px solid ${GOLD}33` }}>
                <div style={{ color: GOLD, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon type="phone" size={16} />
                  Cash rides require confirmation — Call <a href="tel:7184747100" style={{ color: GOLD, fontWeight: 800 }}>(718) 474-7100</a>
                </div>
              </Card>
            )}

            <GoldButton full onClick={handleConfirm} style={{ marginTop: 20 }}>
              <Icon type="check" size={18} color={BG_DARK} />
              Confirm Ride
            </GoldButton>
          </>
        )}

        <GoldDivider />

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <GoldButton variant="outline" full onClick={() => setShowHistory(true)}>
            <Icon type="history" size={16} /> History
          </GoldButton>
          <GoldButton variant="outline" full onClick={() => window.open("tel:7184747100")}>
            <Icon type="phone" size={16} /> Call Base
          </GoldButton>
        </div>
      </div>
    </div>
  );
};

// ── DRIVER VIEW ───────────────────────────────────────
const DriverView = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentRide, setCurrentRide] = useState(null);
  const [rideStep, setRideStep] = useState(null); // null, arrived, picked-up
  const earnings = { week: 847.50, rides: 23, rating: 4.9, hours: 32 };

  const acceptRide = (ride) => {
    setCurrentRide(ride);
    setRideStep(null);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Earnings Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <GoldText as="div" style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Georgia', serif" }}>
          ${earnings.week.toFixed(2)}
        </GoldText>
        <div style={{ color: TEXT_DIM, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>This Week's Earnings</div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        <StatBadge icon="car" value={earnings.rides} label="Rides" />
        <StatBadge icon="star" value={earnings.rating} label="Rating" />
        <StatBadge icon="clock" value={earnings.hours} label="Hours" />
      </div>

      <GoldDivider />

      {/* Current Ride */}
      {currentRide ? (
        <Card style={{ border: `1px solid ${GOLD}44`, marginBottom: 16 }}>
          <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
            Active Ride
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN }} />
              <div style={{ width: 2, height: 30, background: `linear-gradient(${GREEN}, ${GOLD})` }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
            </div>
            <div>
              <div style={{ color: TEXT_DIM, fontSize: 11 }}>PICKUP</div>
              <div style={{ color: TEXT, fontWeight: 600, marginBottom: 12 }}>{currentRide.pickup}</div>
              <div style={{ color: TEXT_DIM, fontSize: 11 }}>DROPOFF</div>
              <div style={{ color: TEXT, fontWeight: 600 }}>{currentRide.dropoff}</div>
            </div>
          </div>
          <div style={{ color: GOLD, fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>
            FARE: {currentRide.fare}
          </div>

          <a href={`https://waze.com/ul?ll=40.5920,-73.7654&navigate=yes`} target="_blank"
            style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
            <GoldButton full>
              <Icon type="nav" size={18} color={BG_DARK} /> Navigate with Waze
            </GoldButton>
          </a>

          <div style={{ display: "flex", gap: 8 }}>
            <GoldButton variant="outline" full onClick={() => setRideStep("arrived")}
              style={rideStep === "arrived" ? { background: GREEN + "22", borderColor: GREEN, color: GREEN } : {}}>
              Arrived
            </GoldButton>
            <GoldButton variant="outline" full onClick={() => setRideStep("picked-up")}
              style={rideStep === "picked-up" ? { background: BLUE + "22", borderColor: BLUE, color: BLUE } : {}}>
              Picked Up
            </GoldButton>
            <GoldButton variant="outline" full onClick={() => { setCurrentRide(null); setRideStep(null); }}
              style={{ background: GOLD + "22", borderColor: GOLD, color: GOLD }}>
              Dropped Off
            </GoldButton>
          </div>
        </Card>
      ) : (
        <>
          <div style={{ color: TEXT_DIM, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Available Rides
          </div>
          {PENDING_RIDES.filter(r => r.status === "pending").map(r => (
            <Card key={r.id} style={{ marginBottom: 8, cursor: "pointer" }} glow={GOLD} onClick={() => acceptRide(r)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ color: TEXT, fontSize: 13 }}>{r.pickup}</div>
                  <div style={{ color: GOLD, fontSize: 12 }}>→ {r.dropoff}</div>
                  <div style={{ color: TEXT_DIM, fontSize: 11, marginTop: 4 }}>{r.rider} · {r.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: GOLD, fontSize: 20, fontWeight: 800 }}>{r.fare}</div>
                  <StatusPill status={r.status} />
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      <GoldDivider />

      {/* Online/Offline Toggle */}
      <div style={{
        display: "flex", borderRadius: 50, overflow: "hidden",
        border: `2px solid ${GOLD}44`, background: BG_CARD,
      }}>
        <button onClick={() => setIsOnline(true)} style={{
          flex: 1, padding: "14px 0", border: "none", fontWeight: 800, fontSize: 15,
          fontFamily: "'Georgia', serif", letterSpacing: 1, cursor: "pointer",
          background: isOnline ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : "transparent",
          color: isOnline ? BG_DARK : TEXT_DIM,
        }}>ONLINE</button>
        <button onClick={() => setIsOnline(false)} style={{
          flex: 1, padding: "14px 0", border: "none", fontWeight: 800, fontSize: 15,
          fontFamily: "'Georgia', serif", letterSpacing: 1, cursor: "pointer",
          background: !isOnline ? `linear-gradient(135deg, ${RED}, #b91c1c)` : "transparent",
          color: !isOnline ? "#fff" : TEXT_DIM,
        }}>OFFLINE</button>
      </div>
    </div>
  );
};

// ── DISPATCH VIEW ─────────────────────────────────────
const DispatchView = () => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rides, setRides] = useState(PENDING_RIDES);

  const stats = {
    active: rides.length,
    online: DRIVERS.filter(d => d.status === "online").length,
    onRide: DRIVERS.filter(d => d.status === "on-ride").length,
    pending: rides.filter(r => r.status === "pending").length,
  };

  const assignRide = (rideId, driverId) => {
    const driver = DRIVERS.find(d => d.id === driverId);
    setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: "assigned", driver: driver?.name } : r));
  };

  return (
    <div>
      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "16px 20px" }}>
        {[
          { val: stats.active, label: "ACTIVE", color: GOLD },
          { val: stats.online, label: "ONLINE", color: GREEN },
          { val: stats.onRide, label: "ON RIDE", color: BLUE },
          { val: stats.pending, label: "PENDING", color: GOLD },
        ].map((s, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "12px 8px", background: BG_CARD,
            borderRadius: 12, border: `1px solid ${s.color}33`,
          }}>
            <div style={{ color: s.color, fontSize: 28, fontWeight: 900, fontFamily: "'Georgia', serif" }}>{s.val}</div>
            <div style={{ color: TEXT_DIM, fontSize: 10, letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ height: 220, margin: "0 20px", borderRadius: 12, overflow: "hidden", border: `1px solid ${BORDER}` }}>
        <SimulatedMap drivers={DRIVERS} highlight={selectedDriver} />
      </div>

      {/* Fleet */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ color: TEXT_DIM, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Fleet Status
        </div>
        {DRIVERS.map(d => (
          <Card key={d.id} onClick={() => setSelectedDriver(d.id === selectedDriver ? null : d.id)}
            style={{
              marginBottom: 8, padding: 14, cursor: "pointer",
              border: selectedDriver === d.id ? `1.5px solid ${GOLD}` : `1px solid ${BORDER}`,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28 }}>{d.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT, fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                <div style={{ color: TEXT_DIM, fontSize: 12 }}>{d.car}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusPill status={d.status} />
                <div style={{ color: TEXT_DIM, fontSize: 11, marginTop: 4 }}>
                  {d.status !== "offline" ? `ETA ${d.eta} min` : ""}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Rides */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ color: TEXT_DIM, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Ride Queue
        </div>
        {rides.map(r => (
          <Card key={r.id} style={{ marginBottom: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
              <div>
                <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{r.rider}</div>
                <div style={{ color: TEXT_DIM, fontSize: 12 }}>{r.pickup} → {r.dropoff}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: GOLD, fontWeight: 800 }}>{r.fare}</div>
                <StatusPill status={r.status} />
              </div>
            </div>
            {r.status === "pending" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DRIVERS.filter(d => d.status === "online").map(d => (
                  <button key={d.id} onClick={() => assignRide(r.id, d.id)} style={{
                    padding: "6px 12px", borderRadius: 8, border: `1px solid ${GOLD}44`,
                    background: BG_CARD, color: GOLD, fontSize: 11, cursor: "pointer",
                    fontFamily: "'Georgia', serif",
                  }}>
                    Assign {d.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
            {r.status === "assigned" && (
              <div style={{ color: GREEN, fontSize: 12, fontWeight: 600 }}>
                ✓ Assigned to {r.driver}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function RocapulcoSupreme() {
  const [view, setView] = useState("rider"); // rider, driver, dispatch
  const [menuOpen, setMenuOpen] = useState(false);

  const views = {
    rider: { label: "Book a Ride", icon: "car", component: <RiderView setView={setView} /> },
    driver: { label: "Driver", icon: "earnings", component: <DriverView /> },
    dispatch: { label: "Dispatch", icon: "dispatch", component: <DispatchView /> },
  };

  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: BG_DARK, color: TEXT, fontFamily: "'Georgia', serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient Glow */}
      <div style={{
        position: "fixed", top: -200, right: -200, width: 400, height: 400,
        background: `radial-gradient(circle, ${GOLD}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${BORDER}`, background: BG_DARK + "ee",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: "pointer", padding: 4 }}>
          <Icon type="menu" size={22} />
        </div>
        <div style={{ textAlign: "center" }}>
          <GoldText style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>
            ROCAPULCO SUPREME
          </GoldText>
        </div>
        <div onClick={() => window.open("tel:7184747100")} style={{ cursor: "pointer", padding: 4 }}>
          <Icon type="phone" size={20} />
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
          display: "flex",
        }}>
          <div style={{
            width: 280, background: BG_CARD, borderRight: `1px solid ${GOLD}22`,
            padding: "24px 0", boxShadow: `10px 0 40px ${BG_DARK}cc`,
          }}>
            <div style={{ padding: "0 24px 24px", borderBottom: `1px solid ${BORDER}` }}>
              <GoldText as="div" style={{ fontSize: 20, fontWeight: 900 }}>ROCAPULCO</GoldText>
              <div style={{ color: TEXT_DIM, fontSize: 12, marginTop: 4 }}>Far Rockaway's Premier Car Service</div>
            </div>
            {Object.entries(views).map(([key, v]) => (
              <div key={key} onClick={() => { setView(key); setMenuOpen(false); }}
                style={{
                  padding: "16px 24px", display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", background: view === key ? `${GOLD}11` : "transparent",
                  borderLeft: view === key ? `3px solid ${GOLD}` : "3px solid transparent",
                }}>
                <Icon type={v.icon} size={20} color={view === key ? GOLD : TEXT_DIM} />
                <span style={{ color: view === key ? GOLD : TEXT_DIM, fontWeight: view === key ? 700 : 400, fontSize: 15 }}>
                  {v.label}
                </span>
              </div>
            ))}
            <GoldDivider />
            <a href="tel:7184747100" style={{
              padding: "16px 24px", display: "flex", alignItems: "center", gap: 12,
              textDecoration: "none", cursor: "pointer",
            }}>
              <Icon type="phone" size={20} color={GREEN} />
              <div>
                <div style={{ color: GREEN, fontWeight: 700, fontSize: 14 }}>(718) 474-7100</div>
                <div style={{ color: TEXT_DIM, fontSize: 11 }}>24/7 Dispatch — Real Humans</div>
              </div>
            </a>
            <div style={{ padding: "16px 24px" }}>
              <div style={{ color: TEXT_DIM, fontSize: 11, lineHeight: 1.6 }}>
                239 Beach 116th St<br />
                Rockaway Park, NY 11694<br />
                <span style={{ color: GOLD }}>Serving the community since 2010</span>
              </div>
            </div>
          </div>
          <div onClick={() => setMenuOpen(false)} style={{ flex: 1, background: "#00000088" }} />
        </div>
      )}

      {/* Content */}
      <div style={{ paddingBottom: 80 }}>
        {views[view].component}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        display: "flex", justifyContent: "space-around", padding: "12px 0 20px",
        background: `linear-gradient(180deg, transparent, ${BG_DARK} 30%)`,
        borderTop: `1px solid ${BORDER}`,
        backdropFilter: "blur(20px)",
      }}>
        {Object.entries(views).map(([key, v]) => (
          <div key={key} onClick={() => setView(key)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              cursor: "pointer", padding: "4px 16px",
            }}>
            <Icon type={v.icon} size={22} color={view === key ? GOLD : TEXT_DIM} />
            <span style={{
              fontSize: 10, fontWeight: view === key ? 700 : 400, letterSpacing: 0.5,
              color: view === key ? GOLD : TEXT_DIM,
            }}>{v.label}</span>
            {view === key && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
