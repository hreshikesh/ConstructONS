import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Users, Home, Cpu, ArrowRight, ArrowLeft, Sparkles,
  CheckCircle2, Download, RefreshCcw, Building2
} from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useBrochureModal } from "@/components/site/BrochureModalProvider";
import { useLeadModal } from "@/components/site/LeadModalProvider";

const QUESTIONS = [
  {
    key: "budget",
    icon: Wallet,
    title: "What’s your budget preference?",
    subtitle: "Pick the tier that best matches your comfort zone.",
    options: [
      { value: "value", label: "Value focused", desc: "Best essentials without overspending", note: "~ ₹1,499 / sq.ft" },
      { value: "balanced", label: "Balanced", desc: "A great mix of quality and value", note: "~ ₹1,799 / sq.ft" },
      { value: "premium", label: "Premium", desc: "Designer finishes with smart features", note: "~ ₹2,199 / sq.ft" },
      { value: "luxury", label: "Luxury", desc: "Bespoke, hand-crafted, imported", note: "Custom quote" },
    ],
  },
  {
    key: "family_size",
    icon: Users,
    title: "How big is your family?",
    subtitle: "We’ll pick homes with the right number of bedrooms.",
    options: [
      { value: "1-2", label: "1 to 2", desc: "Couple / young family" },
      { value: "3-4", label: "3 to 4", desc: "Growing family" },
      { value: "5+", label: "5 or more", desc: "Multi-generation home" },
    ],
  },
  {
    key: "style",
    icon: Home,
    title: "What architectural style do you love?",
    subtitle: "We have designs across every style.",
    options: [
      { value: "modern", label: "Modern", desc: "Clean lines, open plan, glass" },
      { value: "classic", label: "Classic", desc: "Timeless, formal, elegant" },
      { value: "villa", label: "Villa", desc: "Spacious, garden, private" },
      { value: "duplex", label: "Duplex", desc: "Two floors of curated space" },
      { value: "any", label: "I’m open", desc: "Show me the best options" },
    ],
  },
  {
    key: "smart_home",
    icon: Cpu,
    title: "How smart do you want your home?",
    subtitle: "From basic automation to whole-home Crestron.",
    options: [
      { value: "no", label: "Standard", desc: "Regular switches, no automation" },
      { value: "basic", label: "Basic Smart", desc: "Smart switches + voice assistant" },
      { value: "full", label: "Full Automation", desc: "Lights, curtains, AC, security — one system" },
    ],
  },
];

