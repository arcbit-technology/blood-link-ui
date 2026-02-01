import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export function FindDonorSection() {
  const navigate = useNavigate();
  const [division, setDivision] = useState<Division | "all">("all");
  const [district, setDistrict] = useState<string>("all");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "all">("all");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (division !== "all") params.append("division", division);
    if (district !== "all") params.append("district", district);
    if (bloodGroup !== "all") params.append("bloodGroup", bloodGroup);

    navigate(`/donors?${params.toString()}`);
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
                <span className="text-sm font-medium">সহজ অনুসন্ধান</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ডোনার খুঁজুন
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                আপনার এলাকার রক্তদাতাদের খুঁজে পেতে নিচের তথ্যগুলো পূরণ করুন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end max-w-5xl mx-auto bg-background/50 p-6 rounded-xl border shadow-sm">
              <div className="space-y-2">
                <Label>বিভাগ</Label>
                <Select
                  value={division}
                  onValueChange={(val) => {
                    setDivision(val as Division | "all");
                    setDistrict("all");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল বিভাগ</SelectItem>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>জেলা</Label>
                <Select
                  value={district}
                  onValueChange={setDistrict}
                  disabled={division === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল জেলা</SelectItem>
                    {division !== "all" &&
                      DISTRICTS[division]?.map((dist) => (
                        <SelectItem key={dist} value={dist}>
                          {dist}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>রক্তের গ্রুপ</Label>
                <Select
                  value={bloodGroup}
                  onValueChange={(val) =>
                    setBloodGroup(val as BloodGroup | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="রক্তের গ্রুপ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল গ্রুপ</SelectItem>
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
                খুঁজুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
