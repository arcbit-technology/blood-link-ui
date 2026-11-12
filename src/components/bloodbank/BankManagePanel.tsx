"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, Crown, Save, UserMinus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BloodBadge } from "@/components/ui/blood-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankRoleBadge } from "@/components/bloodbank/BloodBankCard";
import { memberName } from "@/components/bloodbank/BankMembersList";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getBankMembers,
  removeMember,
  reviewMember,
  setMemberRole,
  transferBankAdmin,
  updateBloodBank,
} from "@/api/bloodBanks";
import { apiErrorMessage } from "@/lib/apiErrors";
import type { BankMember, BankRole, BloodBank, BloodGroup } from "@/types";

interface BankManagePanelProps {
  bank: BloodBank;
  members: BankMember[];
  /** The viewer's role in this bank ("" for a platform admin who is not a member). */
  viewerRole: BankRole | "";
  isPlatformAdmin: boolean;
}

/** Join requests, roles & positions, removing members, admin transfer and bank details. */
export function BankManagePanel({ bank, members, viewerRole, isPlatformAdmin }: BankManagePanelProps) {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = viewerRole === "admin" || isPlatformAdmin;
  const myId = Number(user?.id);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["bankMembers", bank.id] });
    void queryClient.invalidateQueries({ queryKey: ["bloodBank", bank.id] });
    void queryClient.invalidateQueries({ queryKey: ["myBloodBank"] });
  };
  const onError = (e: unknown) => toast({ title: apiErrorMessage(e, t), variant: "destructive" });

  const pending = useQuery({
    queryKey: ["bankMembers", bank.id, "pending"],
    queryFn: () => getBankMembers(bank.id, "pending", token),
  });

  const review = useMutation({
    mutationFn: ({ userId, action }: { userId: number; action: "approve" | "reject" }) =>
      reviewMember(bank.id, userId, action, token as string),
    onSuccess: (_, v) => {
      toast({ title: v.action === "approve" ? t("bloodBanks.manage.approved") : t("bloodBanks.manage.rejected") });
      refresh();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (userId: number) => removeMember(bank.id, userId, token as string),
    onSuccess: () => {
      toast({ title: t("bloodBanks.manage.removed") });
      refresh();
    },
    onError,
  });

  const transfer = useMutation({
    mutationFn: (userId: number) => transferBankAdmin(bank.id, userId, token as string),
    onSuccess: () => {
      toast({ title: t("bloodBanks.manage.transferred") });
      refresh();
    },
    onError,
  });

  const edit = useMutation({
    mutationFn: (payload: Parameters<typeof updateBloodBank>[1]) => updateBloodBank(bank.id, payload, token as string),
    onSuccess: () => {
      toast({ title: t("bloodBanks.manage.saved") });
      refresh();
    },
    onError,
  });

  const [transferTo, setTransferTo] = useState("");
  const candidates = members.filter((m) => m.role !== "admin");
  const canRemove = (m: BankMember) =>
    m.role !== "admin" && m.userId !== myId && (isAdmin || m.role === "member");

  const submitEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const field = (k: string) => String(f.get(k) ?? "").trim();
    edit.mutate({
      name: field("name"),
      description: field("description"),
      address: field("address"),
      contact_phone: field("contactPhone"),
      logo: bank.logo,
    });
  };

  return (
    <div className="space-y-6">
      {/* Join requests */}
      <Card>
        <CardHeader>
          <CardTitle>{t("bloodBanks.manage.requests.title")}</CardTitle>
          <CardDescription>{t("bloodBanks.manage.requests.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {(pending.data ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t("bloodBanks.manage.requests.empty")}</p>
          ) : (
            <ul className="divide-y">
              {(pending.data ?? []).map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                  {m.bloodGroup && <BloodBadge bloodGroup={m.bloodGroup as BloodGroup} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{memberName(m, t("leaderboard.anonymous"))}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.upazila, m.phone].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="blood-gradient text-blood-foreground"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ userId: m.userId, action: "approve" })}
                      aria-label={t("bloodBanks.manage.approve")}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      {t("bloodBanks.manage.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ userId: m.userId, action: "reject" })}
                      aria-label={t("bloodBanks.manage.reject")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Roles & positions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("bloodBanks.manage.roles.title")}</CardTitle>
          <CardDescription>
            {isAdmin ? t("bloodBanks.manage.roles.description") : t("bloodBanks.manage.roles.officerDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {members.map((m) => (
              <MemberRoleRow
                // remount when the saved role/position changes so the inputs reset
                key={`${m.id}-${m.role}-${m.position}`}
                member={m}
                editable={isAdmin}
                removable={canRemove(m)}
                onSave={(role, position) =>
                  setMemberRole(bank.id, m.userId, { role, position }, token as string)
                    .then(() => {
                      toast({ title: t("bloodBanks.manage.saved") });
                      refresh();
                    })
                    .catch((e) => {
                      onError(e);
                    })
                }
                onRemove={() => remove.mutate(m.userId)}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          {/* Transfer admin */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                {t("bloodBanks.manage.transfer.title")}
              </CardTitle>
              <CardDescription>{t("bloodBanks.manage.transfer.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger className="sm:max-w-xs" aria-label={t("bloodBanks.manage.transfer.select")}>
                  <SelectValue placeholder={t("bloodBanks.manage.transfer.select")} />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((m) => (
                    <SelectItem key={m.userId} value={String(m.userId)}>
                      {memberName(m, t("leaderboard.anonymous"))}
                      {m.position ? ` — ${m.position}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={!transferTo || transfer.isPending}>
                    {t("bloodBanks.manage.transfer.button")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("bloodBanks.manage.transfer.confirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("bloodBanks.manage.transfer.confirmBody", {
                        name: memberName(
                          candidates.find((m) => String(m.userId) === transferTo) ?? { firstName: "", lastName: "" },
                          t("leaderboard.anonymous"),
                        ),
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("bloodBanks.manage.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => transfer.mutate(Number(transferTo))}>
                      {t("bloodBanks.manage.transfer.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Bank details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bloodBanks.manage.details.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitEdit} className="space-y-4" key={bank.id}>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">{t("bloodBanks.fields.name")}</Label>
                  <Input id="edit-name" name="name" defaultValue={bank.name} required minLength={3} maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">{t("bloodBanks.fields.description")}</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={bank.description}
                    rows={4}
                    maxLength={2000}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">{t("bloodBanks.fields.address")}</Label>
                    <Input id="edit-address" name="address" defaultValue={bank.address} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">{t("bloodBanks.fields.contactPhone")}</Label>
                    <Input id="edit-phone" name="contactPhone" type="tel" defaultValue={bank.contactPhone} />
                  </div>
                </div>
                <Button type="submit" disabled={edit.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("bloodBanks.manage.save")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function MemberRoleRow({
  member,
  editable,
  removable,
  onSave,
  onRemove,
}: {
  member: BankMember;
  editable: boolean;
  removable: boolean;
  onSave: (role: BankRole, position: string) => Promise<void>;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [role, setRole] = useState<BankRole>(member.role);
  const [position, setPosition] = useState(member.position);
  const [saving, setSaving] = useState(false);
  const dirty = role !== member.role || position !== member.position;
  const isAdminRow = member.role === "admin";

  return (
    <li className="flex flex-col gap-3 py-3 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{memberName(member, t("leaderboard.anonymous"))}</p>
        <BankRoleBadge role={member.role} position={member.position} />
      </div>
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          {!isAdminRow && (
            <Select value={role} onValueChange={(v) => setRole(v as BankRole)}>
              <SelectTrigger className="w-32" aria-label={t("bloodBanks.manage.roles.role")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="officer">{t("bloodBanks.roles.officer")}</SelectItem>
                <SelectItem value="member">{t("bloodBanks.roles.member")}</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder={t("bloodBanks.manage.roles.positionPlaceholder")}
            aria-label={t("bloodBanks.manage.roles.position")}
            maxLength={60}
            className="w-48"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={!dirty || saving}
            onClick={async () => {
              setSaving(true);
              await onSave(isAdminRow ? "admin" : role, position.trim());
              setSaving(false);
            }}
          >
            {t("bloodBanks.manage.save")}
          </Button>
        </div>
      )}
      {removable && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-destructive" aria-label={t("bloodBanks.manage.remove")}>
              <UserMinus className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("bloodBanks.manage.removeConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("bloodBanks.manage.removeConfirmBody", { name: memberName(member, t("leaderboard.anonymous")) })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("bloodBanks.manage.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>{t("bloodBanks.manage.remove")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  );
}
