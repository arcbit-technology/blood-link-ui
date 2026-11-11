"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Heart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { BrandName } from "@/components/BrandName";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from "@/data/mockData";
import { BloodGroup, Division, Gender } from "@/types";

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register: registerUser, registerIsLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(
    null,
  );

  const registerSchema = z
    .object({
      firstName: z.string().min(2, t("validation.name.minLength")).max(100),
      lastName: z.string().min(2, t("validation.name.minLength")).max(100),
      email: z.string().email(t("validation.email.invalid")).max(255),
      password: z.string().min(6, t("validation.password.minLength")),
      confirmPassword: z.string().min(6, t("validation.password.minLength")),
      phone: z
        .string()
        .regex(/^\+880[0-9]{10}$/, t("validation.phone.invalid")),
      gender: z.enum(["male", "female", "other"], {
        required_error: t("validation.gender.required"),
      }),
      address: z.string().min(5, t("validation.address.minLength")).max(200),
      division: z.string({ required_error: t("validation.division.required") }),
      district: z.string({ required_error: t("validation.district.required") }),
      bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
        required_error: t("validation.bloodGroup.required"),
      }),
      age: z
        .number({ required_error: t("validation.age.required") })
        .min(18, t("validation.age.min"))
        .max(65, t("validation.age.max")),
      occupation: z
        .string()
        .min(2, t("validation.occupation.required"))
        .max(100),
      lastDonationDate: z.string().optional(),
      hidePersonalInfo: z.boolean().default(false),
    })
    .refine((val) => val.password === val.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      hidePersonalInfo: false,
    },
  });

  const hidePersonalInfo = watch("hidePersonalInfo");

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
      gender: data.gender as Gender,
      phone: data.phone,
      address: data.address,
      division: data.division as Division,
      district: data.district,
      age: data.age,
      blood_group: data.bloodGroup as BloodGroup,
      profession: data.occupation,
      donated_at: data.lastDonationDate,
      hide_personal_info: data.hidePersonalInfo,
      is_available: true,
      city: "",
      country: "Bangladesh",
    });

    if (result.ok === true) {
      toast({
        title: "Registration successful",
        description: "A verification link send to your email, check that.",
      });
      router.push("/login");
      return;
    }

    toast({
      title: t("auth.register.error.title"),
      description: result.message || t("auth.register.error.description"),
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="h-16 w-16 transition-transform group-hover:scale-110" />
            <BrandName className="text-2xl" />
          </Link>
        </div>

        <Card className="card-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t("auth.register.title")}
            </CardTitle>
            <CardDescription>{t("auth.register.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      className="pl-10"
                      {...register("firstName")}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      className="pl-10"
                      {...register("lastName")}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.register.emailLabel")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.register.emailPlaceholder")}
                      className="pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("auth.register.phoneLabel")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder={t("auth.register.phonePlaceholder")}
                      className="pl-10"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("auth.register.passwordLabel")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.register.passwordPlaceholder")}
                      className="pl-10 pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("auth.register.genderLabel")}</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("gender", value as Gender)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">
                        {t("common.gender.male")}
                      </SelectItem>
                      <SelectItem value="female">
                        {t("common.gender.female")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("common.gender.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t("auth.register.ageLabel")}</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder={t("auth.register.agePlaceholder")}
                    min={18}
                    max={65}
                    {...register("age", { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p className="text-sm text-destructive">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("auth.register.bloodGroupLabel")}</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("bloodGroup", value as BloodGroup)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bloodGroup && (
                    <p className="text-sm text-destructive">
                      {errors.bloodGroup.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("auth.register.divisionLabel")}</Label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedDivision(value as Division);
                      setValue("division", value);
                      setValue("district", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("auth.register.selectDivision")}
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
                  {errors.division && (
                    <p className="text-sm text-destructive">
                      {errors.division.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("auth.register.districtLabel")}</Label>
                  <Select
                    onValueChange={(value) => setValue("district", value)}
                    disabled={!selectedDivision}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("auth.register.selectDistrict")}
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
                  {errors.district && (
                    <p className="text-sm text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  {t("auth.register.addressLabel")}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder={t("auth.register.addressPlaceholder")}
                    className="pl-10"
                    {...register("address")}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">
                    {t("auth.register.occupationLabel")}
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="occupation"
                      placeholder={t("auth.register.occupationPlaceholder")}
                      className="pl-10"
                      {...register("occupation")}
                    />
                  </div>
                  {errors.occupation && (
                    <p className="text-sm text-destructive">
                      {errors.occupation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastDonationDate">
                    {t("auth.register.lastDonationDateLabel")}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastDonationDate"
                      type="date"
                      className="pl-10"
                      {...register("lastDonationDate")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <div>
                    <Label
                      htmlFor="hidePersonalInfo"
                      className="text-sm font-medium"
                    >
                      {t("auth.register.hideInfoLabel")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("auth.register.hideInfoDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="hidePersonalInfo"
                  checked={hidePersonalInfo}
                  onCheckedChange={(checked) =>
                    setValue("hidePersonalInfo", checked)
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full blood-gradient text-primary-foreground"
                disabled={registerIsLoading}
              >
                {registerIsLoading
                  ? t("auth.register.button.loading")
                  : t("auth.register.button.default")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {t("auth.register.alreadyAccount")}
              </span>
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                {t("auth.register.loginLink")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
