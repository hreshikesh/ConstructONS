import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Bed, Bath, Layers, Ruler, Car } from "lucide-react";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function HomeCollection({ homes = [] }) {
  const scroller = useRef(null);

  const scroll = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="home-collection" data-testid="home-collection-section" className="py-24 md:py-32 bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-end">
          <FadeIn>
            <SectionLabel number={2} eyebrow="Home Collection" />
            <h2 className="mt-4 text-brand-navy font-bold">
              Ready-to-Build<br /> Home Designs
            </h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              Choose from our expertly designed homes with complete plans, specifications and 3D walkthroughs.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Link to="/#home-collection" className="btn-primary text-sm py-2.5 px-5" onClick={(e) => e.preventDefault()}>
                View All Home Designs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="ml-2 hidden md:flex items-center gap-2">
                <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full grid place-items-center border border-brand-navy/15 hover:border-brand-navy transition" aria-label="prev">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full grid place-items-center border border-brand-navy/15 hover:border-brand-navy transition" aria-label="next">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </FadeIn>

          <div
            ref={scroller}
            data-testid="home-collection-scroller"
            className="flex gap-5 overflow-x-auto pb-4 -mx-5 px-5 lg:mx-0 lg:px-0 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {homes.map((h) => (
              <HomeCard key={h.id} home={h} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeCard({ home }) {
  return (
    <Link
      to={`/homes/${home.slug}`}
      data-testid={`home-card-${home.slug}`}
      className="group snap-start shrink-0 w-[280px] md:w-[300px] bg-white rounded-3xl shadow-soft border border-black/5 hover:shadow-premium hover:-translate-y-1 transition-all duration-500 overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={home.cover_image}
          alt={home.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest">
          {home.style}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-brand-navy">{home.name}</div>
        </div>
        <div className="mt-1 text-[11px] text-brand-navy/60 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1"><Ruler className="w-3 h-3" /> {home.dimensions || home.area_sqft}</span>
          <span className="divider-dot" />
          <span>{home.area_sqft}</span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-brand-navy/70 text-xs">
          <span className="inline-flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {home.bedrooms} BHK</span>
          <span className="inline-flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {home.bathrooms} Bath</span>
          <span className="inline-flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {home.floors === 1 ? "G+1 Floor" : `G+${home.floors} Floor`}</span>
        </div>
        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-brand-navy/50 uppercase tracking-widest">Estimated</div>
            <div className="text-brand-navy font-bold text-sm">{home.estimated_cost}</div>
          </div>
          <span className="text-brand-orange text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
