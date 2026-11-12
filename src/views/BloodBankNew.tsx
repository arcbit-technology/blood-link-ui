"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Building2, Clock, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EMPTY_LOCATION, LocationSelect, upazilasOf, type LocationValue } from "@/components/common/LocationSelect";
import { DISTRICTS } from "@/data/locations";
import type { Division, User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MY_BLOOD_BANK_KEY, useMyBloodBank } from "@/hooks/useMyBloodBank";
import { createBloodBank } from "@/api/bloodBanks";
import { apiErrorMessage } from "@/lib/apiErrors";

export default function BloodBankNew() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isAuthLoading } = useAuth();
  const my = useMyBloodBank();
  const [location, setLocation] = useState<LocationValue>(() => profileLocation(user));

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthLoading, isAuthenticated, router]);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createBloodBank>[0]) => createBloodBank(payload, token as string),
    onSuccess: (bank) => {
      void queryClient.invalidateQueries({ queryKey: MY_BLOOD_BANK_KEY });
      toast({ title: t("bloodBanks.new.success.title"), description: t("bloodBanks.new.success.description") });
      router.push(`/blood-banks/${bank.id}`);
    },
    onError: (e) => toast({ title: apiErrorMessage(e, t), variant: "destructive" }),
  });

  if (isAuthLoading || !isAuthenticated) return null;

  const blocking = my.data?.bank ?? my.data?.pendingRequest ?? null;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!location.division || !location.district || !location.upazila) {
      toast({ title: t("bloodBanks.new.locationRequired"), variant: "destructive" });
      return;
    }
    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    mutation.mutate({
      name: field("name"),
      description: field("description"),
      address: field("address"),
      contact_phone: field("contactPhone"),
      ...location,
    });
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <PageHeader icon={Building2} title={t("bloodBanks.new.title")} subtitle={t("bloodBanks.new.subtitle")} />

        {blocking ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>
              {my.data?.bank ? t("bloodBanks.new.alreadyMember.title") : t("bloodBanks.new.alreadyPending.title")}
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                {my.data?.bank
                  ? t("bloodBanks.new.alreadyMember.description", { name: blocking.name })
                  : t("bloodBanks.new.alreadyPending.description", { name: blocking.name })}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/blood-banks/${blocking.id}`}>{t("bloodBanks.new.open")}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("bloodBanks.new.formTitle")}</CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t("bloodBanks.new.howItWorks")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t("bloodBanks.fields.name")} <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    minLength={3}
                    maxLength={120}
                    placeholder={t("bloodBanks.placeholders.name")}
                  />
                </div>

                <LocationSelect value={location} onChange={setLocation} required idPrefix="bank-new" />

                <div className="space-y-2">
                  <Label htmlFor="description">{t("bloodBanks.fields.description")}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    maxLength={2000}
                    rows={4}
                    placeholder={t("bloodBanks.placeholders.description")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("bloodBanks.fields.address")}</Label>
                    <Input id="address" name="address" placeholder={t("bloodBanks.placeholders.address")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">{t("bloodBanks.fields.contactPhone")}</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      maxLength={50}
                      placeholder={user?.phone || "+8801…"}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full blood-gradient text-blood-foreground"
                >
                  {mutation.isPending ? t("common.sending") : t("bloodBanks.new.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

/** The user's saved location, as far as it is valid (a starting point for the form). */
function profileLocation(user: User | null): LocationValue {
  if (!user?.division || !DISTRICTS[user.division as Division]?.includes(user.district)) return EMPTY_LOCATION;
  const upazila = user.upazila && upazilasOf(user.district).includes(user.upazila) ? user.upazila : "";
  return { division: user.division, district: user.district, upazila };
}
