"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreCallSubmission {
  id: string;
  submittedAt: string;
  leadId?: string;
  ownerName: string;
  email: string;
  phone?: string;
  program?: string;
  // Section 1
  storeName: string;
  storeCategory: string;
  yearsInBusiness: string;
  numberOfLocations: string;
  reportingPeriod: string;
  biggestChallenge: string;
  revenueGoal: string;
  successOutcome: string;
  // Section 2
  totalAnnualRevenue: string;
  cogsPercent: string;
  returnsAllowances: string;
  avgTransactionValue: string;
  instoreSales: string;
  onlineSales: string;
  otherSales: string;
  // Section 3
  inventoryValueAtCost: string;
  agedInventoryPercent: string;
  currentMarkdownPercent: string;
  otbProcess: string;
  annualBuyingBudget: string;
  activeVendors: string;
  bestCategory: string;
  worstCategory: string;
  // Section 4
  rent: string;
  utilities: string;
  insurance: string;
  softwareSubscriptions: string;
  marketingAdvertising: string;
  merchantFees: string;
  suppliesPackaging: string;
  otherOperatingExpenses: string;
  cashOnHand: string;
  businessDebt: string;
  // Section 5
  totalAnnualPayroll: string;
  numberOfEmployees: string;
  avgHourlyWage: string;
  hoursPerWeek: string;
  staffTurnover: string;
  schedulingMethod: string;
  // Section 6
  annualSalary: string;
  desiredAnnualIncome: string;
  netProfitBeforeOwnerPay: string;
  businessBankBalance: string;
  reinvesting: string;
  exitTimeline: string;
  additionalNotes: string;
}

const EMPTY: Omit<PreCallSubmission, "id" | "submittedAt"> = {
  leadId: "",
  ownerName: "",
  email: "",
  phone: "",
  program: "",
  storeName: "",
  storeCategory: "",
  yearsInBusiness: "",
  numberOfLocations: "1 location",
  reportingPeriod: "Last 12 months",
  biggestChallenge: "",
  revenueGoal: "",
  successOutcome: "",
  totalAnnualRevenue: "",
  cogsPercent: "",
  returnsAllowances: "",
  avgTransactionValue: "",
  instoreSales: "",
  onlineSales: "",
  otherSales: "",
  inventoryValueAtCost: "",
  agedInventoryPercent: "",
  currentMarkdownPercent: "",
  otbProcess: "none",
  annualBuyingBudget: "",
  activeVendors: "",
  bestCategory: "",
  worstCategory: "",
  rent: "",
  utilities: "",
  insurance: "",
  softwareSubscriptions: "",
  marketingAdvertising: "",
  merchantFees: "",
  suppliesPackaging: "",
  otherOperatingExpenses: "",
  cashOnHand: "",
  businessDebt: "",
  totalAnnualPayroll: "",
  numberOfEmployees: "",
  avgHourlyWage: "",
  hoursPerWeek: "",
  staffTurnover: "low",
  schedulingMethod: "Manual / ad hoc",
  annualSalary: "",
  desiredAnnualIncome: "",
  netProfitBeforeOwnerPay: "",
  businessBankBalance: "",
  reinvesting: "Yes, regularly",
  exitTimeline: "Not planning to exit",
  additionalNotes: "",
};

const LOGO_URL =
  "https://retailmavens.com/wp-content/uploads/2025/08/RM_logo_color_tag_web.webp";

const STEPS = [
  "Your Store",
  "Revenue",
  "Inventory",
  "Cash Flow",
  "Payroll",
  "Owner Pay",
];

const LS_KEY = "rm_precall_submissions";
const LS_PENDING = "rm_precall_pending";

// ─── Helper components ────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold text-[#4a6d8c] uppercase tracking-wide mb-1 block">
      {children}
      {required && <span className="text-[#98BD46] ml-0.5">*</span>}
    </label>
  );
}

