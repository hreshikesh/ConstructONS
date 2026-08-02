import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useBrochureModal } from "@/components/site/BrochureModalProvider";

export default function PackagesComparePage() {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const { open: openBrochure } = useBrochureModal();

  useEffect(() => {
    publicApi.comparePackages().then(setData);
    publicApi.getSiteSettings().then(setSettings);
    window.scrollTo(0, 0);
  }, []);

  if (!data)
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );

  const { packages, category_order } = data;

  const findItem = (pkg, catName, itemLabel) => {
    const cat = (pkg.spec_categories || []).find((c) => c.name === catName);
    if (!cat) return null;
    return (cat.items || []).find(
      (i) => (i.spec || "").toLowerCase() === (itemLabel || "").toLowerCase()
    );
  };

  // Collect union of item labels within each category
  const categoryItems = {};
  category_order.forEach((cn) => {
    const set = [];
    const seen = new Set();
    packages.forEach((p) => {
      const cat = (p.spec_categories || []).find((c) => c.name === cn);
      (cat?.items || []).forEach((it) => {
        const k = (it.spec || "").toLowerCase();
        if (k && !seen.has(k)) {
          seen.add(k);
          set.push(it.spec);
        }
      });
    });
    categoryItems[cn] = set;
  });

  return (
    <>
      <Header />
      <main className="pt-28 pb-16 bg-brand-bg min-h-screen">
        <div className="container-wide">
          <Link
            to="/#packages"
            className="inline-flex items-center gap-2 text-sm text-brand-navy/60 hover:text-brand-orange mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> All packages
          </Link>
          <SectionLabel eyebrow="Compare Packages" />
          <h1 className="mt-2 text-brand-navy font-bold text-3xl md:text-4xl">
            Compare all packages side by side
          </h1>
          <p className="mt-3 text-brand-navy/60 max-w-2xl">
            See exactly what you get in each tier — materials, brands and finishes across every category.
          </p>

          <FadeIn className="mt-10">
            <div className="rounded-3xl bg-white border border-black/5 shadow-soft overflow-hidden overflow-x-auto">
              <table
                className="w-full border-collapse text-sm min-w-[900px]"
                data-testid="compare-table"
              >
                <thead>
                  <tr>
                    <th className="text-left align-top p-4 bg-white sticky left-0 z-10 border-b border-black/5 w-[220px]">
                      <div className="text-[10px] uppercase tracking-widest text-brand-navy/50">
                        Category / Item
                      </div>
                    </th>
                    {packages.map((p) => (
                      <th
                        key={p.id}
                        className={`text-left align-top p-4 border-b border-l border-black/5 w-[180px] ${
                          p.is_most_popular ? "bg-brand-navy text-white" : "bg-white"
                        }`}
                      >
                        {p.is_most_popular && (
                          <div className="text-[9px] uppercase tracking-widest text-brand-orangeLight mb-1">
                            Most Popular
                          </div>
                        )}
                        <div
                          className={`font-bold ${
                            p.is_most_popular ? "text-white" : "text-brand-navy"
                          }`}
                        >
                          {p.name}
                        </div>
                        <div
                          className={`text-xl font-extrabold mt-1 ${
                            p.is_most_popular ? "text-brand-orangeLight" : "text-brand-orange"
                          }`}
                        >
                          {p.price_display}
                          <span
                            className={`text-xs font-normal ml-1 ${
                              p.is_most_popular ? "text-white/60" : "text-brand-navy/60"
                            }`}
                          >
                            {p.price_unit}
                          </span>
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            p.is_most_popular ? "text-white/70" : "text-brand-navy/60"
                          }`}
                        >
                          {p.tagline}
                        </div>
                        <div className="mt-3 flex flex-col gap-1.5">
                          <Link
                            to={`/packages/${p.slug}`}
                            className={`text-xs font-semibold inline-flex items-center gap-1 ${
                              p.is_most_popular ? "text-white" : "text-brand-orange"
                            } hover:underline`}
                          >
                            View details <ArrowRight className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => openBrochure(p.slug, p.name)}
                            className={`text-xs font-semibold inline-flex items-center gap-1 ${
                              p.is_most_popular ? "text-brand-orangeLight" : "text-brand-navy/70"
                            } hover:underline`}
                          >
                            <Download className="w-3 h-3" /> Brochure
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {category_order.map((cat) => {
                    const items = categoryItems[cat] || [];
                    if (!items.length) return null;
                    return (
                      <React.Fragment key={cat}>
                        <tr className="bg-brand-bg/70">
                          <td
                            colSpan={packages.length + 1}
                            className="px-4 py-2.5 border-t border-black/5"
                          >
                            <div className="section-eyebrow">{cat}</div>
                          </td>
                        </tr>
                        {items.map((label) => (
                          <tr key={cat + label} className="hover:bg-brand-bg/30">
                            <td className="px-4 py-3 border-t border-black/5 align-top font-semibold text-brand-navy/85 text-xs">
                              {label}
                            </td>
                            {packages.map((p) => {
                              const it = findItem(p, cat, label);
                              return (
                                <td
                                  key={p.id + cat + label}
                                  className="px-4 py-3 border-t border-l border-black/5 align-top text-xs"
                                >
                                  {it ? (
                                    <div>
                                      <div className="text-brand-navy/85 leading-snug">
                                        {it.value || "-"}
                                      </div>
                                      {it.brand && (
                                        <div className="text-brand-navy/60 mt-0.5 text-[10px]">
                                          {it.brand}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-brand-navy/30">—</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <div className="mt-10 rounded-3xl bg-brand-navy p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="section-eyebrow text-brand-orangeLight">Not sure yet?</div>
              <div className="mt-1 text-xl md:text-2xl font-bold">
                Talk to a consultant — they&apos;ll help you pick the right package.
              </div>
            </div>
            <Link to="/contact" className="btn-primary">
              Get Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
