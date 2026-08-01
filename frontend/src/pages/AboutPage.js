import React, { useEffect, useState } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Building2, Users, Sparkles, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const [team, setTeam] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getTeam().then(setTeam);
    publicApi.getFaqs().then(setFaqs);
    publicApi.getSiteSettings().then(setSettings);
  }, []);

  return (
    <>
      <Header />
      <main className="pt-28 pb-24">
        <div className="container-wide">
          <div className="section-eyebrow">About Us</div>
          <h1 className="mt-2 text-brand-navy font-bold max-w-3xl">
            Building India&rsquo;s most intelligent construction platform — one home at a time.
          </h1>
          <p className="mt-4 text-brand-navy/60 max-w-3xl">
            ConstructONS combines architectural craft with an AI-native operating platform so home
            builders get transparent pricing, live tracking and enterprise-grade quality.
          </p>

          <div className="mt-10 grid md:grid-cols-4 gap-4">
            {[
              { icon: Building2, k: "250+", v: "Homes Planned" },
              { icon: Sparkles, k: "10+", v: "Years of experience" },
              { icon: ShieldCheck, k: "98%", v: "On-time delivery" },
              { icon: Users, k: "50+", v: "Expert professionals" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-white border border-black/5 shadow-soft p-5">
                <s.icon className="w-5 h-5 text-brand-orange" />
                <div className="mt-2 text-2xl font-bold text-brand-navy">{s.k}</div>
                <div className="text-xs text-brand-navy/60">{s.v}</div>
              </motion.div>
            ))}
          </div>

          <section className="mt-16">
            <div className="section-eyebrow">Leadership</div>
            <h2 className="mt-2 text-brand-navy">Meet the team</h2>
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {team.map((m) => (
                <div key={m.id} className="rounded-2xl bg-white border border-black/5 shadow-soft p-4">
                  <div className="aspect-square rounded-xl overflow-hidden bg-brand-bg">
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-3 font-semibold text-brand-navy">{m.name}</div>
                  <div className="text-xs text-brand-orange">{m.role}</div>
                  <div className="text-xs text-brand-navy/60 mt-1">{m.bio}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="mt-16">
            <div className="section-eyebrow">FAQ</div>
            <h2 className="mt-2 text-brand-navy">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white">
              {faqs.map((f) => (
                <details key={f.id} className="group p-5">
                  <summary className="list-none flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-brand-navy">{f.question}</span>
                    <span className="w-6 h-6 rounded-full grid place-items-center bg-brand-orange/10 text-brand-orange text-lg group-open:rotate-45 transition">+</span>
                  </summary>
                  <div className="mt-3 text-sm text-brand-navy/70 leading-relaxed">{f.answer}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
