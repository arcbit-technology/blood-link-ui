"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, Clock, Droplet, Heart, MapPin, Search, Siren } from "lucide-react";
import { BLOOD_GROUPS, DISTRICTS, DIVISIONS } from "@/data/mockData";
import type { Division } from "@/types";
import {
  MAP_ASPECT,
  MAP_DISTRICT_LINES,
  MAP_DISTRICTS,
  MAP_DIVISION_LINES,
  MAP_OUTLINE,
  MAP_PINS,
  MAP_VIEWBOX,
  type MapDistrict,
} from "./bangladeshMap";
import styles from "./HeroSection.module.css";

const AVATAR_GROUPS = ["O+", "A+", "B+", "AB+"];

// Divisions whose label sits to the left of the pin, so neighbours don't collide.
const LABEL_LEFT = new Set<Division>(["Mymensingh", "Sylhet", "Khulna", "Chattogram"]);

// Tonal step per division (0 = lightest). Neighbouring divisions never share a tone.
const DIVISION_TONE: Record<Division, 0 | 1 | 2 | 3> = {
  Rangpur: 0,
  Rajshahi: 2,
  Mymensingh: 1,
  Sylhet: 2,
  Dhaka: 3,
  Khulna: 1,
  Barisal: 2,
  Chattogram: 1,
};
const TONE_CLASS = [styles.tone0, styles.tone1, styles.tone2, styles.tone3];
const HUB_DISTRICT = "Dhaka";

function districtHref({ name, division }: MapDistrict) {
  return `/donors?${new URLSearchParams({ division, district: name }).toString()}`;
}

