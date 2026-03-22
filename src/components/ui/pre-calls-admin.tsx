"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search, RefreshCw, Trash2, ChevronRight,
  Users, TrendingUp, DollarSign, Clock,
  Store, BarChart3, Package, Wallet, Users2,
  BadgeDollarSign, MessageSquare, Calendar,
  CheckCircle2, Circle, PhoneCall, ArrowLeft,
  ExternalLink, AlertCircle,
} from "lucide-react";
import type { PreCallSubmission } from "./pre-call-form";

// ─── Constants ─────────────────────────────────────────────────────────────────

const LOGO_URL =
  "https://retailmavens.com/wp-content/uploads/2025/08/RM_logo_color_tag_web.webp";
const LS_KEY = "rm_precall_submissions";
const LS_ADMIN = "rm_precall_admin";

type Status = "new" | "reviewed" | "scheduled";

interface AdminMeta {
  status: Status;
  note: string;
  reviewedAt?: string;
}

type AdminStore = Record<string, AdminMeta>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const money = (v?: string) => {
  const n = parseFloat(v ?? "");
  if (!v || isNaN(n)) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};
const moneyOrDash = (v?: string) => money(v) ?? "—";
const pctOrDash = (v?: string) => (v && !isNaN(parseFloat(v)) ? parseFloat(v).toFixed(1) + "%" : "—");

function grossMargin(sub: PreCallSubmission) {
  const cogs = parseFloat(sub.cogsPercent);
  if (isNaN(cogs)) return null;
  return (100 - cogs).toFixed(1) + "%";
}

function revNumber(sub: PreCallSubmission) {
  return parseFloat(sub.totalAnnualRevenue) || 0;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  new:       { label: "New",       color: "text-[#0B4D7C]",   bg: "bg-blue-50 border-[#0B4D7C]/20",   icon: <Circle className="w-3 h-3" /> },
  reviewed:  { label: "Reviewed",  color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",      icon: <CheckCircle2 className="w-3 h-3" /> },
  scheduled: { label: "Scheduled", color: "text-[#5a7a1e]",  bg: "bg-[#98BD46]/10 border-[#98BD46]/30", icon: <PhoneCall className="w-3 h-3" /> },
};

// ─── Shared badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 border ${c.bg} ${c.color}`}>
      {c.icon}{c.label}
    </span>
  );
}