export default function FindMyPackagePage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState(null);
  const { open: openBrochure } = useBrochureModal();
  const { open: openLead } = useLeadModal();

  React.useEffect(() => {
    publicApi.getSiteSettings().then(setSettings);
    window.scrollTo(0, 0);
  }, []);

  const total = QUESTIONS.length;
  const progress = Math.round(((step) / total) * 100);

  const pickAnswer = (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    // Auto-advance
    setTimeout(() => {
      if (step < total - 1) setStep(step + 1);
      else submit(next);
    }, 200);
  };

  const submit = async (final) => {
    setLoading(true);
    try {
      const res = await publicApi.recommendPackage(final);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setAnswers({});
    setStep(0);
  };

  return (
    <>
      <Header />
      <main className="pt-28 pb-16 bg-gradient-to-br from-white via-brand-bg to-white min-h-screen">
        <div className="container-wide max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel eyebrow="Find My Perfect Package" />
              <h1 className="mt-2 text-brand-navy font-bold text-3xl md:text-4xl">4 quick questions,<br /> personalised in 30 seconds.</h1>
            </div>
            {!result && (
              <div className="hidden md:block text-xs text-brand-navy/60">
                Step {Math.min(step + 1, total)} of {total}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {!result && (
            <div className="mt-6 h-1.5 bg-brand-navy/10 rounded-full overflow-hidden" aria-hidden>
              <motion.div
                className="h-full bg-brand-orange"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / total) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )}

          {/* Question OR Result */}
          <div className="mt-8 relative min-h-[420px]">
            {loading && (
              <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm z-10 rounded-3xl">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
                  <div className="mt-3 text-sm text-brand-navy/70">Finding your perfect package…</div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl bg-white border border-black/5 shadow-premium p-6 md:p-8"
                  data-testid={`quiz-step-${step}`}
                >
                  <QuestionStep
                    question={QUESTIONS[step]}
                    selected={answers[QUESTIONS[step].key]}
                    onPick={(v) => pickAnswer(QUESTIONS[step].key, v)}
                  />
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      disabled={step === 0}
                      onClick={() => setStep(step - 1)}
                      className="inline-flex items-center gap-1 text-sm text-brand-navy/60 hover:text-brand-navy disabled:opacity-30"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      disabled={!answers[QUESTIONS[step].key]}
                      onClick={() => (step < total - 1 ? setStep(step + 1) : submit(answers))}
                      className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {step < total - 1 ? "Continue" : "Show my recommendation"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <ResultScreen
                  key="result"
                  result={result}
                  onReset={reset}
                  onDownload={(slug, name) =>
                    openBrochure(slug, name, { quiz_submission_id: result.submission_id })
                  }
                  onConsult={(pkgName) =>
                    openLead({
                      package: pkgName,
                      source: "quiz",
                      quiz_submission_id: result.submission_id,
                    })
                  }
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}

function QuestionStep({ question, selected, onPick }) {
  const Icon = question.icon;
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand-orange/10 text-brand-orange grid place-items-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-brand-navy font-bold text-xl">{question.title}</div>
          <div className="text-sm text-brand-navy/60">{question.subtitle}</div>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
        {question.options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              data-testid={`quiz-option-${question.key}-${opt.value}`}
              onClick={() => onPick(opt.value)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                active
                  ? "border-brand-orange bg-brand-orange/10 shadow-glow"
                  : "border-black/10 bg-white hover:border-brand-navy/40 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={`font-bold ${active ? "text-brand-orange" : "text-brand-navy"}`}>{opt.label}</div>
                  <div className="text-xs text-brand-navy/60 mt-0.5">{opt.desc}</div>
                </div>
                {active && <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0" />}
              </div>
              {opt.note && (
                <div className={`mt-2 text-[11px] font-semibold ${active ? "text-brand-orange" : "text-brand-navy/60"}`}>{opt.note}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultScreen({ result, onReset, onDownload, onConsult }) {
  const rec = result.recommended_package;
  const homes = result.shortlisted_homes || [];
  const alts = result.alternatives || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
      data-testid="quiz-result"
    >
      {/* Hero result card */}
      <div className="relative rounded-3xl overflow-hidden bg-brand-navy text-white p-6 md:p-8 shadow-premium">
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-brand-orange/25 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest shadow-glow">
            <Sparkles className="w-3 h-3" /> Recommended for you
          </div>
          <h2 className="mt-3 text-white font-bold text-3xl md:text-4xl">{rec?.name}</h2>
          <p className="mt-2 text-white/70 max-w-xl">{rec?.tagline} — {rec?.description}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <div className="text-4xl font-extrabold text-gradient-orange">{rec?.price_display}</div>
            {rec?.price_unit && <div className="text-white/60">{rec.price_unit}</div>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/packages/${rec?.slug}`} data-testid="quiz-view-package" className="btn-primary">
              View full package <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => onDownload(rec?.slug, rec?.name)} data-testid="quiz-download-brochure" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-5 py-3 transition">
              <Download className="w-4 h-4" /> Get Personalised Brochure
            </button>
            <button onClick={() => onConsult(rec?.name)} className="inline-flex items-center gap-2 rounded-full text-white/80 hover:text-white text-sm font-semibold px-3 py-2">
              Talk to a consultant →
            </button>
          </div>
        </div>
      </div>

      {/* Shortlisted homes */}
      {homes.length > 0 && (
        <div className="rounded-3xl bg-white border border-black/5 shadow-soft p-6 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-eyebrow">Homes we picked for you</div>
              <div className="mt-1 text-lg font-bold text-brand-navy">{homes.length} matched design{homes.length > 1 ? "s" : ""}</div>
            </div>
            <button onClick={onReset} className="inline-flex items-center gap-1 text-xs text-brand-navy/60 hover:text-brand-orange">
              <RefreshCcw className="w-3.5 h-3.5" /> Retake quiz
            </button>
          </div>
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            {homes.map((h) => (
              <Link key={h.id} to={`/homes/${h.slug}`} data-testid={`quiz-home-${h.slug}`} className="group rounded-2xl overflow-hidden bg-white border border-black/5 hover:shadow-premium hover:-translate-y-0.5 transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={h.cover_image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-3">
                  <div className="font-semibold text-brand-navy">{h.name}</div>
                  <div className="text-[11px] text-brand-navy/60">{h.bedrooms} BHK · {h.area_sqft}</div>
                  <div className="mt-1 text-xs font-bold text-brand-orange">{h.estimated_cost}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {alts.length > 0 && (
        <div className="rounded-3xl bg-white border border-black/5 shadow-soft p-6 md:p-7">
          <div className="section-eyebrow">Also worth considering</div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {alts.map((p) => (
              <Link key={p.id} to={`/packages/${p.slug}`} className="group rounded-2xl border border-black/5 p-4 hover:border-brand-navy/40 hover:shadow-soft transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-brand-navy">{p.name}</div>
                    <div className="text-xs text-brand-navy/60">{p.tagline}</div>
                  </div>
                  <div className="text-lg font-extrabold text-brand-orange">{p.price_display}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
