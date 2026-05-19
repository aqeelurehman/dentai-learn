/**
 * components/ui/index.jsx
 * Premium DentAI Learn UI primitives — gold/navy theme.
 */
import { useEffect } from "react";
import { X } from "lucide-react";

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ variant = "primary", children, className = "", ...props }) {
  const base = {
    primary: "btn-primary",
    ghost:   "btn-ghost",
    danger:  "btn-danger",
    success: "btn-success",
  }[variant] || "btn-primary";
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ color = "#c9a84c", children, className = "" }) {
  return (
    <span
      className={`badge ${className}`}
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}18` }}
    >
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 32, color = "#c9a84c" }) {
  return (
    <div
      className="rounded-full animate-spin"
      style={{
        width: size, height: size,
        border: `3px solid ${color}33`,
        borderTopColor: color,
      }}
    />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success" }) {
  const color = type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#c9a84c";
  const icon  = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  return (
    <div className="toast" style={{ borderColor: color }}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box w-full ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <span className="text-lg font-black font-display gold-text">{title}</span>
          <button onClick={onClose} className="transition-colors" style={{ color: '#4a6080' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ icon, value, label, color = "#c9a84c" }) {
  return (
    <div className="stat-card">
      <span className="text-3xl">{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, color, height = "h-1.5" }) {
  return (
    <div className={`progress-bar ${height}`}>
      <div
        className="progress-fill"
        style={{ width: `${value}%`, background: color || 'linear-gradient(90deg, #c9a84c, #f0d080)' }}
      />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <div className="font-bold font-display text-lg mb-2 gold-text">{title}</div>
      <div className="text-sm mb-6" style={{ color: '#4a6080' }}>{desc}</div>
      {action}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="section-sub">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── DifficultyBadge ───────────────────────────────────────────────────────────
export function DifficultyBadge({ level }) {
  const colors = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444" };
  return <Badge color={colors[level] || "#4a6080"}>{level}</Badge>;
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className="input-field" {...props} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, rows = 4, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea className="input-field resize-y" rows={rows} {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select className="input-field" {...props}>{children}</select>
    </div>
  );
}
