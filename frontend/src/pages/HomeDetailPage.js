import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bed, Bath, Layers, Car, Ruler, Sparkles, Check, ArrowRight, Home as HomeIcon } from "lucide-react";
import { publicApi } from "@/lib/api";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingActions from "@/components/site/FloatingActions";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function HomeDetailPage() {
  const { slug } = useParams();
  const [home, setHome] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState(0);
  const { open } = useLeadModal();

  useEffect(() => {
    publicApi.getHome(slug).then(setHome).catch(() => setHome({}));
    publicApi.getSiteSettings().then(setSettings);
  }, [slug]);

  if (!home) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!home.id) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] grid place-items-center text-center px-6">
          <div>
            <div className="text-6xl">🏠</div>
            <div className="mt-4 text-2xl font-bold text-brand-navy">Home not found</div>
            <Link to="/" className="mt-4 inline-block btn-primary">Back to Home</Link>
          </div>
        </div>
        <Footer settings={settings} />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-24 bg-brand-bg min-h-screen">
        <div className="container-wide">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-navy/60 hover:text-brand-orange transition mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home Collection
          </Link>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden bg-white shadow-premium"
            >
              <div className="relative aspect-[16/10] bg-brand-bg">
                <img
                  src={home.gallery?.[selected] || home.cover_image}
                  alt={home.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest">
                  {home.style}
                </div>
              </div>
              {home.gallery?.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {home.gallery.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      data-testid={`gallery-thumb-${i}`}
                      className={`shrink-0 w-24 aspect-[4/3] rounded-xl overflow-hidden border-2 transition ${
                        selected === i ? "border-brand-orange" : "border-transparent"
                      }`}
                    >
                      <img src={g} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl bg-white shadow-soft border border-black/5 p-6"
            >
              <div className="section-eyebrow">{home.style}</div>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold text-brand-navy">{home.name}</h1>
              <p className="mt-3 text-brand-navy/70 leading-relaxed">{home.tagline}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatCell icon={Ruler} label="Area" value={home.area_sqft} />
                <StatCell icon={HomeIcon} label="Dimensions" value={home.dimensions || "–"} />
                <StatCell icon={Bed} label="Bedrooms" value={`${home.bedrooms} BHK`} />
                <StatCell icon={Bath} label="Bathrooms" value={home.bathrooms} />
                <StatCell icon={Layers} label="Floors" value={home.floors === 1 ? "G+1" : `G+${home.floors}`} />
                <StatCell icon={Car} label="Parking" value={`${home.parking} Car${home.parking > 1 ? "s" : ""}`} />
              </div>

              <div className="mt-5 rounded-2xl bg-brand-bg p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-navy/50">Estimated Cost</div>
                  <div className="text-2xl font-bold text-brand-navy">{home.estimated_cost}</div>
                </div>
                <button
                  onClick={() => open({ home: home.name, source: "home_detail" })}
                  data-testid="home-detail-cta"
                  className="btn-primary"
                >
                  Get Quote <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-widest text-brand-navy/50 mb-2">Package Compatibility</div>
                <div className="flex flex-wrap gap-2">
                  {home.package_compatibility?.map((p) => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange font-semibold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Description + Features */}
          <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-white p-6 shadow-soft border border-black/5"
            >
              <div className="section-eyebrow">Overview</div>
              <h3 className="mt-2 text-brand-navy">About this home</h3>
              <p className="mt-3 text-brand-navy/70 leading-relaxed">{home.description}</p>

              {home.features?.length > 0 && (
                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-widest text-brand-navy/50 mb-3">Highlights</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {home.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-brand-navy/85">
                        <Check className="w-4 h-4 text-brand-orange mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-white p-6 shadow-soft border border-black/5"
            >
              <div className="section-eyebrow">Floor Plan Areas</div>
              <h3 className="mt-2 text-brand-navy">Space breakdown</h3>
              <ul className="mt-4 space-y-2">
                {home.floor_areas?.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm py-2 border-b border-black/5 last:border-0">
                    <span className="text-brand-navy/80">{f.label}</span>
                    <span className="font-semibold text-brand-navy">{f.area}</span>
                  </li>
                ))}
              </ul>
              {home.floorplan_image && (
                <div className="mt-4 rounded-2xl overflow-hidden bg-brand-bg">
                  <img src={home.floorplan_image} alt="Floor plan" className="w-full h-full object-cover" />
                </div>
              )}
              {home.vastu_compliant && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                  <Sparkles className="w-4 h-4" /> Vastu-compliant layout
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
      <FloatingActions phone={settings?.phone} whatsapp={settings?.whatsapp} />
    </>
  );
}

function StatCell({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-black/5 p-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-orange" />
        <div className="text-[10px] uppercase tracking-widest text-brand-navy/50">{label}</div>
      </div>
      <div className="mt-1 font-bold text-brand-navy">{value}</div>
    </div>
  );
}
