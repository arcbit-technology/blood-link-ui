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
  Globe,
  MessagesSquare,
} from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { UserAvatar } from "@/components/images/UserAvatar";
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
  const { t, i18n } = useTranslation();
  const { unreadTotal } = useConversations();
  const isPlatformAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

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
      <div className="container flex h-14 items-center justify-between lg:h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="transition-transform group-hover:scale-110" />
          <BrandName className="text-lg lg:text-xl" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link href="/donors" className={navClass("/donors")}>
            {t("header.findDonors")}
          </Link>
          <Link href="/posts" className={navClass("/posts")}>
            {t("header.bloodRequests")}
          </Link>
          <Link href="/blood-banks" className={navClass("/blood-banks")}>
            {t("header.bloodBanks")}
          </Link>
          <Link href="/leaderboard" className={navClass("/leaderboard")}>
            {t("header.leaderboard")}
          </Link>

          {isAuthenticated && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Link
                href="/messages"
                aria-label={
                  unreadTotal > 0
                    ? t("header.messagesUnread", { count: unreadTotal })
                    : t("header.messages")
                }
              >
                <MessagesSquare className="h-5 w-5" />
                {unreadTotal > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                )}
              </Link>
            </Button>
          )}

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

          <ThemeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full pl-1.5">
                  <UserAvatar src={user?.photo} name={user?.name} size={28} />
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  {t("header.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/messages")}>
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  {t("header.messages")}
                </DropdownMenuItem>
                {isPlatformAdmin && (
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

        {/* Mobile header actions — main navigation lives in the bottom tab bar */}
        <div className="flex items-center gap-1 lg:hidden">
          {isAuthenticated ? (
            <Button asChild variant="ghost" size="icon" className="relative rounded-full">
              <Link
                href="/messages"
                aria-label={
                  unreadTotal > 0
                    ? t("header.messagesUnread", { count: unreadTotal })
                    : t("header.messages")
                }
              >
                <MessagesSquare className="h-5 w-5" />
                {unreadTotal > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                )}
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-full px-4"
              onClick={() => router.push("/login")}
            >
              {t("header.login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
