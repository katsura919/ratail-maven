import Image from "next/image";
import Link from "next/link";

// ─── Brand constants ─────────────────────────────────────────────────────────

const LOGO_URL =
  "https://retailmavens.com/wp-content/uploads/2025/08/RM_logo_color_tag_web.webp";
const HERO_IMG_URL =
  "https://retailmavens.com/wp-content/uploads/2025/09/RETAILSMavens-Coaching.webp";

const NAV_LINKS = [
  { label: "Programs", href: "#programs" },
  { label: "About", href: "#about" },
  { label: "Results", href: "#results" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { value: "500+", label: "Retailers Coached" },
  { value: "15+", label: "Years of Experience" },
  { value: "$2M+", label: "In Added Retailer Revenue" },
  { value: "97%", label: "Client Satisfaction" },
];

const BENEFITS = [
  {
    icon: "🕊️",
    title: "More Freedom",
    body: "Stop being a prisoner of your store. Reclaim your time and finally enjoy the life you built your business to support.",
  },
  {
    icon: "📈",
    title: "More Profits",
    body: "Proven strategies across buying, pricing, inventory, and marketing that add real dollars to your bottom line.",
  },
  {
    icon: "😴",
    title: "Better Sleep",
    body: "Replace anxiety with confidence. When you have the right systems and support, the sleepless nights stop.",
  },
];

const PROGRAMS = [
  {
    tag: "COMMUNITY",
    name: "Inner Circle",
    desc: "Join a community of like-minded independent retailers. Monthly group coaching, resources, and peer support to keep you moving forward.",
    cta: "Join the Inner Circle",
    href: "#programs",
    accent: false,
  },
  {
    tag: "1:1 COACHING",
    name: "Private Coaching",
    desc: "Personalized, hands-on coaching for retailers who want fast results. We dig deep into your specific business and build a custom roadmap.",
    cta: "Apply for Coaching",
    href: "#programs",
    accent: true,
  },
  {
    tag: "COURSE",
    name: "Retail Bootcamp",
    desc: "A focused, self-paced curriculum covering the fundamentals every retailer needs — buying, merchandising, marketing, and more.",
    cta: "Enroll in Bootcamp",
    href: "#programs",
    accent: false,
  },
];

const STEPS = [
  {
    num: "01",
    title: "Find Your Path",
    body: "Take our free assessment to identify where your business is leaking money and energy. We pinpoint exactly where to focus first.",
  },
  {
    num: "02",
    title: "Build Your Plan",
    body: "Together we map out a clear, actionable plan tailored to your store, your goals, and your timeline — no generic advice.",
  },
  {
    num: "03",
    title: "Transform Your Business",
    body: "With the right coaching, community, and tools behind you, watch your profits grow and your stress shrink.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Working with Retail Mavens completely changed how I run my store. I went from dreading Mondays to actually loving my business again. My revenue is up 34% year-over-year.",
    name: "Sarah M.",
    role: "Boutique Owner, Nashville TN",
  },
  {
    quote:
      "I was on the verge of closing after 12 years. The coaching gave me the clarity and confidence to make the hard decisions. Two years later, we're thriving.",
    name: "James K.",
    role: "Hardware & Home Goods, Portland OR",
  },
  {
    quote:
      "The Inner Circle community alone is worth every penny. These are people who get it — who understand the unique challenges of independent retail. I've never felt less alone.",
    name: "Diana R.",
    role: "Children's Apparel, Austin TX",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#dce8f0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="RETAIL Mavens home">
            <Image
              src={LOGO_URL}
              alt="RETAIL Mavens"
              width={180}
              height={52}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[#0B4D7C] text-sm font-medium hover:text-[#98BD46] transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a href="#programs" className="btn-primary text-sm py-2.5 px-6">
            Join
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#0B4D7C] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="flex flex-col gap-6">
            <p
              className="text-[#98BD46] text-sm font-semibold tracking-widest uppercase"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Retail Coaching &amp; Consulting
            </p>
            <h1
              className="text-5xl md:text-6xl font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
            >
              More Freedom.<br />
              More Profits.<br />
              <span className="text-[#98BD46]">Better Sleep.</span>
            </h1>
            <p
              className="text-lg text-blue-100 leading-relaxed max-w-md"
              style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem" }}
            >
              Retail coaching &amp; consulting that empowers independent
              retailers to have more freedom, increased profits, and better
              sleep.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <a href="#programs" className="btn-primary">
                Find Your Path
              </a>
              <a
                href="#about"
                className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0B4D7C] rounded-none"
                style={{
                  background: "transparent",
                  border: "2px solid white",
                  borderRadius: 0,
                }}
              >
                Learn More ↓
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative rounded-none overflow-hidden shadow-2xl">
            <Image
              src={HERO_IMG_URL}
              alt="Retail Mavens Coaching"
              width={479}
              height={447}
              priority
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#98BD46]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {s.value}
              </span>
              <span
                className="text-sm text-white/90 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY / BENEFITS ── */}
      <section id="about" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[#98BD46] text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Why Retail Mavens
            </p>
            <h2
              className="text-4xl font-bold text-[#0B4D7C] max-w-2xl mx-auto leading-snug"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              You Started With a Dream.
              <br />
              <span className="text-[#98BD46]">Let&apos;s Make It Real.</span>
            </h2>
            <p
              className="mt-5 text-lg text-[#4a6d8c] max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Somewhere between payroll, inventory, and sleepless nights — the
              dream got buried. We help independent retailers find it again.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex flex-col items-start gap-4 p-8 border border-[#dce8f0] bg-[#f4f7fb]"
              >
                <span className="text-4xl">{b.icon}</span>
                <h3
                  className="text-xl font-bold text-[#0B4D7C]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-[#4a6d8c] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#f4f7fb] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[#98BD46] text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The Process
            </p>
            <h2
              className="text-4xl font-bold text-[#0B4D7C]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex flex-col gap-4 relative">
                {/* Connector line (not on last) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-[#98BD46] z-0" />
                )}
                <div
                  className="w-16 h-16 rounded-none flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: "#98BD46", fontFamily: "var(--font-heading)" }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-xl font-bold text-[#0B4D7C]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[#4a6d8c] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[#98BD46] text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Our Programs
            </p>
            <h2
              className="text-4xl font-bold text-[#0B4D7C]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Choose Your Path Forward
            </h2>
            <p
              className="mt-4 text-lg text-[#4a6d8c] max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Whether you&apos;re just starting out or ready to scale, we have
              a program that meets you where you are.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROGRAMS.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col gap-5 p-8 border ${
                  p.accent
                    ? "bg-[#0B4D7C] border-[#0B4D7C] text-white"
                    : "bg-white border-[#dce8f0] text-[#0B4D7C]"
                }`}
              >
                <span
                  className={`text-xs font-bold tracking-widest uppercase ${
                    p.accent ? "text-[#98BD46]" : "text-[#98BD46]"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {p.tag}
                </span>
                <h3
                  className={`text-2xl font-bold ${p.accent ? "text-white" : "text-[#0B4D7C]"}`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {p.name}
                </h3>
                <p
                  className={`leading-relaxed flex-1 ${
                    p.accent ? "text-blue-100" : "text-[#4a6d8c]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {p.desc}
                </p>
                <a
                  href={p.href}
                  className={p.accent ? "btn-primary text-center" : "btn-secondary text-center text-white"}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="results" className="bg-[#0B4D7C] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-[#98BD46] text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Real Results
            </p>
            <h2
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What Our Retailers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-5 p-8 bg-white/10 border border-white/20 backdrop-blur-sm"
              >
                <span className="text-[#98BD46] text-4xl leading-none">&ldquo;</span>
                <p
                  className="text-blue-100 leading-relaxed flex-1 italic"
                  style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}
                >
                  {t.quote}
                </p>
                <div>
                  <p
                    className="font-bold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-sm text-blue-200"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#98BD46] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center flex flex-col gap-6 items-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Transform Your Retail Business?
          </h2>
          <p
            className="text-lg text-white/90 max-w-xl leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Schedule a free 30-minute discovery call and find out exactly which
            program will move the needle fastest for your store.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <a
              href="#contact"
              className="btn-secondary text-white"
              style={{ backgroundColor: "#0B4D7C", color: "#FFFFFF" }}
            >
              Schedule a Free Discovery Call
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-[#0B4D7C] text-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-10">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Image
                src={LOGO_URL}
                alt="RETAIL Mavens"
                width={160}
                height={46}
                className="h-11 w-auto object-contain brightness-0 invert"
              />
              <p
                className="text-blue-200 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Retail coaching &amp; consulting that empowers independent
                retailers to have more freedom, increased profits, and better
                sleep.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3">
              <h4
                className="text-white font-bold text-sm uppercase tracking-widest mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Quick Links
              </h4>
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-blue-200 text-sm hover:text-[#98BD46] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <h4
                className="text-white font-bold text-sm uppercase tracking-widest mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Get in Touch
              </h4>
              <a
                href="mailto:hello@retailmavens.com"
                className="text-blue-200 text-sm hover:text-[#98BD46] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                hello@retailmavens.com
              </a>
              <a
                href="#contact"
                className="btn-primary text-sm py-2 px-5 mt-2 text-center"
              >
                Book a Call
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              className="text-blue-300 text-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              © {new Date().getFullYear()} RETAILMavens. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-blue-300 text-xs hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING CHAT BUTTON ── */}
      <Link
        href="/lead-qualifier"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 shadow-lg text-white text-sm font-semibold px-5 py-3"
        style={{
          backgroundColor: "#98BD46",
          borderRadius: "10px",
          fontFamily: "var(--font-heading)",
        }}
      >
        <span className="text-base">💬</span>
        Talk to a Maven
      </Link>
    </div>
  );
}
