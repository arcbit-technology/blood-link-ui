"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  Globe,
  HeartHandshake,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/images/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./admin.module.css";

export type AdminSection =
  "overview" | "users" | "bloodBanks" | "requests" | "posts" | "history";

const sections = [
  { id: "overview", icon: LayoutDashboard },
  { id: "users", icon: Users },
  { id: "bloodBanks", icon: Building2 },
  { id: "requests", icon: HeartHandshake },
  { id: "posts", icon: MessageSquareText },
  { id: "history", icon: History },
] as const;

interface AdminShellProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  counts: Partial<Record<AdminSection, number>>;
  children: ReactNode;
}

function AdminNavigation({
  section,
  onSectionChange,
  counts,
}: Omit<AdminShellProps, "children">) {
  const { t, i18n } = useTranslation();
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className={`${styles.workspace} border-sidebar-border`}
    >
      <SidebarHeader className="gap-5 px-3 pb-5 pt-4 group-data-[collapsible=icon]:px-0">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label={t("header.appName")}
            className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:mx-auto"
          >
            <Logo className="h-9 w-9" />
            <BrandName className="text-xl group-data-[collapsible=icon]:hidden" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            aria-label={t("admin.workspace.closeMenu")}
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-card p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {t("admin.workspace.workspace")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("admin.workspace.administration")}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 text-[11px] uppercase tracking-widest">
            {t("admin.workspace.management")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label={t("admin.workspace.management")}>
              <SidebarMenu className="gap-1.5">
                {sections.map(({ id, icon: Icon }) => {
                  const label = t(
                    id === "overview"
                      ? "admin.workspace.overview"
                      : `admin.tabs.${id}`,
                  );
                  return (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        tooltip={label}
                        isActive={section === id}
                        aria-current={section === id ? "page" : undefined}
                        onClick={() => {
                          onSectionChange(id);
                          setOpenMobile(false);
                        }}
                        className="h-11 rounded-lg px-3 text-muted-foreground data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary group-data-[collapsible=icon]:!size-9"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                      {!!counts[id] && (
                        <SidebarMenuBadge className="right-3 top-3 rounded-md bg-primary/10 px-1.5 text-[10px] text-primary">
                          {counts[id]?.toLocaleString(i18n.language)}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mx-4 mt-auto rounded-xl border border-primary/15 bg-primary/5 p-4 group-data-[collapsible=icon]:hidden">
          <HeartHandshake className="mb-3 h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">
            {t("admin.workspace.missionTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("admin.workspace.missionDescription")}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary"
          >
            {t("admin.workspace.visitSite")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SidebarContent>
      <SidebarFooter className="mt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <SidebarSeparator className="mx-0 mb-2 w-full" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.name}
                  className="gap-3 rounded-xl group-data-[collapsible=icon]:!size-9"
                >
                  <UserAvatar name={user?.name} src={user?.photo} size={32} />
                  <span className="grid flex-1 text-left">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {t("admin.workspace.administrator")}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-60">
                <DropdownMenuLabel className="truncate">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Users className="mr-2 h-4 w-4" />
                    {t("header.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    {t("admin.workspace.visitSite")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AdminShell({ children, ...props }: AdminShellProps) {
  const { t, i18n } = useTranslation();
  const title = t(
    props.section === "overview"
      ? "admin.workspace.overview"
      : `admin.tabs.${props.section}`,
  );

  return (
    <SidebarProvider
      className={styles.workspace}
      style={
        {
          "--sidebar-width": "16.5rem",
          "--sidebar-width-icon": "3.5rem",
        } as CSSProperties
      }
    >
      <a
        href="#admin-content"
        className="sr-only z-50 rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("admin.workspace.skipContent")}
      </a>
      <AdminNavigation {...props} />
      <SidebarInset className="min-w-0 border-border/70 md:border">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur-md md:rounded-t-xl md:px-6">
          <SidebarTrigger
            className="h-10 w-10 shrink-0 rounded-lg text-muted-foreground"
            aria-label={t("admin.workspace.toggleMenu")}
          />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {t("admin.workspace.administration")}
            </span>
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />
            <span className="truncate font-medium">{title}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-1.5 px-2 text-muted-foreground"
                aria-label={t("mobileNav.language")}
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs uppercase">
                  {i18n.language.startsWith("bn") ? "BN" : "EN"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void i18n.changeLanguage("en")}>
                {t("header.language.en")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void i18n.changeLanguage("bn")}>
                {t("header.language.bn")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
          >
            <Link href="/">
              {t("admin.workspace.visitSite")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </header>
        <div
          id="admin-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] space-y-6 p-4 outline-none sm:p-6 lg:space-y-8 lg:p-8"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
