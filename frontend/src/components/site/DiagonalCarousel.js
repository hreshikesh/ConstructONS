import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";

const DEFAULT_TRANSITION = {
    type: "spring",
    bounce: 0.15,
    duration: 0.8,
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function DiagonalCarousel({
    items = [],
    activeIndex,
    onActiveIndexChange,
    autoPlay = true,
    autoPlayInterval = 3500,
    slideSize = 220,
    slideAspect = 0.72, // width / height — 0.72 = tall portrait card
    rotationStep = 20,
    verticalStep = 78,
    inactiveScale = 0.58,
    transition = DEFAULT_TRANSITION,
    showControls = true,
    showDots = true,
    showHint = true,
    className,
    labelClassName,
    imageClassName,
    renderSlide,
}) {
    const N = items.length;
    const [virtualIndex, setVirtualIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [hintVisible, setHintVisible] = useState(false);

    const realIndex = N > 0 ? ((virtualIndex % N) + N) % N : 0;
    const slideHeight = slideSize / slideAspect;
    useEffect(() => {
        // Your effect logic using virtualIndex
        doSomething(virtualIndex);
    }, [virtualIndex]);
    useEffect(() => {
        if (N > 0) onActiveIndexChange?.(realIndex);
    }, [virtualIndex, N, onActiveIndexChange, realIndex]);

    useEffect(() => {
        if (activeIndex !== undefined && N > 0) {
            const currentReal = ((virtualIndex % N) + N) % N;
            if (activeIndex !== currentReal) {
                let diff = (((activeIndex - currentReal) % N) + N) % N;
                if (diff > N / 2) diff -= N;
                setVirtualIndex((v) => v + diff);
            }
        }
    }, [activeIndex, N]);

    useEffect(() => {
        if (!autoPlay || isHovered || N <= 1) return;
        const interval = setInterval(() => {
            setVirtualIndex((v) => v + 1);
        }, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlay, isHovered, autoPlayInterval, N]);

    useEffect(() => {
        if (!showHint || isHovered) {
            setHintVisible(false);
            return;
        }
        const timer = setTimeout(() => setHintVisible(true), 1200);
        const hideTimer = setTimeout(() => setHintVisible(false), 3200);
        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, [virtualIndex, showHint, isHovered]);

    if (!N) return null;

    const OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

    return (
        <div
            className={cn("relative isolate h-full w-full overflow-hidden", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        >
            {autoPlay && !isHovered && N > 1 && (
                <div className="absolute left-0 right-0 top-0 z-20 h-[2px] overflow-hidden bg-white/10">
                    <motion.div
                        key={virtualIndex}
                        className="h-full bg-[#FF5A00]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
                    />
                </div>
            )}

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-[26%] h-0 w-0">
                    {OFFSETS.map((offset) => {
                        const vIndex = virtualIndex + offset;
                        const rIndex = ((vIndex % N) + N) % N;
                        const item = items[rIndex];
                        const isActive = offset === 0;

                        return (
                            <motion.div
                                key={vIndex}
                                className="absolute top-0 flex flex-col items-center gap-2 will-change-transform"
                                style={{
                                    width: slideSize,
                                    left: -slideSize / 2,
                                }}
                                animate={{
                                    x: offset * slideSize,
                                    rotate: offset * rotationStep,
                                    y: offset * verticalStep,
                                    scale: isActive ? 1 : inactiveScale,
                                    opacity: Math.abs(offset) > 2.5 ? 0 : 1,
                                }}
                                transition={transition}
                            >
                                <motion.p
                                    className={cn(
                                        "whitespace-nowrap text-xs font-semibold uppercase tracking-[0.15em] text-white/90",
                                        labelClassName
                                    )}
                                    animate={{
                                        opacity: isActive ? 1 : 0,
                                        scale: isActive ? 1 : 0.7,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {item.title}
                                </motion.p>

                                <button
                                    type="button"
                                    aria-label={`Show ${item.title}`}
                                    className="w-full cursor-pointer focus:outline-none"
                                    style={{ height: slideHeight }}
                                    onClick={() => setVirtualIndex(vIndex)}
                                >
                                    {renderSlide ? (
                                        renderSlide(item, isActive)
                                    ) : (
                                        <img
                                            src={item.src}
                                            alt={item.alt ?? item.title}
                                            draggable={false}
                                            className={cn(
                                                "h-full w-full select-none rounded-2xl object-cover shadow-2xl transition-all duration-300",
                                                isActive
                                                    ? "ring-2 ring-[#FF5A00]/50 shadow-[0_12px_40px_rgba(255,90,0,0.3)]"
                                                    : "",
                                                imageClassName
                                            )}
                                        />
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {hintVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="pointer-events-none absolute right-6 top-1/2 z-20 -translate-y-1/2"
                    >
                        <div className="relative flex items-center gap-2 rounded-full border border-[#FF5A00]/40 bg-[#FF5A00]/95 px-3.5 py-1.5 shadow-[0_8px_30px_rgba(255,90,0,0.4)] backdrop-blur-md">
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                            >
                                Next Design
                            </motion.span>
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ChevronRight className="h-4 w-4 text-white" />
                            </motion.div>
                            <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-[#FF5A00]/40 bg-[#FF5A00]/95" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showHint && (
                <div className="pointer-events-none absolute bottom-16 left-5 z-10 flex items-center gap-2 text-white/50">
                    <MousePointer2 className="h-3 w-3" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em]">
                        Hover to pause
                    </span>
                </div>
            )}

            {showControls && (
                <div className="absolute inset-x-4 bottom-4 z-10 mx-auto flex w-fit items-center justify-center gap-2.5 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-white shadow-lg backdrop-blur-md">
                    <button
                        type="button"
                        aria-label="Previous slide"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                        onClick={() => setVirtualIndex((v) => v - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {showDots && (
                        <div className="flex items-center justify-center gap-1.5">
                            {items.map((item, index) => (
                                <button
                                    key={`dot-${item.id ?? index}`}
                                    type="button"
                                    aria-label={`Slide ${index + 1}`}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        realIndex === index
                                            ? "w-6 bg-[#FF5A00] opacity-100"
                                            : "w-1.5 bg-white opacity-40"
                                    )}
                                    onClick={() => {
                                        let diff = (((index - realIndex) % N) + N) % N;
                                        if (diff > N / 2) diff -= N;
                                        setVirtualIndex((v) => v + diff);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        aria-label="Next slide"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                        onClick={() => setVirtualIndex((v) => v + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}