import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonorCard } from "@/components/donors/DonorCard";
import { DonorCardSkeleton } from "@/components/donors/DonorCardSkeleton";
import { DonorDialog } from "@/components/donors/DonorDialog";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { extractDonersList, getDoners } from "@/api/donors";
import { mapApiUserToUser } from "@/api/mappers";
import { cn } from "@/lib/utils";
import styles from "./RecentDonorsSection.module.css";

const RECENT_DONORS_LIMIT = 8;

const SLIDE_CLASS =
  "flex min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-4.5rem)/4)]";

const ARROW_CLASS =
  "absolute top-[calc(50%-0.5rem)] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-background/90 text-primary shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-transparent hover:blood-gradient hover:text-white hover:blood-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex";

export function RecentDonorsSection() {
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { t } = useTranslation();

  const recentDonorsQuery = useQuery({
    queryKey: ["doners", "recent", RECENT_DONORS_LIMIT],
    queryFn: async () => {
      const res = await getDoners({ page: 1, size: RECENT_DONORS_LIMIT });
      return extractDonersList(res);
    },
    retry: false,
    staleTime: 10_000,
  });

  const recentDonors = (recentDonorsQuery.data?.data ?? [])
    .slice(0, RECENT_DONORS_LIMIT)
    .map(mapApiUserToUser);

  /** Measures the track: slide step width, slides per view and page count. */
  const getMetrics = useCallback(() => {
    const viewport = scrollRef.current;
    if (!viewport) return null;

    const slides = viewport.children;
    const total = slides.length;
    const first = slides[0] as HTMLElement | undefined;
    const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
    const step = first ? first.offsetWidth + gap : viewport.clientWidth;
    const perView = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
    const pages = total <= perView ? 1 : Math.ceil((total - perView) / perView) + 1;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;

    return { viewport, step, perView, pages, maxScroll };
  }, []);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;

    const update = () => {
      const metrics = getMetrics();
      if (!metrics) return;
      const { step, perView, pages, maxScroll } = metrics;
      const { scrollLeft } = viewport;
      const atEnd = scrollLeft >= maxScroll - 1;

      setPageCount(pages);
      setActivePage(
        atEnd ? pages - 1 : Math.min(pages - 1, Math.round(scrollLeft / step / perView)),
      );
      setCanScrollPrevious(scrollLeft > 1);
      setCanScrollNext(!atEnd);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    viewport.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", update);
    };
  }, [getMetrics, recentDonors.length, recentDonorsQuery.isLoading]);

  const goToPage = (page: number) => {
    const metrics = getMetrics();
    if (!metrics) return;
    const { viewport, step, perView, pages, maxScroll } = metrics;
    const target = Math.max(0, Math.min(page, pages - 1));

    viewport.scrollTo({
      left: Math.min(target * perView * step, maxScroll),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const handleDonorClick = (donorId: string) => {
    setSelectedDonorId(donorId);
    setDialogOpen(true);
  };

  return (
    <section className="relative isolate py-20">
      <div aria-hidden="true" className="section-pattern pattern-dots pattern-fade-sides" />
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <span className="eyebrow mb-4">
              <Users className="h-4 w-4" />
              {t('recentDonors.badge')}
            </span>
            <h2 id="recent-donors-title" className="text-3xl md:text-4xl font-bold">
              {t('recentDonors.title')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t('recentDonors.subtitle')}
            </p>
          </div>

          <Button asChild variant="outline" className="group hidden shrink-0 rounded-full md:flex">
            <Link href="/donors">
              {t('recentDonors.seeAll')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="relative">
          {/* Floating side arrows (desktop/tablet) */}
          <button
            type="button"
            className={cn(
              ARROW_CLASS,
              "left-0 -translate-x-1/2",
              !canScrollPrevious && "pointer-events-none scale-90 opacity-0",
            )}
            aria-label={t('recentDonors.previous')}
            aria-controls="recent-donors-scroll"
            tabIndex={canScrollPrevious ? 0 : -1}
            onClick={() => goToPage(activePage - 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={cn(
              ARROW_CLASS,
              "right-0 translate-x-1/2",
              !canScrollNext && "pointer-events-none scale-90 opacity-0",
            )}
            aria-label={t('recentDonors.next')}
            aria-controls="recent-donors-scroll"
            tabIndex={canScrollNext ? 0 : -1}
            onClick={() => goToPage(activePage + 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            id="recent-donors-scroll"
            role="region"
            aria-labelledby="recent-donors-title"
            tabIndex={0}
            className={`${styles.scrollTrack} flex items-stretch gap-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory rounded-xl pt-2 pb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background`}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                goToPage(activePage + (event.key === "ArrowLeft" ? -1 : 1));
              }
            }}
          >
            {recentDonorsQuery.isLoading
              ? Array.from({ length: RECENT_DONORS_LIMIT }).map((_, index) => (
                  <div key={index} className={SLIDE_CLASS}>
                    <DonorCardSkeleton />
                  </div>
                ))
              : recentDonors.map((donor) => (
                  <div key={donor.id} className={SLIDE_CLASS}>
                    <DonorCard
                      donor={donor}
                      onClick={() => handleDonorClick(donor.id)}
                    />
                  </div>
                ))}
            {!recentDonorsQuery.isLoading && (
              <div className={SLIDE_CLASS}>
                <Link
                  href="/donors"
                  className="group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center text-primary transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:blood-gradient group-hover:text-white group-hover:blood-glow">
                    <ArrowRight className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-lg font-semibold">{t('recentDonors.seeAll')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pagination dots */}
        {pageCount > 1 && (
          <div
            className="mt-2 flex items-center justify-center gap-1"
            role="group"
            aria-label={t('recentDonors.pagination')}
          >
            {Array.from({ length: pageCount }).map((_, index) => {
              const isActive = index === activePage;
              return (
                <button
                  key={index}
                  type="button"
                  className="group flex h-6 items-center justify-center px-1 focus-visible:outline-none"
                  aria-label={t('recentDonors.goToPage', { page: index + 1 })}
                  aria-current={isActive ? "true" : undefined}
                  aria-controls="recent-donors-scroll"
                  onClick={() => goToPage(index)}
                >
                  <span
                    className={cn(
                      "block h-2 rounded-full transition-all duration-300 ease-out group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background",
                      isActive
                        ? "w-8 blood-gradient"
                        : "w-2 bg-primary/25 group-hover:bg-primary/50",
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        <DonorDialog
          donorId={selectedDonorId}
          open={dialogOpen}
          onOpenChange={(nextOpen) => {
            setDialogOpen(nextOpen);
            if (!nextOpen) setSelectedDonorId(null);
          }}
        />
      </div>
    </section>
  );
}