// Curved "network" lines from Dhaka out to every other division.
const HUB = MAP_PINS.find((pin) => pin.division === "Dhaka")!;
const [, , MAP_W, MAP_H] = MAP_VIEWBOX.split(" ").map(Number);
const routes = MAP_PINS.filter((pin) => pin !== HUB).map(({ division, x, y }) => {
  const [x1, y1, x2, y2] = [HUB.x, HUB.y, x, y].map((v, i) => (v / 100) * (i % 2 ? MAP_H : MAP_W));
  const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
  const bend = 0.22;
  const cx = mx - (y2 - y1) * bend;
  const cy = my + (x2 - x1) * bend;
  return { division, d: `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}` };
});

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [division, setDivision] = useState<Division | "">("");
  const [district, setDistrict] = useState("");
  const [hovered, setHovered] = useState<MapDistrict | null>(null);
  const [focusDivision, setFocusDivision] = useState<Division | null>(null);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value, key) => {
      if (typeof value === "string" && value) params.set(key, value);
    });
    router.push(params.size ? `/donors?${params.toString()}` : "/donors");
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true">
        <span className={`${styles.aurora} ${styles.auroraOne}`} />
        <span className={`${styles.aurora} ${styles.auroraTwo}`} />
        <span className={`${styles.aurora} ${styles.auroraThree}`} />
        <span className={styles.grid} />
      </div>

      <div className={`container ${styles.container}`}>
        <div className={styles.main}>
          <div className={styles.copy}>
            <h1 id="hero-title" className={styles.title}>
              {t("hero.title")}{" "}
              <span className={styles.titleAccent}>{t("hero.titleAccent")}</span>
            </h1>
            <p className={styles.description}>{t("hero.description")}</p>
            <div className={styles.actions}>
              <Link href="/donors" className={styles.primaryAction}>
                <Search size={18} aria-hidden="true" />
                {t("hero.findDonor")}
                <span className={styles.actionArrow}><ArrowRight size={16} aria-hidden="true" /></span>
              </Link>
              <Link href="/register" className={styles.secondaryAction}>
                <Heart size={18} aria-hidden="true" />
                {t("hero.registerNow")}
              </Link>
            </div>
            <div className={styles.community}>
              <div className={styles.avatars} aria-hidden="true">
                {AVATAR_GROUPS.map((group) => <span key={group}>{group}</span>)}
              </div>
              <p>{t("hero.community")}<span>{t("hero.communityNote")}</span></p>
            </div>
          </div>

          <div className={styles.visual}>
            <nav className={styles.map} style={{ aspectRatio: MAP_ASPECT }} aria-label={t("hero.mapLabel")}>
              <span className={styles.mapGlow} style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }} aria-hidden="true" />
              {/* District shapes are a pointer shortcut; keyboard and screen-reader users get the
                  division pins below and the district picker in the search card. */}
              <svg className={styles.mapSvg} viewBox={MAP_VIEWBOX} fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="hero-map-sheen" x1="0" y1="0" x2="0.55" y2="1">
                    <stop offset="0" className={styles.sheenStop} stopOpacity="0.4" />
                    <stop offset="0.55" className={styles.sheenStop} stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="hero-map-spot" cx={HUB.x / 100} cy={HUB.y / 100} r="0.4">
                    <stop offset="0" className={styles.spotStop} stopOpacity="0.32" />
                    <stop offset="1" className={styles.spotStop} stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="hero-map-active" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fb7185" />
                    <stop offset="1" stopColor="#be123c" />
                  </linearGradient>
                </defs>

                <path d={MAP_OUTLINE} className={styles.mapBase} />
                <g className={`${styles.districts} ${focusDivision ? styles.districtsFocused : ""}`}>
                  {MAP_DISTRICTS.map((item) => (
                    <a
                      key={item.name}
                      href={districtHref(item)}
                      tabIndex={-1}
                      className={`${styles.district} ${item.name === HUB_DISTRICT ? styles.toneHub : TONE_CLASS[DIVISION_TONE[item.division]]} ${item.division === focusDivision ? styles.districtLit : ""}`}
                      onMouseEnter={() => setHovered(item)}
                      onMouseLeave={() => setHovered((current) => (current === item ? null : current))}
                      onClick={(event) => {
                        event.preventDefault();
                        router.push(districtHref(item));
                      }}
                    >
                      <path d={item.d} />
                    </a>
                  ))}
                </g>
                <path d={MAP_OUTLINE} fill="url(#hero-map-spot)" className={styles.mapOverlay} />
                <path d={MAP_OUTLINE} fill="url(#hero-map-sheen)" className={styles.mapOverlay} />
                <path d={MAP_DISTRICT_LINES} className={styles.districtLines} />
                <path d={MAP_DIVISION_LINES} className={styles.divisionLines} />
                <path d={MAP_OUTLINE} className={styles.mapEdge} />
                {routes.map(({ division: name, d }, index) => (
                  <path key={name} d={d} className={styles.route} style={{ animationDelay: `${index * -0.45}s` }} />
                ))}
                {hovered && <path key={hovered.name} d={hovered.d} className={styles.districtActive} />}
              </svg>

              {hovered && (
                <div
                  key={hovered.name}
                  className={`${styles.districtTip} ${hovered.y < 14 ? styles.districtTipBelow : ""}`}
                  style={{ left: `${Math.min(Math.max(hovered.x, 14), 86)}%`, top: `${hovered.y}%` }}
                  aria-hidden="true"
                >
                  <strong>{t(`location.district.${hovered.name}`)}</strong>
                  <span>{t(`location.division.${hovered.division}`)}</span>
                </div>
              )}

              {MAP_PINS.map(({ division: name, x, y }) => (
                <Link
                  key={name}
                  href={`/donors?${new URLSearchParams({ division: name }).toString()}`}
                  className={`${styles.pin} ${name === HUB.division ? styles.pinHub : ""} ${LABEL_LEFT.has(name) ? styles.pinLeft : ""}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={t("hero.divisionLink", { division: t(`location.division.${name}`) })}
                  onMouseEnter={() => setFocusDivision(name)}
                  onMouseLeave={() => setFocusDivision(null)}
                  onFocus={() => setFocusDivision(name)}
                  onBlur={() => setFocusDivision(null)}
                >
                  <span className={styles.pinDot} aria-hidden="true" />
                  <span className={styles.pinLabel}>{t(`location.division.${name}`)}</span>
                </Link>
              ))}

              {/* Stats sit in the empty corners around the country, outside the land. */}
              <dl className={`${styles.mapStat} ${styles.mapStatTop}`}>
                <dt>{t("home.stats.districts")}</dt>
                <dd><MapPin size={18} aria-hidden="true" />{t("home.stats.count.districts")}</dd>
              </dl>
              <dl className={`${styles.mapStat} ${styles.mapStatBottom}`}>
                <dt>{t("home.stats.service")}</dt>
                <dd><Clock size={18} aria-hidden="true" />{t("home.stats.count.service")}</dd>
              </dl>
            </nav>
          </div>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.searchHeading}>
            <div className={styles.searchTitle}>
              <span className={styles.searchIcon}><Search size={17} aria-hidden="true" /></span>
              <h2>{t("hero.searchTitle")}</h2>
            </div>
            <span className={styles.searchNote}>{t("hero.searchNote")}</span>
          </div>
          <form onSubmit={handleSearch} action="/donors" method="get" className={styles.searchForm}>
            <div className={styles.field}>
              <label htmlFor="hero-blood-group"><Droplet size={13} aria-hidden="true" />{t("findDonor.bloodGroup")}</label>
              <div className={styles.selectWrap}>
                <select id="hero-blood-group" name="bloodGroup" defaultValue="">
                  <option value="">{t("findDonor.allGroups")}</option>
                  {BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="hero-division"><MapPin size={13} aria-hidden="true" />{t("findDonor.division")}</label>
              <div className={styles.selectWrap}>
                <select id="hero-division" name="division" value={division} onChange={(event) => { setDivision(event.target.value as Division | ""); setDistrict(""); }}>
                  <option value="">{t("findDonor.allDivisions")}</option>
                  {DIVISIONS.map((item) => <option key={item} value={item}>{t(`location.division.${item}`)}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="hero-district"><MapPin size={13} aria-hidden="true" />{t("findDonor.district")}</label>
              <div className={styles.selectWrap}>
                <select id="hero-district" name="district" value={district} disabled={!division} onChange={(event) => setDistrict(event.target.value)}>
                  <option value="">{t("findDonor.allDistricts")}</option>
                  {division && DISTRICTS[division].map((item) => <option key={item} value={item}>{t(`location.district.${item}`)}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
            </div>
            <button type="submit" className={styles.searchButton}>
              <Search size={18} aria-hidden="true" />
              {t("hero.findDonor")}
            </button>
          </form>
        </div>

        <div className={styles.footnote}>
          <span><Heart size={14} aria-hidden="true" />{t("hero.footnote")}</span>
          <Link href="/emergency-request" className={styles.emergencyLink}>
            <Siren size={14} aria-hidden="true" />
            {t("hero.emergency")}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
