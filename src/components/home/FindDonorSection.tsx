import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from "@/data/mockData";
import { Division, BloodGroup } from "@/types";
import { useTranslation } from "react-i18next";

export function FindDonorSection() {
  const router = useRouter();
  const [division, setDivision] = useState<Division | "all">("all");
  const [district, setDistrict] = useState<string>("all");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "all">("all");
  const { t } = useTranslation();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (division !== "all") params.append("division", division);
    if (district !== "all") params.append("district", district);
    if (bloodGroup !== "all") params.append("bloodGroup", bloodGroup);

    router.push(`/donors?${params.toString()}`);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="bg-card rounded-2xl shadow-lg border p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4">
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("findDonor.badge")}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("findDonor.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("findDonor.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end max-w-5xl mx-auto bg-background/50 pb-6 rounded-xl  shadow-sm">
              <div className="space-y-2">
                <Label>{t("findDonor.division")}</Label>
                <Select
                  value={division}
                  onValueChange={(val) => {
                    setDivision(val as Division | "all");
                    setDistrict("all");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("findDonor.selectDivision")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("findDonor.allDivisions")}
                    </SelectItem>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>
                        {t(`location.division.${div}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("findDonor.district")}</Label>
                <Select
                  value={district}
                  onValueChange={setDistrict}
                  disabled={division === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("findDonor.selectDistrict")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("findDonor.allDistricts")}
                    </SelectItem>
                    {division !== "all" &&
                      DISTRICTS[division]?.map((dist) => (
                        <SelectItem key={dist} value={dist}>
                          {t(`location.district.${dist}`)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("findDonor.bloodGroup")}</Label>
                <Select
                  value={bloodGroup}
                  onValueChange={(val) =>
                    setBloodGroup(val as BloodGroup | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("findDonor.selectBloodGroup")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("findDonor.allGroups")}
                    </SelectItem>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="w-full text-lg font-medium"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" />
                {t("findDonor.search")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
