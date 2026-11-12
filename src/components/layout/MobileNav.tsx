"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  Building2,
  ChevronRight,
  Droplets,
  Home,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  LogOut,
  MessagesSquare,
  Moon,
  Phone,
  Siren,
  Trophy,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";

type IconType = ComponentType<{ className?: string }>;

const isActivePath = (pathname: string | null, href: string) =>
  href === "/" ? pathname === "/" : !!pathname && (pathname === href || pathname.startsWith(`${href}/`));

function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function TabItem({
  icon: Icon,
  label,
  active,
  badge = 0,
  ...rest
}: {
  icon: IconType;
  label: string;
  active: boolean;
  badge?: number;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })) {
  const content = (
    <>
      <span
        className={cn(
          "relative flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300",
          active ? "bg-primary/15 text-primary" : "text-muted-foreground group-active:scale-90",
        )}
      >
        <Icon className={cn("h-[22px] w-[22px] transition-transform duration-300", active && "scale-110")} />
        <CountBadge count={badge} className="absolute -top-1 right-2" />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[11px] leading-tight transition-colors",
          active ? "font-semibold text-primary" : "font-medium text-muted-foreground",
        )}
      >
        {label}
      </span>
    </>
  );

  const className =
    "group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 outline-none focus-visible:[&>span:first-child]:ring-2 focus-visible:[&>span:first-child]:ring-ring";

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={rest.onClick} aria-haspopup="dialog" aria-expanded={active}>
      {content}
    </button>
  );
}

function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="overflow-hidden rounded-2xl border bg-card">{children}</div>
    </section>
  );
}

function SheetRow({
  icon: Icon,
  label,
  href,
  onClick,
  trailing,
  active,
  destructive,
}: {
  icon: IconType;
  label: string;
  href?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  active?: boolean;
  destructive?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className={cn("flex-1 text-left text-[15px] font-medium", destructive && "text-destructive", active && "text-primary")}>
        {label}
      </span>
      {trailing ?? (href && <ChevronRight className="h-4 w-4 text-muted-foreground/70" />)}
    </>
  );
  const className =
    "flex w-full items-center gap-3 px-4 py-3 transition-colors active:bg-muted/70 hover:bg-muted/40 [&:not(:last-child)]:border-b";

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick} aria-current={active ? "page" : undefined}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}