function Input({
  label,
  required,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <Label required={required}>{label}</Label>
      <input
        {...props}
        required={required}
        className="px-3 py-2.5 border border-[#dce8f0] rounded-none text-sm text-[#0B4D7C] bg-white focus:outline-none focus:border-[#0B4D7C] focus:ring-2 focus:ring-[#0B4D7C]/10 placeholder:text-[#a0b8cc] transition-colors"
      />
      {hint && <p className="text-xs text-[#8aabb8] mt-1">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  required,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <Label required={required}>{label}</Label>
      <select
        {...props}
        required={required}
        className="px-3 py-2.5 border border-[#dce8f0] rounded-none text-sm text-[#0B4D7C] bg-white focus:outline-none focus:border-[#0B4D7C] focus:ring-2 focus:ring-[#0B4D7C]/10 transition-colors appearance-none"
      >
        {children}
      </select>
    </div>
  );
}

function Textarea({
  label,
  hint,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <Label>{label}</Label>
      <textarea
        {...props}
        rows={3}
        className="px-3 py-2.5 border border-[#dce8f0] rounded-none text-sm text-[#0B4D7C] bg-white focus:outline-none focus:border-[#0B4D7C] focus:ring-2 focus:ring-[#0B4D7C]/10 placeholder:text-[#a0b8cc] resize-vertical transition-colors"
      />
      {hint && <p className="text-xs text-[#8aabb8] mt-1">{hint}</p>}
    </div>
  );
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-[#98BD46] uppercase tracking-wider py-3 mt-2 border-b border-[#dce8f0] mb-4">
      <span className="w-1 h-3.5 bg-[#98BD46] rounded-sm inline-block" />
      {children}
    </div>
  );
}

// ─── Section forms ────────────────────────────────────────────────────────────

function Section1({ data, set }: { data: Omit<PreCallSubmission, "id" | "submittedAt">; set: (k: keyof typeof EMPTY, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Store / Business Name" required placeholder="e.g. The Blue Door Boutique" value={data.storeName} onChange={(e) => set("storeName", e.target.value)} />
        <Input label="Your Name" required placeholder="e.g. Sarah Mitchell" value={data.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
        <Select label="Store Category" required value={data.storeCategory} onChange={(e) => set("storeCategory", e.target.value)}>
          <option value="">Select your category...</option>
          <option>Gift &amp; Novelty</option>
          <option>Apparel &amp; Fashion</option>
          <option>Home &amp; Décor</option>
          <option>Specialty Food</option>
          <option>Toy &amp; Kids</option>
          <option>Jewelry &amp; Accessories</option>
          <option>Pet Supplies</option>
          <option>Outdoor &amp; Sporting</option>
          <option>Other Retail</option>
        </Select>
        <Select label="Years in Business" value={data.yearsInBusiness} onChange={(e) => set("yearsInBusiness", e.target.value)}>
          <option value="">Select...</option>
          <option>Under 2 years</option>
          <option>2–5 years</option>
          <option>5–10 years</option>
          <option>10+ years</option>
        </Select>
        <Select label="Number of Locations" value={data.numberOfLocations} onChange={(e) => set("numberOfLocations", e.target.value)}>
          <option>1 location</option>
          <option>2 locations</option>
          <option>3+ locations</option>
        </Select>
        <Select label="Reporting Period" value={data.reportingPeriod} onChange={(e) => set("reportingPeriod", e.target.value)}>
          <option>Last 12 months</option>
          <option>Last quarter</option>
          <option>Year to date</option>
        </Select>
        <Select label="Biggest challenge right now" required value={data.biggestChallenge} onChange={(e) => set("biggestChallenge", e.target.value)}>
          <option value="">Select the most pressing issue...</option>
          <option>Cash flow &amp; profitability</option>
          <option>Inventory management &amp; buying</option>
          <option>Growing revenue</option>
          <option>Hiring &amp; managing my team</option>
          <option>Getting my time back</option>
          <option>Preparing to sell</option>
        </Select>
        <Input label="12-month revenue goal ($)" type="number" placeholder="e.g. 500000" value={data.revenueGoal} onChange={(e) => set("revenueGoal", e.target.value)} hint="The number you're aiming for" />
      </div>
      <Textarea label="What would a successful coaching outcome look like for you?" placeholder="e.g. Pay myself $11K/month, work under 40 hours/week, hit $1M in 18 months..." value={data.successOutcome} onChange={(e) => set("successOutcome", e.target.value)} />
    </div>
  );
}

function Section2({ data, set }: { data: Omit<PreCallSubmission, "id" | "submittedAt">; set: (k: keyof typeof EMPTY, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Total Annual Revenue ($)" required type="number" placeholder="e.g. 380000" value={data.totalAnnualRevenue} onChange={(e) => set("totalAnnualRevenue", e.target.value)} hint="All sales channels combined" />
        <Input label="Cost of Goods Sold (%)" required type="number" placeholder="e.g. 52" min="0" max="100" value={data.cogsPercent} onChange={(e) => set("cogsPercent", e.target.value)} hint="% of revenue paid for your products" />
        <Input label="Total Returns &amp; Allowances ($)" type="number" placeholder="e.g. 8000" value={data.returnsAllowances} onChange={(e) => set("returnsAllowances", e.target.value)} />
        <Input label="Average Transaction Value ($)" type="number" placeholder="e.g. 65" value={data.avgTransactionValue} onChange={(e) => set("avgTransactionValue", e.target.value)} />
      </div>
      <SectionDivider>Sales by channel</SectionDivider>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="In-store sales ($)" type="number" placeholder="e.g. 300000" value={data.instoreSales} onChange={(e) => set("instoreSales", e.target.value)} />
        <Input label="Online / e-commerce ($)" type="number" placeholder="e.g. 60000" value={data.onlineSales} onChange={(e) => set("onlineSales", e.target.value)} />
        <Input label="Other / wholesale ($)" type="number" placeholder="e.g. 20000" value={data.otherSales} onChange={(e) => set("otherSales", e.target.value)} />
      </div>
    </div>
  );
}

function Section3({ data, set }: { data: Omit<PreCallSubmission, "id" | "submittedAt">; set: (k: keyof typeof EMPTY, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Inventory Value at Cost ($)" required type="number" placeholder="e.g. 95000" value={data.inventoryValueAtCost} onChange={(e) => set("inventoryValueAtCost", e.target.value)} />
        <Input label="Aged Inventory — 6+ months (% of total)" type="number" placeholder="e.g. 22" min="0" max="100" value={data.agedInventoryPercent} onChange={(e) => set("agedInventoryPercent", e.target.value)} hint="Estimate is fine" />
        <Input label="Current Markdown % on the Floor" type="number" placeholder="e.g. 18" min="0" max="100" value={data.currentMarkdownPercent} onChange={(e) => set("currentMarkdownPercent", e.target.value)} />
        <Select label="Formal Open-to-Buy process?" value={data.otbProcess} onChange={(e) => set("otbProcess", e.target.value)}>
          <option value="none">No — we buy as we go</option>
          <option value="basic">Basic spreadsheet tracking</option>
          <option value="system">Yes — formal OTB plan</option>
        </Select>
        <Input label="Annual Buying Budget ($)" type="number" placeholder="e.g. 190000" value={data.annualBuyingBudget} onChange={(e) => set("annualBuyingBudget", e.target.value)} />
        <Input label="Number of Active Vendors" type="number" placeholder="e.g. 24" value={data.activeVendors} onChange={(e) => set("activeVendors", e.target.value)} />
        <Input label="Best-performing product category" placeholder="e.g. Candles &amp; home fragrance" value={data.bestCategory} onChange={(e) => set("bestCategory", e.target.value)} />
        <Input label="Worst-performing product category" placeholder="e.g. Seasonal apparel" value={data.worstCategory} onChange={(e) => set("worstCategory", e.target.value)} />
      </div>
    </div>
  );
}

function Section4({ data, set }: { data: Omit<PreCallSubmission, "id" | "submittedAt">; set: (k: keyof typeof EMPTY, v: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionDivider>Fixed expenses — annual</SectionDivider>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Rent / Occupancy ($)" type="number" placeholder="e.g. 36000" value={data.rent} onChange={(e) => set("rent", e.target.value)} />
        <Input label="Utilities ($)" type="number" placeholder="e.g. 8400" value={data.utilities} onChange={(e) => set("utilities", e.target.value)} />
        <Input label="Insurance ($)" type="number" placeholder="e.g. 4800" value={data.insurance} onChange={(e) => set("insurance", e.target.value)} />
        <Input label="Software &amp; Subscriptions ($)" type="number" placeholder="e.g. 3600" value={data.softwareSubscriptions} onChange={(e) => set("softwareSubscriptions", e.target.value)} />
      </div>
      <SectionDivider>Variable expenses — annual</SectionDivider>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Marketing &amp; Advertising ($)" type="number" placeholder="e.g. 12000" value={data.marketingAdvertising} onChange={(e) => set("marketingAdvertising", e.target.value)} />
        <Input label="Merchant / Payment Fees ($)" type="number" placeholder="e.g. 6000" value={data.merchantFees} onChange={(e) => set("merchantFees", e.target.value)} />
        <Input label="Supplies &amp; Packaging ($)" type="number" placeholder="e.g. 4200" value={data.suppliesPackaging} onChange={(e) => set("suppliesPackaging", e.target.value)} />
        <Input label="Other Operating Expenses ($)" type="number" placeholder="e.g. 9000" value={data.otherOperatingExpenses} onChange={(e) => set("otherOperatingExpenses", e.target.value)} />
      </div>
      <SectionDivider>Cash position today</SectionDivider>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Cash on Hand / In Bank ($)" type="number" placeholder="e.g. 28000" value={data.cashOnHand} onChange={(e) => set("cashOnHand", e.target.value)} />
        <Input label="Outstanding Business Debt / Credit ($)" type="number" placeholder="e.g. 15000" value={data.businessDebt} onChange={(e) => set("businessDebt", e.target.value)} />
      </div>
    </div>
  );
}

function Section5({ data, set }: { data: Omit<PreCallSubmission, "id" | "submittedAt">; set: (k: keyof typeof EMPTY, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Total Annual Payroll ($)" required type="number" placeholder="e.g. 95000" value={data.totalAnnualPayroll} onChange={(e) => set("totalAnnualPayroll", e.target.value)} hint="Excluding your own pay" />
        <Input label="Number of Employees (FTE)" type="number" placeholder="e.g. 4" value={data.numberOfEmployees} onChange={(e) => set("numberOfEmployees", e.target.value)} />
        <Input label="Average Hourly Wage ($)" type="number" placeholder="e.g. 17.50" value={data.avgHourlyWage} onChange={(e) => set("avgHourlyWage", e.target.value)} />
        <Input label="Hours You Work Per Week" type="number" placeholder="e.g. 55" value={data.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
        <Select label="Staff Turnover — last 12 months" value={data.staffTurnover} onChange={(e) => set("staffTurnover", e.target.value)}>
          <option value="low">Low — 0 to 1 people</option>
          <option value="med">Medium — 2 to 3 people</option>
          <option value="high">High — 4 or more people</option>
        </Select>
        <Select label="How do you schedule your team?" value={data.schedulingMethod} onChange={(e) => set("schedulingMethod", e.target.value)}>
          <option>Manual / ad hoc</option>
          <option>Basic spreadsheet</option>
          <option>Scheduling software</option>
        </Select>
      </div>
    </div>
  );
}

function Section6({ data, set }: { data: Omit<PreCallSubmission, "id" | "submittedAt">; set: (k: keyof typeof EMPTY, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Annual Salary / Owner Draw ($)" required type="number" placeholder="e.g. 52000" value={data.annualSalary} onChange={(e) => set("annualSalary", e.target.value)} />
        <Input label="Desired Annual Income ($)" type="number" placeholder="e.g. 132000" value={data.desiredAnnualIncome} onChange={(e) => set("desiredAnnualIncome", e.target.value)} hint="$11K/month = $132K/year" />
        <Input label="Net Profit Before Owner's Pay ($)" type="number" placeholder="e.g. 68000" value={data.netProfitBeforeOwnerPay} onChange={(e) => set("netProfitBeforeOwnerPay", e.target.value)} />
        <Input label="Business Bank Balance ($)" type="number" placeholder="e.g. 28000" value={data.businessBankBalance} onChange={(e) => set("businessBankBalance", e.target.value)} />
        <Select label="Reinvesting in the business?" value={data.reinvesting} onChange={(e) => set("reinvesting", e.target.value)}>
          <option>Yes, regularly</option>
          <option>Sometimes</option>
          <option>Not currently</option>
        </Select>
        <Select label="Exit / sell timeline" value={data.exitTimeline} onChange={(e) => set("exitTimeline", e.target.value)}>
          <option>Not planning to exit</option>
          <option>5+ years away</option>
          <option>3–5 years</option>
          <option>1–3 years</option>
          <option>Within 1 year</option>
        </Select>
      </div>
      <Textarea label="Anything else your coach should know before the call?" placeholder="e.g. Unusually slow Q1, new product line just launched, lease renewal coming up, struggling to pay myself consistently..." value={data.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PreCallForm() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [submissionId, setSubmissionId] = React.useState("");
  const [data, setData] = React.useState<Omit<PreCallSubmission, "id" | "submittedAt">>({ ...EMPTY });

  // Load pending lead data on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PENDING);
      if (raw) {
        const pending = JSON.parse(raw) as {
          leadId?: string;
          name?: string;
          email?: string;
          phone?: string;
          program?: string;
        };
        setData((d) => ({
          ...d,
          leadId: pending.leadId ?? "",
          ownerName: pending.name ?? "",
          email: pending.email ?? "",
          phone: pending.phone ?? "",
          program: pending.program ?? "",
        }));
      }
    } catch { /* ignore */ }
  }, []);

  const set = React.useCallback((k: keyof typeof EMPTY, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
  }, []);

  const isStepValid = () => {
    if (step === 0) return data.storeName.trim() && data.ownerName.trim() && data.storeCategory && data.biggestChallenge;
    if (step === 1) return data.totalAnnualRevenue && data.cogsPercent;
    if (step === 2) return data.inventoryValueAtCost;
    if (step === 4) return data.totalAnnualPayroll;
    if (step === 5) return data.annualSalary;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const id = `pcf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const submission: PreCallSubmission = {
      ...data,
      id,
      submittedAt: new Date().toISOString(),
    };

    try {
      const existing: PreCallSubmission[] = JSON.parse(
        localStorage.getItem(LS_KEY) ?? "[]"
      );
      existing.unshift(submission);
      localStorage.setItem(LS_KEY, JSON.stringify(existing));
      localStorage.removeItem(LS_PENDING);
    } catch { /* ignore */ }

    setSubmissionId(id);
    setSaving(false);
    setDone(true);
  };

  // ── Success screen ──
  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#98BD46]/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#98BD46]" />
          </div>
          <h2 className="text-3xl font-bold text-[#0B4D7C]" style={{ fontFamily: "var(--font-heading)" }}>
            You&apos;re all set!
          </h2>
          <p className="text-[#4a6d8c] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Thank you, <strong>{data.ownerName}</strong>. Your business profile has been submitted. Your coach will review your numbers before the call and arrive prepared with specific insights, benchmarks, and action steps for <strong>{data.storeName}</strong>.
          </p>
          <p className="text-xs text-[#8aabb8] font-mono">Ref: {submissionId}</p>
          <div className="pt-2">
            <a
              href="/"
              className="btn-primary inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const sectionTitles = [
    { title: "About Your Store", sub: "Basic details to personalise your analysis" },
    { title: "Revenue & Gross Margin", sub: "The top of your P&L — where profitability starts" },
    { title: "Inventory & Open-to-Buy", sub: "How well your stock is working for you" },
    { title: "Cash Flow & Expenses", sub: "Where the money goes after the sale" },
    { title: "Payroll & Labour", sub: "Your largest controllable expense — and your biggest lever" },
    { title: "Owner's Pay & Profit", sub: "The number that matters most — what you actually take home" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      {/* Top bar */}
      <div className="bg-[#0B4D7C] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src={LOGO_URL} alt="RETAIL Mavens" width={140} height={40} className="h-9 w-auto object-contain brightness-0 invert" />
          <span className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            Pre-Call Business Template · Strictly Confidential
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="bg-[#0B4D7C] p-8 mb-6">
          <p className="text-[#98BD46] text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            RETAILMavens · Pre-Call Template
          </p>
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Your Business Numbers —<br />Before the Call
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xl mb-5" style={{ fontFamily: "var(--font-body)" }}>
            Please take 10–15 minutes to complete this before our coaching call. Your answers let us skip the basics and spend our time on what matters — your specific numbers, your gaps, and your fastest path forward.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Takes 10–15 minutes", "Last 12 months figures", "Estimates are fine", "Strictly confidential"].map((t) => (
              <span key={t} className="text-xs text-white/60 border border-white/15 px-3 py-1" style={{ fontFamily: "var(--font-body)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white border border-[#dce8f0] mb-6 flex overflow-hidden">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i < step && setStep(i)}
              className={`flex-1 py-3 text-center text-xs font-semibold border-r border-[#dce8f0] last:border-r-0 transition-colors ${
                i === step
                  ? "bg-[#98BD46] text-white"
                  : i < step
                  ? "bg-[#0B4D7C]/5 text-[#0B4D7C] cursor-pointer hover:bg-[#0B4D7C]/10"
                  : "text-[#a0b8cc] cursor-default"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="block text-base font-bold leading-none mb-0.5">{i + 1}</span>
              <span className="hidden sm:block">{s}</span>
            </button>
          ))}
        </div>

        {/* Section card */}
        <div className="bg-white border border-[#dce8f0]">
          {/* Section header */}
          <div className="flex items-center gap-4 px-6 py-4 bg-[#f4f7fb] border-b border-[#dce8f0]">
            <div
              className="w-9 h-9 rounded-full bg-[#0B4D7C] text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {step + 1}
            </div>
            <div>
              <p className="font-bold text-[#0B4D7C]" style={{ fontFamily: "var(--font-heading)" }}>
                {sectionTitles[step].title}
              </p>
              <p className="text-xs text-[#8aabb8]" style={{ fontFamily: "var(--font-body)" }}>
                {sectionTitles[step].sub}
              </p>
            </div>
          </div>

          {/* Section body */}
          <div className="p-6">
            {step === 0 && <Section1 data={data} set={set} />}
            {step === 1 && <Section2 data={data} set={set} />}
            {step === 2 && <Section3 data={data} set={set} />}
            {step === 3 && <Section4 data={data} set={set} />}
            {step === 4 && <Section5 data={data} set={set} />}
            {step === 5 && <Section6 data={data} set={set} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#dce8f0] bg-[#f4f7fb]">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 text-sm font-medium text-[#4a6d8c] disabled:opacity-30 hover:text-[#0B4D7C] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <span className="text-xs text-[#a0b8cc]" style={{ fontFamily: "var(--font-body)" }}>
              {step + 1} of {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!isStepValid()}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: "#0B4D7C", fontFamily: "var(--font-body)" }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || saving}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: "#98BD46", borderRadius: "10px", fontFamily: "var(--font-body)" }}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <>Submit Profile <CheckCircle2 className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
