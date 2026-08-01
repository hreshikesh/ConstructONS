import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    publicApi.getBlogs().then(setBlogs);
    publicApi.getSiteSettings().then(setSettings);
  }, []);
  return (
    <>
      <Header />
      <main className="pt-28 pb-24">
        <div className="container-wide">
          <div className="section-eyebrow">Blog</div>
          <h1 className="mt-2 text-brand-navy font-bold">Insights on modern construction</h1>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {blogs.map((b) => (
              <Link key={b.id} to={`/blog/${b.slug}`} className="group rounded-2xl overflow-hidden bg-white border border-black/5 shadow-soft hover:shadow-premium transition">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-brand-navy/60">
                    <span>{b.author}</span>
                    <span className="divider-dot" />
                    <span>{b.read_minutes} min read</span>
                  </div>
                  <div className="mt-2 font-semibold text-brand-navy leading-tight">{b.title}</div>
                  <div className="mt-1 text-xs text-brand-navy/60">{b.excerpt}</div>
                  <div className="mt-3 text-brand-orange text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition">
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
