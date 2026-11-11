import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonorCard } from "@/components/donors/DonorCard";
import { DonorCardSkeleton } from "@/components/donors/DonorCardSkeleton";
import { DonorDialog } from "@/components/donors/DonorDialog";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { extractDonersList, getDoners } from "@/api/donors";
import { mapApiUserToUser } from "@/api/mappers";
import styles from "./RecentDonorsSection.module.css";

const RECENT_DONORS_LIMIT = 8;

export function RecentDonorsSection() {
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const recentDonors = (recentDonorsQuery.data?.data ?? []).map(mapApiUserToUser);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;

    const updateScrollControls = () => {
      setCanScrollPrevious(viewport.scrollLeft > 1);
      setCanScrollNext(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1);
    };

    updateScrollControls();
    const observer = new ResizeObserver(updateScrollControls);
    observer.observe(viewport);
    viewport.addEventListener("scroll", updateScrollControls, { passive: true });

    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", updateScrollControls);
    };
  }, [recentDonors.length, recentDonorsQuery.isLoading]);

  const scrollDonors = (direction: -1 | 1) => {
    const viewport = scrollRef.current;
    if (!viewport) return;

    const firstCard = viewport.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
    viewport.scrollBy({
      left: direction * ((firstCard?.offsetWidth ?? viewport.clientWidth) + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  const handleDonorClick = (donorId: string) => {
    setSelectedDonorId(donorId);
    setDialogOpen(true);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{t('recentDonors.badge')}</span>
            </div>
            <h2 id="recent-donors-title" className="text-3xl md:text-4xl font-bold">
              {t('recentDonors.title')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t('recentDonors.subtitle')}
            </p>
          </div>

          <div className="flex w-full items-center justify-center gap-3 md:w-auto md:justify-end">
            <Button asChild variant="outline" className="hidden md:flex shrink-0">
              <Link href="/donors">
                {t('recentDonors.seeAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label={t('recentDonors.previous')}
                aria-controls="recent-donors-scroll"
                disabled={!canScrollPrevious}
                onClick={() => scrollDonors(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label={t('recentDonors.next')}
                aria-controls="recent-donors-scroll"
                disabled={!canScrollNext}
                onClick={() => scrollDonors(1)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          id="recent-donors-scroll"
          role="region"
          aria-labelledby="recent-donors-title"
          tabIndex={0}
          className={`${styles.scrollTrack} flex gap-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory rounded-xl pt-2 pb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background`}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              scrollDonors(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          {recentDonorsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-4.5rem)/4)]"
                >
                  <DonorCardSkeleton />
                </div>
              ))
            : recentDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-4.5rem)/4)]"
                >
                  <DonorCard
                    donor={donor}
                    onClick={() => handleDonorClick(donor.id)}
                  />
                </div>
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/donors">
              {t('recentDonors.seeAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

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
