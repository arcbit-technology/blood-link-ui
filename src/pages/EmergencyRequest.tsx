import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Phone, MapPin, Heart, ArrowLeft } from "lucide-react";
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from "@/data/mockData";
import { BloodGroup, Division } from "@/types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function EmergencyRequest() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: t("emergency.success.title"),
      description: t("emergency.success.description"),
    });

    setIsSubmitting(false);
    navigate("/");
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("emergency.backHome")}
          </Link>

          <Card className="overflow-hidden">
            <div className="blood-gradient p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{t("emergency.title")}</h1>
                  <p className="opacity-90">{t("emergency.subtitle")}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    {t("emergency.contactInfo")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">
                        {t("emergency.form.yourName")}
                      </Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        defaultValue={user?.name || ""}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">
                        {t("emergency.form.phone")}
                      </Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        placeholder="+8801712345678"
                        defaultValue={user?.phone || ""}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    {t("emergency.patientInfo")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">
                        {t("emergency.form.patientName")}
                      </Label>
                      <Input id="patientName" name="patientName" required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("emergency.form.bloodGroup")}</Label>
                      <Select name="bloodGroup" required>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("emergency.form.select")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitsNeeded">
                        {t("emergency.form.bagsNeeded")}
                      </Label>
                      <Input
                        id="unitsNeeded"
                        name="unitsNeeded"
                        type="number"
                        min="1"
                        max="10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requiredDate">
                        {t("emergency.form.whenNeeded")}
                      </Label>
                      <Input
                        id="requiredDate"
                        name="requiredDate"
                        type="date"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      {t("emergency.form.whyNeeded")}
                    </Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder={t("emergency.form.reasonPlaceholder")}
                      required
                    />
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {t("emergency.hospitalInfo")}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">
                      {t("emergency.form.hospitalName")}
                    </Label>
                    <Input id="hospitalName" name="hospitalName" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("emergency.form.division")}</Label>
                      <Select
                        name="division"
                        onValueChange={(value) =>
                          setSelectedDivision(value as Division)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("emergency.form.select")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {DIVISIONS.map((division) => (
                            <SelectItem key={division} value={division}>
                              {t(`location.division.${division}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("emergency.form.district")}</Label>
                      <Select
                        name="district"
                        required
                        disabled={!selectedDivision}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("emergency.form.select")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDivision &&
                            DISTRICTS[selectedDivision].map((district) => (
                              <SelectItem key={district} value={district}>
                                {t(`location.district.${district}`)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t("emergency.form.fullAddress")}
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder={t(
                        "emergency.form.hospitalAddressPlaceholder",
                      )}
                    />
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {t("emergency.warning")}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full blood-gradient text-primary-foreground"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t("common.sending")}
                    </>
                  ) : (
                    t("emergency.form.submit")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
