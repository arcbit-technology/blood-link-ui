import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { BrandName } from "@/components/BrandName";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navClass = (href: string) =>
    cn(
      "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
      pathname?.startsWith(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
    );

  const mobileNavClass = (href: string) =>
    cn(
      "rounded-xl px-4 py-2.5 font-medium transition-colors",
      pathname?.startsWith(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
    );

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      {/* Gradient hairline in the hero's accent colour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="transition-transform group-hover:scale-110" />
          <BrandName className="text-xl" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/donors" className={navClass("/donors")}>
            {t("header.findDonors")}
          </Link>
          <Link href="/posts" className={navClass("/posts")}>
            {t("header.bloodRequests")}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full flex items-center gap-2 px-3"
              >
                <Globe className="h-5 w-5" />
                <span>{i18n.language === "en" ? "🇺🇸" : "🇧🇩"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")}>
                <span className="mr-2">🇺🇸</span> {t("header.language.en")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("bn")}>
                <span className="mr-2">🇧🇩</span> {t("header.language.bn")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  {t("header.profile")}
                </DropdownMenuItem>
                {user?.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t("header.adminDashboard")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-primary/10 pl-4">
              <Button variant="ghost" onClick={() => router.push("/login")}>
                {t("header.login")}
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="rounded-full px-5"
              >
                {t("header.register")}
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full flex items-center gap-2 px-3"
              >
                <Globe className="h-5 w-5" />
                <span>{i18n.language?.startsWith("en") ? "🇺🇸" : "🇧🇩"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")}>
                <span className="mr-2">🇺🇸</span> {t("header.language.en")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("bn")}>
                <span className="mr-2">🇧🇩</span> {t("header.language.bn")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="rounded-full p-2 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary/10 bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            <Link
              href="/donors"
              className={mobileNavClass("/donors")}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.findDonors")}
            </Link>
            <Link
              href="/posts"
              className={mobileNavClass("/posts")}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.bloodRequests")}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={mobileNavClass("/profile")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("header.profile")}
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={mobileNavClass("/admin")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("header.adminDashboard")}
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("header.logout")}
                </Button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2 px-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("header.login")}
                </Button>
                <Button
                  onClick={() => {
                    router.push("/register");
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("header.register")}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