/**
 * App-style bottom tab bar for screens below `lg`. The right-most "More" tab
 * opens a bottom sheet with secondary pages, account actions and preferences.
 */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadTotal } = useConversations();
  const [moreOpen, setMoreOpen] = useState(false);
  const isPlatformAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  // Close the sheet whenever navigation happens.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const leftTabs = [
    { href: "/donors", icon: Users, label: t("mobileNav.donors") },
    { href: "/posts", icon: Droplets, label: t("mobileNav.requests") },
  ];
  const homeActive = !moreOpen && isActivePath(pathname, "/");

  const morePaths = ["/leaderboard", "/messages", "/profile", "/admin", "/emergency-request", "/login", "/register"];
  const moreActive = moreOpen || morePaths.some((p) => isActivePath(pathname, p));
  const close = () => setMoreOpen(false);
  const isEnglish = i18n.language?.startsWith("en");

  return (
    <>
      <nav
        aria-label={t("mobileNav.primary")}
        className="fixed inset-x-0 bottom-0 z-40 drop-shadow-[0_-6px_18px_hsl(var(--primary)/0.14)] lg:hidden"
      >
        <div className="relative mx-auto h-16 max-w-lg">
          {/* Bar surface: two flat sides plus a centre piece with a curved notch
              that wraps around the raised Home button. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-0 right-[calc(50%+55px)] border-t border-primary/15 bg-background" />
            <div className="absolute inset-y-0 left-[calc(50%+55px)] right-0 border-t border-primary/15 bg-background" />
            <svg
              viewBox="0 0 112 64"
              className="absolute inset-y-0 left-1/2 h-16 w-28 -translate-x-1/2 overflow-visible"
            >
              <path
                d="M0 0 H8 C22 0 22 34 56 34 C90 34 90 0 104 0 H112 V64 H0 Z"
                className="fill-background"
              />
              <path
                d="M0 0.5 H8 C22 0.5 22 34.5 56 34.5 C90 34.5 90 0.5 104 0.5 H112"
                fill="none"
                strokeWidth="1"
                className="stroke-primary/15"
              />
            </svg>
          </div>

          <div className="relative grid h-full grid-cols-[1fr_1fr_112px_1fr_1fr] px-1">
            {leftTabs.map((tab) => (
              <TabItem key={tab.href} {...tab} active={!moreOpen && isActivePath(pathname, tab.href)} />
            ))}

            <Link
              href="/"
              aria-current={homeActive ? "page" : undefined}
              aria-label={t("mobileNav.home")}
              className="group relative flex flex-col items-center justify-end pb-1.5 outline-none"
            >
              <span
                className={cn(
                  "absolute -top-[30px] left-1/2 flex h-[60px] w-[60px] -translate-x-1/2 items-center justify-center rounded-full text-white blood-gradient transition-all duration-300 group-active:scale-90 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
                  homeActive
                    ? "blood-glow ring-4 ring-primary/15"
                    : "shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.55)]",
                )}
              >
                <Home className={cn("h-7 w-7 transition-transform duration-300", homeActive && "scale-110")} />
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight transition-colors",
                  homeActive ? "font-semibold text-primary" : "font-medium text-muted-foreground",
                )}
              >
                {t("mobileNav.home")}
              </span>
            </Link>

            <TabItem
              href="/blood-banks"
              icon={Building2}
              label={t("mobileNav.banks")}
              active={!moreOpen && isActivePath(pathname, "/blood-banks")}
            />
            <TabItem
              icon={LayoutGrid}
              label={t("mobileNav.more")}
              active={moreActive}
              onClick={() => setMoreOpen(true)}
            />
          </div>
        </div>
        {/* Fill the iOS home-indicator area beneath the bar. */}
        <div className="h-[env(safe-area-inset-bottom)] bg-background" />
      </nav>

      <DrawerPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] lg:hidden" />
          <DrawerPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-primary/10 bg-background outline-none lg:hidden"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25" />
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <DrawerPrimitive.Title className="text-lg font-bold">{t("mobileNav.moreTitle")}</DrawerPrimitive.Title>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
              {/* Account card */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-transparent p-4 transition-colors active:bg-primary/15"
                >
                  <span className="icon-tile h-12 w-12 rounded-full text-lg font-bold">
                    {user?.name?.trim()?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{user?.name}</span>
                    <span className="block text-sm text-muted-foreground">{t("header.profile")}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                </Link>
              ) : (
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-transparent p-4">
                  <p className="mb-3 text-sm text-muted-foreground">{t("mobileNav.signInPrompt")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => router.push("/login")}>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("header.login")}
                    </Button>
                    <Button className="rounded-xl" onClick={() => router.push("/register")}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("header.register")}
                    </Button>
                  </div>
                </div>
              )}

              <SheetSection title={t("mobileNav.explore")}>
                <SheetRow
                  icon={Trophy}
                  label={t("header.leaderboard")}
                  href="/leaderboard"
                  onClick={close}
                  active={isActivePath(pathname, "/leaderboard")}
                />
                {isAuthenticated && (
                  <SheetRow
                    icon={MessagesSquare}
                    label={t("header.messages")}
                    href="/messages"
                    onClick={close}
                    active={isActivePath(pathname, "/messages")}
                    trailing={
                      unreadTotal > 0 ? (
                        <CountBadge count={unreadTotal} className="h-5 min-w-5 px-1.5 text-[11px] ring-0" />
                      ) : undefined
                    }
                  />
                )}
                {isAuthenticated && (
                  <SheetRow
                    icon={Siren}
                    label={t("mobileNav.emergencyRequest")}
                    href="/emergency-request"
                    onClick={close}
                    active={isActivePath(pathname, "/emergency-request")}
                  />
                )}
                {isPlatformAdmin && (
                  <SheetRow
                    icon={LayoutDashboard}
                    label={t("header.adminDashboard")}
                    href="/admin"
                    onClick={close}
                    active={isActivePath(pathname, "/admin")}
                  />
                )}
              </SheetSection>

              <SheetSection title={t("mobileNav.preferences")}>
                <div className="flex items-center gap-3 px-4 py-3 [&:not(:last-child)]:border-b">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Languages className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 text-[15px] font-medium">{t("mobileNav.language")}</span>
                  <div className="flex rounded-full bg-muted p-0.5 text-sm font-medium" role="radiogroup">
                    {(["bn", "en"] as const).map((lng) => {
                      const selected = lng === "en" ? isEnglish : !isEnglish;
                      return (
                        <button
                          key={lng}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => i18n.changeLanguage(lng)}
                          className={cn(
                            "rounded-full px-3 py-1 transition-all",
                            selected ? "bg-background text-primary shadow-sm" : "text-muted-foreground",
                          )}
                        >
                          {t(`header.language.${lng}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Moon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 text-[15px] font-medium">{t("mobileNav.theme")}</span>
                  <Switch
                    checked={resolvedTheme === "dark"}
                    onCheckedChange={(on) => setTheme(on ? "dark" : "light")}
                    aria-label={t("header.theme.toggle")}
                  />
                </label>
              </SheetSection>

              <a
                href="tel:999"
                className="flex items-center gap-4 rounded-2xl p-[1px] blood-gradient blood-shadow"
              >
                <span className="flex w-full items-center gap-4 rounded-[15px] bg-card/95 p-4">
                  <span className="icon-tile h-11 w-11">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm text-muted-foreground">{t("mobileNav.emergencyCall")}</span>
                    <span className="block text-2xl font-bold text-gradient-blood">999</span>
                  </span>
                </span>
              </a>

              {isAuthenticated && (
                <SheetSection title={t("mobileNav.account")}>
                  <SheetRow
                    icon={LogOut}
                    label={t("header.logout")}
                    destructive
                    onClick={() => {
                      close();
                      logout();
                      router.push("/");
                    }}
                  />
                </SheetSection>
              )}
            </div>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    </>
  );
}
