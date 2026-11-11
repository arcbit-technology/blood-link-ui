import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="transition-transform group-hover:scale-110" />
          <BrandName className="text-xl" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/donors"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            {t("header.findDonors")}
          </Link>
          <Link
            href="/posts"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
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
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push("/login")}>
                {t("header.login")}
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="blood-gradient text-blood-foreground"
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
            className="p-2"
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
        <div className="md:hidden border-t bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-3">
            <Link
              href="/donors"
              className="px-4 py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.findDonors")}
            </Link>
            <Link
              href="/posts"
              className="px-4 py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.bloodRequests")}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("header.profile")}
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
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
              <div className="flex flex-col gap-2 px-4">
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
                  className="blood-gradient text-blood-foreground"
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