// ─── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-[#dce8f0] p-4 flex gap-3 items-start">
      <div className="w-9 h-9 rounded-lg bg-[#0B4D7C]/8 flex items-center justify-center text-[#0B4D7C] flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#8aabb8] uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-lg font-bold text-[#0B4D7C] leading-tight">{value}</p>
        {sub && <p className="text-xs text-[#98BD46] font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Detail section ────────────────────────────────────────────────────────────

function DetailSection({ icon, title, rows }: {
  icon: React.ReactNode;
  title: string;
  rows: { label: string; value: string }[];
}) {
  const filled = rows.filter((r) => r.value !== "—");
  if (!filled.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#98BD46]">{icon}</span>
        <h4 className="text-xs font-bold text-[#0B4D7C] uppercase tracking-wider">{title}</h4>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-xs text-[#8aabb8]">{r.label}</p>
            <p className="text-sm font-semibold text-[#1a3a5c]">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  sub,
  meta,
  onStatusChange,
  onNoteChange,
  onDelete,
  onBack,
}: {
  sub: PreCallSubmission;
  meta: AdminMeta;
  onStatusChange: (s: Status) => void;
  onNoteChange: (n: string) => void;
  onDelete: () => void;
  onBack?: () => void;
}) {
  const [tab, setTab] = React.useState<"overview" | "financials" | "notes">("overview");
  const [noteVal, setNoteVal] = React.useState(meta.note);
  const gm = grossMargin(sub);

  const TABS = [
    { id: "overview",   label: "Overview" },
    { id: "financials", label: "Financials" },
    { id: "notes",      label: "Notes" + (meta.note ? " ●" : "") },
  ] as const;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B4D7C] px-6 py-5 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1 text-white/50 text-xs mb-3 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All submissions
          </button>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {sub.storeName || "Unnamed Store"}
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">{sub.ownerName}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {sub.storeCategory && (
                <span className="text-xs text-white/50 border border-white/15 px-2 py-0.5">
                  {sub.storeCategory}
                </span>
              )}
              {sub.program && (
                <span className="text-xs text-[#98BD46] border border-[#98BD46]/30 px-2 py-0.5 font-semibold">
                  {sub.program}
                </span>
              )}
              {sub.yearsInBusiness && (
                <span className="text-xs text-white/40">{sub.yearsInBusiness} in business</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={meta.status} />
            <span className="text-xs text-white/30">{timeAgo(sub.submittedAt)}</span>
          </div>
        </div>

        {/* Contact row */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
          {sub.email && (
            <a href={`mailto:${sub.email}`} className="text-xs text-blue-200 hover:text-white transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#98BD46] inline-block" />
              {sub.email}
            </a>
          )}
          {sub.phone && (
            <a href={`tel:${sub.phone}`} className="text-xs text-blue-200 hover:text-white transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#98BD46] inline-block" />
              {sub.phone}
            </a>
          )}
          <span className="text-xs text-white/30 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {fullDate(sub.submittedAt)}
          </span>
        </div>
      </div>

      {/* Status actions */}
      <div className="bg-white border-b border-[#dce8f0] px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8aabb8] font-medium">Status:</span>
          {(["new", "reviewed", "scheduled"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`text-xs px-3 py-1.5 border font-semibold transition-all ${
                meta.status === s
                  ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-current`
                  : "border-[#dce8f0] text-[#8aabb8] hover:border-[#0B4D7C]/30 hover:text-[#0B4D7C]"
              }`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-[#a0b8cc] hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4 bg-[#f4f7fb] border-b border-[#dce8f0] flex-shrink-0">
        <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Annual Revenue" value={moneyOrDash(sub.totalAnnualRevenue)} sub={sub.reportingPeriod || undefined} />
        <KpiCard icon={<BarChart3 className="w-4 h-4" />} label="Gross Margin" value={gm ?? "—"} sub={sub.cogsPercent ? `COGS: ${sub.cogsPercent}%` : undefined} />
        <KpiCard icon={<DollarSign className="w-4 h-4" />} label="Owner's Pay" value={moneyOrDash(sub.annualSalary)} sub={sub.desiredAnnualIncome ? `Goal: ${moneyOrDash(sub.desiredAnnualIncome)}` : undefined} />
        <KpiCard icon={<Clock className="w-4 h-4" />} label="Hrs/Week (Owner)" value={sub.hoursPerWeek ? sub.hoursPerWeek + "h" : "—"} sub={sub.numberOfLocations || undefined} />
      </div>

      {/* Tabs */}
      <div className="border-b border-[#dce8f0] bg-white flex-shrink-0">
        <div className="flex px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm font-semibold py-3 px-4 border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#98BD46] text-[#0B4D7C]"
                  : "border-transparent text-[#8aabb8] hover:text-[#0B4D7C]"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 bg-white space-y-6">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Biggest challenge + goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sub.biggestChallenge && (
                <div className="p-4 bg-[#0B4D7C]/5 border border-[#dce8f0]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#0B4D7C]" />
                    <p className="text-xs font-bold text-[#0B4D7C] uppercase tracking-wide">Biggest Challenge</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1a3a5c]">{sub.biggestChallenge}</p>
                </div>
              )}
              {sub.revenueGoal && (
                <div className="p-4 bg-[#98BD46]/8 border border-[#98BD46]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#5a7a1e]" />
                    <p className="text-xs font-bold text-[#5a7a1e] uppercase tracking-wide">12-Month Revenue Goal</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1a3a5c]">{moneyOrDash(sub.revenueGoal)}</p>
                </div>
              )}
            </div>

            {sub.successOutcome && (
              <div className="p-4 border border-[#dce8f0] bg-[#f9fbfd]">
                <p className="text-xs font-bold text-[#0B4D7C] uppercase tracking-wide mb-2 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> What Success Looks Like (Their Words)
                </p>
                <p className="text-sm text-[#4a6d8c] leading-relaxed italic">&ldquo;{sub.successOutcome}&rdquo;</p>
              </div>
            )}

            {/* Store snapshot */}
            <DetailSection
              icon={<Store className="w-4 h-4" />}
              title="Store Snapshot"
              rows={[
                { label: "Store Name",        value: sub.storeName || "—" },
                { label: "Category",          value: sub.storeCategory || "—" },
                { label: "Years in Business", value: sub.yearsInBusiness || "—" },
                { label: "Locations",         value: sub.numberOfLocations || "—" },
                { label: "Reporting Period",  value: sub.reportingPeriod || "—" },
                { label: "Exit Timeline",     value: sub.exitTimeline || "—" },
              ]}
            />

            {/* Payroll snapshot */}
            <DetailSection
              icon={<Users2 className="w-4 h-4" />}
              title="Team"
              rows={[
                { label: "Employees (FTE)",      value: sub.numberOfEmployees || "—" },
                { label: "Total Annual Payroll",  value: moneyOrDash(sub.totalAnnualPayroll) },
                { label: "Avg Hourly Wage",       value: sub.avgHourlyWage ? "$" + sub.avgHourlyWage : "—" },
                { label: "Staff Turnover",        value: sub.staffTurnover || "—" },
                { label: "Scheduling Method",     value: sub.schedulingMethod || "—" },
              ]}
            />

            {sub.additionalNotes && (
              <div className="p-4 bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Additional Notes from Lead
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">{sub.additionalNotes}</p>
              </div>
            )}
          </>
        )}

        {/* ── FINANCIALS TAB ── */}
        {tab === "financials" && (
          <>
            <DetailSection
              icon={<TrendingUp className="w-4 h-4" />}
              title="Revenue & Gross Margin"
              rows={[
                { label: "Total Annual Revenue",    value: moneyOrDash(sub.totalAnnualRevenue) },
                { label: "COGS %",                  value: pctOrDash(sub.cogsPercent) },
                { label: "Gross Margin",            value: gm ?? "—" },
                { label: "Returns & Allowances",    value: moneyOrDash(sub.returnsAllowances) },
                { label: "Avg Transaction Value",   value: moneyOrDash(sub.avgTransactionValue) },
                { label: "In-Store Sales",          value: moneyOrDash(sub.instoreSales) },
                { label: "Online Sales",            value: moneyOrDash(sub.onlineSales) },
                { label: "Other / Wholesale",       value: moneyOrDash(sub.otherSales) },
              ]}
            />
            <div className="border-t border-[#dce8f0]" />
            <DetailSection
              icon={<Package className="w-4 h-4" />}
              title="Inventory & Open-to-Buy"
              rows={[
                { label: "Inventory at Cost",         value: moneyOrDash(sub.inventoryValueAtCost) },
                { label: "Aged Inventory (6m+)",      value: pctOrDash(sub.agedInventoryPercent) },
                { label: "Current Markdown %",        value: pctOrDash(sub.currentMarkdownPercent) },
                { label: "OTB Process",               value: sub.otbProcess || "—" },
                { label: "Annual Buying Budget",      value: moneyOrDash(sub.annualBuyingBudget) },
                { label: "Active Vendors",            value: sub.activeVendors || "—" },
                { label: "Best Category",             value: sub.bestCategory || "—" },
                { label: "Worst Category",            value: sub.worstCategory || "—" },
              ]}
            />
            <div className="border-t border-[#dce8f0]" />
            <DetailSection
              icon={<Wallet className="w-4 h-4" />}
              title="Cash Flow & Expenses"
              rows={[
                { label: "Rent / Occupancy",           value: moneyOrDash(sub.rent) },
                { label: "Utilities",                  value: moneyOrDash(sub.utilities) },
                { label: "Insurance",                  value: moneyOrDash(sub.insurance) },
                { label: "Software & Subscriptions",   value: moneyOrDash(sub.softwareSubscriptions) },
                { label: "Marketing & Advertising",    value: moneyOrDash(sub.marketingAdvertising) },
                { label: "Merchant / Payment Fees",    value: moneyOrDash(sub.merchantFees) },
                { label: "Supplies & Packaging",       value: moneyOrDash(sub.suppliesPackaging) },
                { label: "Other Operating Expenses",   value: moneyOrDash(sub.otherOperatingExpenses) },
                { label: "Cash on Hand",               value: moneyOrDash(sub.cashOnHand) },
                { label: "Business Debt / Credit",     value: moneyOrDash(sub.businessDebt) },
              ]}
            />
            <div className="border-t border-[#dce8f0]" />
            <DetailSection
              icon={<BadgeDollarSign className="w-4 h-4" />}
              title="Owner's Pay & Profit"
              rows={[
                { label: "Annual Salary / Draw",        value: moneyOrDash(sub.annualSalary) },
                { label: "Desired Annual Income",       value: moneyOrDash(sub.desiredAnnualIncome) },
                { label: "Net Profit (Pre-Owner Pay)",  value: moneyOrDash(sub.netProfitBeforeOwnerPay) },
                { label: "Business Bank Balance",       value: moneyOrDash(sub.businessBankBalance) },
                { label: "Reinvesting",                 value: sub.reinvesting || "—" },
              ]}
            />
          </>
        )}

        {/* ── NOTES TAB ── */}
        {tab === "notes" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0B4D7C] uppercase tracking-wide block mb-2">
                Admin Notes
              </label>
              <p className="text-xs text-[#8aabb8] mb-3">
                Private notes for the coach — not visible to the lead.
              </p>
              <textarea
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                onBlur={() => onNoteChange(noteVal)}
                placeholder="Add coaching notes, observations, or action items here..."
                rows={8}
                className="w-full px-4 py-3 border border-[#dce8f0] text-sm text-[#0B4D7C] bg-[#f9fbfd] focus:outline-none focus:border-[#0B4D7C] focus:bg-white resize-none transition-colors placeholder:text-[#a0b8cc]"
              />
              <p className="text-xs text-[#a0b8cc] mt-2">Auto-saved when you click away.</p>
            </div>

            {meta.reviewedAt && (
              <div className="text-xs text-[#8aabb8] flex items-center gap-2 pt-2 border-t border-[#dce8f0]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#98BD46]" />
                Marked as reviewed {timeAgo(meta.reviewedAt)}
              </div>
            )}

            <div className="pt-2 border-t border-[#dce8f0]">
              <p className="text-xs text-[#a0b8cc] font-mono">Ref: {sub.id}</p>
              {sub.leadId && <p className="text-xs text-[#a0b8cc] font-mono">Lead: {sub.leadId}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar card ──────────────────────────────────────────────────────────────

function SidebarCard({
  sub,
  meta,
  selected,
  onClick,
}: {
  sub: PreCallSubmission;
  meta: AdminMeta;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-[#dce8f0] transition-colors hover:bg-[#f4f7fb] ${
        selected ? "bg-[#0B4D7C]/5 border-l-2 border-l-[#98BD46]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0B4D7C] truncate" style={{ fontFamily: "var(--font-heading)" }}>
            {sub.storeName || "Unnamed Store"}
          </p>
          <p className="text-xs text-[#8aabb8] truncate">{sub.ownerName}</p>
        </div>
        <StatusBadge status={meta.status} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[#98BD46] font-semibold">
          {money(sub.totalAnnualRevenue) ?? "No revenue"}
        </span>
        <span className="text-xs text-[#a0b8cc]">{timeAgo(sub.submittedAt)}</span>
      </div>
      {sub.biggestChallenge && (
        <p className="text-xs text-[#a0b8cc] mt-1 truncate">{sub.biggestChallenge}</p>
      )}
    </button>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

export function PreCallsAdmin() {
  const [subs, setSubs] = React.useState<PreCallSubmission[]>([]);
  const [adminStore, setAdminStore] = React.useState<AdminStore>({});
  const [loaded, setLoaded] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<Status | "all">("all");
  const [mobileShowDetail, setMobileShowDetail] = React.useState(false);

  const load = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setSubs(raw ? JSON.parse(raw) : []);
    } catch { setSubs([]); }
    try {
      const raw = localStorage.getItem(LS_ADMIN);
      setAdminStore(raw ? JSON.parse(raw) : {});
    } catch { setAdminStore({}); }
    setLoaded(true);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Auto-select first on desktop
  React.useEffect(() => {
    if (loaded && subs.length && !selectedId) setSelectedId(subs[0].id);
  }, [loaded, subs, selectedId]);

  const getMeta = (id: string): AdminMeta =>
    adminStore[id] ?? { status: "new", note: "" };

  const saveAdminStore = (next: AdminStore) => {
    setAdminStore(next);
    localStorage.setItem(LS_ADMIN, JSON.stringify(next));
  };

  const setStatus = (id: string, status: Status) => {
    const next = {
      ...adminStore,
      [id]: { ...getMeta(id), status, reviewedAt: status === "reviewed" ? new Date().toISOString() : getMeta(id).reviewedAt },
    };
    saveAdminStore(next);
  };

  const setNote = (id: string, note: string) => {
    const next = { ...adminStore, [id]: { ...getMeta(id), note } };
    saveAdminStore(next);
  };

  const deleteOne = (id: string) => {
    const nextSubs = subs.filter((s) => s.id !== id);
    setSubs(nextSubs);
    localStorage.setItem(LS_KEY, JSON.stringify(nextSubs));
    const { [id]: _, ...rest } = adminStore;
    saveAdminStore(rest);
    if (selectedId === id) {
      setSelectedId(nextSubs[0]?.id ?? null);
      setMobileShowDetail(false);
    }
  };

  // Stats
  const totalRevenue = subs.reduce((a, s) => a + revNumber(s), 0);
  const avgRevenue = subs.length ? totalRevenue / subs.length : 0;
  const newCount = subs.filter((s) => getMeta(s.id).status === "new").length;
  const challengeCounts = subs.reduce<Record<string, number>>((a, s) => {
    if (s.biggestChallenge) a[s.biggestChallenge] = (a[s.biggestChallenge] ?? 0) + 1;
    return a;
  }, {});
  const topChallenge = Object.entries(challengeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Filtered list
  const filtered = subs.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.storeName.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.storeCategory.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || getMeta(s.id).status === filterStatus;
    return matchSearch && matchStatus;
  });

  const selected = selectedId ? subs.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      {/* ── Top bar ── */}
      <div className="bg-[#0B4D7C] z-50 flex-shrink-0">
        <div className="px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src={LOGO_URL} alt="RETAIL Mavens" width={130} height={38} className="h-8 w-auto object-contain brightness-0 invert" />
            <div className="hidden sm:flex items-center gap-1.5 text-white/30 text-xs">
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60 font-medium">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <a href="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Site</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-[#dce8f0] flex-shrink-0">
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0B4D7C]/8 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0B4D7C]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0B4D7C]">{subs.length}</p>
              <p className="text-xs text-[#8aabb8]">Total submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Circle className="w-4 h-4 text-[#0B4D7C]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0B4D7C]">{newCount}</p>
              <p className="text-xs text-[#8aabb8]">Awaiting review</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#98BD46]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#5a7a1e]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0B4D7C]">
                {avgRevenue ? money(String(avgRevenue)) : "—"}
              </p>
              <p className="text-xs text-[#8aabb8]">Avg revenue</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0B4D7C] leading-tight truncate max-w-[140px]">
                {topChallenge?.split("&")[0] ?? "—"}
              </p>
              <p className="text-xs text-[#8aabb8]">Top challenge</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-panel body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        <div className={`w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-[#dce8f0] bg-white ${mobileShowDetail ? "hidden sm:flex" : "flex"}`}>
          {/* Search + filter */}
          <div className="p-3 border-b border-[#dce8f0] space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0b8cc]" />
              <input
                type="text"
                placeholder="Search stores or owners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#dce8f0] bg-[#f9fbfd] focus:outline-none focus:border-[#0B4D7C] text-[#0B4D7C] placeholder:text-[#a0b8cc] transition-colors"
              />
            </div>
            <div className="flex gap-1">
              {(["all", "new", "reviewed", "scheduled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex-1 text-xs py-1.5 font-semibold border transition-colors ${
                    filterStatus === s
                      ? "bg-[#0B4D7C] text-white border-[#0B4D7C]"
                      : "bg-white text-[#8aabb8] border-[#dce8f0] hover:border-[#0B4D7C]/30 hover:text-[#0B4D7C]"
                  }`}
                >
                  {s === "all" ? `All ${subs.length}` : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loaded && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Users className="w-8 h-8 text-[#dce8f0] mb-3" />
                <p className="text-sm text-[#a0b8cc]">
                  {subs.length === 0 ? "No submissions yet." : "No matches found."}
                </p>
              </div>
            )}
            {filtered.map((s) => (
              <SidebarCard
                key={s.id}
                sub={s}
                meta={getMeta(s.id)}
                selected={s.id === selectedId}
                onClick={() => {
                  setSelectedId(s.id);
                  setMobileShowDetail(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className={`flex-1 min-w-0 flex flex-col overflow-hidden ${mobileShowDetail || !selected ? "flex" : "hidden sm:flex"}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#f9fbfd]">
              <div className="w-16 h-16 bg-[#0B4D7C]/5 rounded-full flex items-center justify-center mb-4">
                <Store className="w-7 h-7 text-[#0B4D7C]/30" />
              </div>
              <p className="text-[#8aabb8] font-medium">Select a submission to review</p>
              <p className="text-xs text-[#a0b8cc] mt-1">
                {loaded && subs.length === 0
                  ? "No pre-call forms submitted yet."
                  : "Click a store from the list to see their full business profile."}
              </p>
            </div>
          ) : (
            <DetailPanel
              sub={selected}
              meta={getMeta(selected.id)}
              onStatusChange={(s) => setStatus(selected.id, s)}
              onNoteChange={(n) => setNote(selected.id, n)}
              onDelete={() => deleteOne(selected.id)}
              onBack={() => setMobileShowDetail(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
