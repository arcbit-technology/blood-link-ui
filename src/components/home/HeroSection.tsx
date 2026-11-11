"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, Droplet, Heart, MapPin, Search, Users } from "lucide-react";
import { BLOOD_GROUPS, DISTRICTS, DIVISIONS } from "@/data/mockData";
import type { Division } from "@/types";
import styles from "./HeroSection.module.css";

const bloodNodes = [
  { group: "A+", x: 24, y: 19 },
  { group: "B+", x: 76, y: 19 },
  { group: "O+", x: 91, y: 47 },
  { group: "AB+", x: 76, y: 76 },
  { group: "A-", x: 50, y: 87 },
  { group: "B-", x: 24, y: 76 },
  { group: "O-", x: 9, y: 47 },
  { group: "AB-", x: 50, y: 8 },
];

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [division, setDivision] = useState<Division | "">("");
  const [district, setDistrict] = useState("");

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
      <div className={`container ${styles.container}`}>
        <div className={styles.main}>
          <div className={styles.copy}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowIcon}><Heart size={14} aria-hidden="true" /></span>
              {t("hero.eyebrow")}
            </div>
            <h1 id="hero-title" className={styles.title}>
              {t("hero.title")}<br />
              <span>{t("hero.titleAccent")}</span>
            </h1>
            <p className={styles.description}>{t("hero.description")}</p>
            <div className={styles.actions}>
              <Link href="/donors" className={styles.primaryAction}>
                <Search size={19} aria-hidden="true" />
                {t("hero.findDonor")}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/register" className={styles.secondaryAction}>
                <Heart size={19} aria-hidden="true" />
                {t("hero.registerNow")}
              </Link>
            </div>
            <div className={styles.community}>
              <span className={styles.communityIcon}><Users size={20} aria-hidden="true" /></span>
              <p>{t("hero.community")}<span>{t("hero.communityNote")}</span></p>
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.network}>
              <svg className={styles.connections} viewBox="0 0 500 500" fill="none" aria-hidden="true">
                <circle cx="250" cy="235" r="196" className={styles.outerRing} />
                <circle cx="250" cy="235" r="145" className={styles.innerRing} />
                {bloodNodes.map(({ group, x, y }) => (
                  <path key={group} d={`M250 235 L${x * 5} ${y * 5}`} className={styles.connection} />
                ))}
              </svg>
              <div className={styles.dropWrap} aria-hidden="true">
                <svg viewBox="0 0 200 250" className={styles.drop} fill="none">
                  <defs>
                    <linearGradient id="hero-drop-fill" x1="34" y1="48" x2="169" y2="234" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f15a62" />
                      <stop offset="0.48" stopColor="#d9213c" />
                      <stop offset="1" stopColor="#a90c2d" />
                    </linearGradient>
                    <linearGradient id="hero-drop-shine" x1="40" y1="67" x2="96" y2="171" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" stopOpacity="0.45" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M100 8C83 37 17 104 17 159a83 83 0 0 0 166 0C183 104 117 37 100 8Z" fill="url(#hero-drop-fill)" />
                  <path d="M88 49C62 85 35 121 35 155" stroke="url(#hero-drop-shine)" strokeWidth="9" strokeLinecap="round" />
                  <path d="M100 187s-39-23-39-47a22 22 0 0 1 39-14 22 22 0 0 1 39 14c0 24-39 47-39 47Z" fill="white" fillOpacity="0.96" />
                  <path d="M67 150h19l8-15 12 29 9-14h18" stroke="#d9213c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {bloodNodes.map(({ group, x, y }) => (
                <Link
                  key={group}
                  href={`/donors?${new URLSearchParams({ bloodGroup: group }).toString()}`}
                  className={styles.bloodNode}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={t("hero.groupLink", { group })}
                >
                  <Droplet size={12} aria-hidden="true" />{group}
                </Link>
              ))}
              <span className={`${styles.spark} ${styles.sparkOne}`} aria-hidden="true">+</span>
              <span className={`${styles.spark} ${styles.sparkTwo}`} aria-hidden="true">+</span>
            </div>
            <div className={styles.visualCaption}>
              <span className={styles.captionLine} />
              <span>{t("hero.visualCaption")}</span>
              <span className={styles.captionLine} />
            </div>
          </div>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.searchHeading}>
            <div className={styles.searchTitle}><span className={styles.searchIcon}><Search size={18} aria-hidden="true" /></span><h2>{t("hero.searchTitle")}</h2></div>
            <span className={styles.searchNote}>{t("hero.searchNote")}</span>
          </div>
          <form onSubmit={handleSearch} action="/donors" method="get" className={styles.searchForm}>
            <div className={styles.field}>
              <label htmlFor="hero-blood-group"><Droplet size={14} aria-hidden="true" />{t("findDonor.bloodGroup")}</label>
              <div className={styles.selectWrap}>
                <select id="hero-blood-group" name="bloodGroup" defaultValue="">
                  <option value="">{t("findDonor.allGroups")}</option>
                  {BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="hero-division"><MapPin size={14} aria-hidden="true" />{t("findDonor.division")}</label>
              <div className={styles.selectWrap}>
                <select id="hero-division" name="division" value={division} onChange={(event) => { setDivision(event.target.value as Division | ""); setDistrict(""); }}>
                  <option value="">{t("findDonor.allDivisions")}</option>
                  {DIVISIONS.map((item) => <option key={item} value={item}>{t(`location.division.${item}`)}</option>)}
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="hero-district"><MapPin size={14} aria-hidden="true" />{t("findDonor.district")}</label>
              <div className={styles.selectWrap}>
                <select id="hero-district" name="district" value={district} disabled={!division} onChange={(event) => setDistrict(event.target.value)}>
                  <option value="">{t("findDonor.allDistricts")}</option>
                  {division && DISTRICTS[division].map((item) => <option key={item} value={item}>{t(`location.district.${item}`)}</option>)}
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </div>
            </div>
            <button type="submit" className={styles.searchButton}><Search size={18} aria-hidden="true" />{t("hero.findDonor")}<ArrowRight size={17} aria-hidden="true" /></button>
          </form>
        </div>
        <div className={styles.footnote}>
          <span><Heart size={14} aria-hidden="true" />{t("hero.footnote")}</span>
          <Link href="/emergency-request">{t("hero.emergency")}<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
