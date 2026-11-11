import { Heart, Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BrandName } from "@/components/BrandName";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative isolate mt-auto overflow-hidden border-t border-primary/10 bg-gradient-to-b from-muted/40 to-accent/60">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-40 -left-24 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-10 w-10" />
              <BrandName className="text-lg" />
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.slogan')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/donors"
                  className="inline-flex items-center gap-1 transition-all hover:translate-x-0.5 hover:text-primary"
                >
                  {t('footer.findDonors')}
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-1 transition-all hover:translate-x-0.5 hover:text-primary"
                >
                  {t('footer.bloodRequests')}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 transition-all hover:translate-x-0.5 hover:text-primary"
                >
                  {t('footer.registration')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </span>
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <span>info@bloodlink.com</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>{t('footer.address')}</span>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary">{t('footer.emergencyService')}</h3>
            <a
              href="tel:999"
              className="group block rounded-2xl p-[1px] blood-gradient blood-shadow transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 rounded-[15px] bg-card/95 p-4">
                <span className="icon-tile h-11 w-11">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('footer.emergencyCall')}
                  </p>
                  <p className="text-2xl font-bold text-gradient-blood">999</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="border-t border-primary/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 {t('header.appName')}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{t('footer.madeWith')}</span>
            <Heart className="h-4 w-4 animate-pulse-blood text-primary fill-primary" />
            <span>{t('footer.by')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
