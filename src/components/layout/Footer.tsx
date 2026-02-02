import { Droplet, Heart, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-primary fill-primary" />
              <span className="text-lg font-bold text-gradient-blood">
                {t('header.appName')}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.slogan')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/donors"
                  className="hover:text-primary transition-colors"
                >
                  {t('footer.findDonors')}
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  className="hover:text-primary transition-colors"
                >
                  {t('footer.bloodRequests')}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-primary transition-colors"
                >
                  {t('footer.registration')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@bloodlink.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{t('footer.address')}</span>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.emergencyService')}</h3>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {t('footer.emergencyCall')}
              </p>
              <p className="text-xl font-bold text-primary">999</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 {t('header.appName')}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{t('footer.madeWith')}</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>{t('footer.by')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
