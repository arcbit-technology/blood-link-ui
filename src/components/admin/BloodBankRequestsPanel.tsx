"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Ban, Building2, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BankStatusBadge } from "@/components/bloodbank/BloodBankCard";
import { useLocationLabel } from "@/components/common/LocationSelect";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getBloodBanks, reviewBloodBank } from "@/api/bloodBanks";
import { apiErrorMessage } from "@/lib/apiErrors";
import type { BloodBank, BloodBankStatus } from "@/types";
import styles from "./admin.module.css";

type ReasonAction = { bank: BloodBank; action: "reject" | "suspend" };

export const PENDING_BANKS_KEY = ["bloodBanks", "admin", "pending"] as const;

/** Platform admin: review blood bank creation requests and moderate banks. */
export function BloodBankRequestsPanel() {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locationLabel = useLocationLabel();
  const [status, setStatus] = useState<BloodBankStatus>("pending");
  const [reasonFor, setReasonFor] = useState<ReasonAction | null>(null);
  const [reason, setReason] = useState("");

  const query = useQuery({
    queryKey: ["bloodBanks", "admin", status],
    enabled: !!token,
    queryFn: () => getBloodBanks({ status, size: 100 }, token),
  });

  const review = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: number;
      action: "approve" | "reject" | "suspend";
      reason?: string;
    }) => reviewBloodBank(id, action, token as string, reason),
    onSuccess: (_, v) => {
      toast({ title: t(`admin.bloodBanks.toasts.${v.action}`) });
      setReasonFor(null);
      setReason("");
      void queryClient.invalidateQueries({ queryKey: ["bloodBanks"] });
    },
    onError: (e) =>
      toast({ title: apiErrorMessage(e, t), variant: "destructive" }),
  });

  const banks = query.data?.data ?? [];

  return (
    <Card className="min-w-0 rounded-xl shadow-sm">
      <CardHeader className="flex flex-col flex-wrap justify-between gap-4 space-y-0 lg:flex-row lg:items-center">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-primary" />
          {t("admin.bloodBanks.title")}
        </CardTitle>
        <ToggleGroup
          className="grid w-full grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:w-auto sm:grid-cols-4"
          type="single"
          value={status}
          onValueChange={(v) => v && setStatus(v as BloodBankStatus)}
          aria-label={t("admin.bloodBanks.table.status")}
        >
          {(["pending", "approved", "suspended", "rejected"] as const).map(
            (s) => (
              <ToggleGroupItem
                key={s}
                value={s}
                size="sm"
                className="h-9 px-3 text-xs data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-sm"
              >
                {t(`bloodBanks.status.${s}`)}
              </ToggleGroupItem>
            ),
          )}
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {query.isError ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-center"
            role="alert"
          >
            <p className="text-sm text-muted-foreground">
              {apiErrorMessage(query.error, t)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("admin.workspace.retry")}
            </Button>
          </div>
        ) : banks.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            {query.isLoading
              ? t("common.sending")
              : t("admin.bloodBanks.empty")}
          </p>
        ) : (
          <div className={styles.records}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.bloodBanks.table.name")}</TableHead>
                  <TableHead>{t("admin.bloodBanks.table.location")}</TableHead>
                  <TableHead>
                    {t("admin.bloodBanks.table.requestedBy")}
                  </TableHead>
                  <TableHead>{t("admin.bloodBanks.table.date")}</TableHead>
                  <TableHead>{t("admin.bloodBanks.table.status")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.bloodBanks.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell data-label={t("admin.bloodBanks.table.name")}>
                      <Link
                        href={`/blood-banks/${b.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {b.name}
                      </Link>
                      {b.description && (
                        <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                          {b.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell
                      data-label={t("admin.bloodBanks.table.location")}
                      className="text-sm"
                    >
                      {locationLabel(b)}
                    </TableCell>
                    <TableCell
                      data-label={t("admin.bloodBanks.table.requestedBy")}
                      className="text-sm"
                    >
                      {b.createdByName}
                      {b.contactPhone && (
                        <p className="text-xs text-muted-foreground">
                          {b.contactPhone}
                        </p>
                      )}
                    </TableCell>
                    <TableCell
                      data-label={t("admin.bloodBanks.table.date")}
                      className="text-sm"
                    >
                      {new Date(b.createdAt).toLocaleDateString(i18n.language)}
                    </TableCell>
                    <TableCell data-label={t("admin.bloodBanks.table.status")}>
                      <BankStatusBadge status={b.status} />
                      {b.rejectionReason && (
                        <p className="mt-1 max-w-[12rem] text-xs text-muted-foreground">
                          {b.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell data-label={t("admin.bloodBanks.table.actions")}>
                      <div className="flex flex-wrap justify-end gap-2">
                        {(b.status === "pending" ||
                          b.status === "suspended") && (
                          <Button
                            size="sm"
                            className="blood-gradient text-blood-foreground"
                            disabled={review.isPending}
                            onClick={() =>
                              review.mutate({ id: b.id, action: "approve" })
                            }
                          >
                            {b.status === "pending" ? (
                              <Check className="mr-1 h-4 w-4" />
                            ) : (
                              <RotateCcw className="mr-1 h-4 w-4" />
                            )}
                            {b.status === "pending"
                              ? t("admin.bloodBanks.approve")
                              : t("admin.bloodBanks.reactivate")}
                          </Button>
                        )}
                        {b.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setReasonFor({ bank: b, action: "reject" })
                            }
                          >
                            <X className="mr-1 h-4 w-4" />
                            {t("admin.bloodBanks.reject")}
                          </Button>
                        )}
                        {b.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setReasonFor({ bank: b, action: "suspend" })
                            }
                          >
                            <Ban className="mr-1 h-4 w-4" />
                            {t("admin.bloodBanks.suspend")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!reasonFor}
        onOpenChange={(open) => !open && setReasonFor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reasonFor &&
                t(`admin.bloodBanks.${reasonFor.action}Title`, {
                  name: reasonFor.bank.name,
                })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.bloodBanks.reasonHint")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-reason">
              {t("admin.bloodBanks.reason")}
            </Label>
            <Textarea
              id="review-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonFor(null)}>
              {t("bloodBanks.manage.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || review.isPending}
              onClick={() =>
                reasonFor &&
                review.mutate({
                  id: reasonFor.bank.id,
                  action: reasonFor.action,
                  reason,
                })
              }
            >
              {reasonFor && t(`admin.bloodBanks.${reasonFor.action}`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
