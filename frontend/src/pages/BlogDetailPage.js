import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [b, setB] = useState(null);
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    publicApi.getBlog(slug).then(setB).catch(() => setB({}));
    publicApi.getSiteSettings().then(setSettings);
  }, [slug]);
  if (!b) return <div className="min-h-screen grid place-items-center"><div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" /></div>;
  return (
    <>
      <Header />
      <main className="pt-28 pb-24">
        <div className="container-wide max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-brand-navy/60 hover:text-brand-orange"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
          <div className="section-eyebrow mt-6">Article</div>
          <h1 className="mt-2 text-brand-navy font-bold">{b.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-xs text-brand-navy/60">
            <span>{b.author}</span>
            <span className="divider-dot" />
            <span>{b.read_minutes} min read</span>
          </div>
          <div className="mt-6 rounded-2xl overflow-hidden aspect-[16/9] bg-brand-bg">
            <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
          </div>
          <article className="prose prose-slate mt-6 max-w-none text-brand-navy/80" dangerouslySetInnerHTML={{ __html: b.content_html }} />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
