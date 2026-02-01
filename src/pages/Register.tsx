import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Briefcase, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from '@/data/mockData';
import { BloodGroup, Division, Gender } from '@/types';

const registerSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(100),
  email: z.string().email('সঠিক ইমেইল দিন').max(255),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
  phone: z.string().regex(/^\+880[0-9]{10}$/, 'সঠিক ফোন নম্বর দিন (+880XXXXXXXXXX)'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'লিঙ্গ নির্বাচন করুন' }),
  address: z.string().min(5, 'সঠিক ঠিকানা দিন').max(200),
  division: z.string({ required_error: 'বিভাগ নির্বাচন করুন' }),
  district: z.string({ required_error: 'জেলা নির্বাচন করুন' }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { required_error: 'রক্তের গ্রুপ নির্বাচন করুন' }),
  age: z.number({ required_error: 'বয়স দিন' }).min(18, 'বয়স কমপক্ষে ১৮ হতে হবে').max(65, 'বয়স সর্বোচ্চ ৬৫ হতে পারবে'),
  occupation: z.string().min(2, 'পেশা দিন').max(100),
  lastDonationDate: z.string().optional(),
  hidePersonalInfo: z.boolean().default(false),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      hidePersonalInfo: false,
    }
  });

  const hidePersonalInfo = watch('hidePersonalInfo');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender as Gender,
        address: data.address,
        division: data.division as Division,
        district: data.district,
        bloodGroup: data.bloodGroup as BloodGroup,
        age: data.age,
        occupation: data.occupation,
        lastDonationDate: data.lastDonationDate,
        hidePersonalInfo: data.hidePersonalInfo,
      });
      toast({
        title: 'রেজিস্ট্রেশন সফল হয়েছে!',
        description: 'স্বাগতম Blood Link পরিবারে!',
      });
      navigate('/donors');
    } catch (error) {
      toast({
        title: 'রেজিস্ট্রেশন ব্যর্থ',
        description: 'অনুগ্রহ করে আবার চেষ্টা করুন',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <Droplet className="h-10 w-10 text-primary fill-primary transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold text-gradient-blood">Blood Link</span>
          </Link>
        </div>

        <Card className="card-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">রেজিস্ট্রেশন করুন</CardTitle>
            <CardDescription>
              রক্তদাতা হিসেবে যুক্ত হন এবং জীবন বাঁচাতে সাহায্য করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">নাম *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="আপনার পুরো নাম"
                      className="pl-10"
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">পাসওয়ার্ড *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">ফোন নম্বর *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+8801712345678"
                      className="pl-10"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>লিঙ্গ *</Label>
                  <Select onValueChange={(value) => setValue('gender', value as Gender)}>
                    <SelectTrigger>
                      <SelectValue placeholder="নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">পুরুষ</SelectItem>
                      <SelectItem value="female">মহিলা</SelectItem>
                      <SelectItem value="other">অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">বয়স *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="২৫"
                    min={18}
                    max={65}
                    {...register('age', { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p className="text-sm text-destructive">{errors.age.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>রক্তের গ্রুপ *</Label>
                  <Select onValueChange={(value) => setValue('bloodGroup', value as BloodGroup)}>
                    <SelectTrigger>
                      <SelectValue placeholder="নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bloodGroup && (
                    <p className="text-sm text-destructive">{errors.bloodGroup.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বিভাগ *</Label>
                  <Select onValueChange={(value) => {
                    setSelectedDivision(value as Division);
                    setValue('division', value);
                    setValue('district', '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIVISIONS.map((division) => (
                        <SelectItem key={division} value={division}>{division}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.division && (
                    <p className="text-sm text-destructive">{errors.division.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>জেলা *</Label>
                  <Select
                    onValueChange={(value) => setValue('district', value)}
                    disabled={!selectedDivision}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDivision && DISTRICTS[selectedDivision].map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && (
                    <p className="text-sm text-destructive">{errors.district.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">ঠিকানা *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="সম্পূর্ণ ঠিকানা"
                    className="pl-10"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">পেশা *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="occupation"
                      placeholder="আপনার পেশা"
                      className="pl-10"
                      {...register('occupation')}
                    />
                  </div>
                  {errors.occupation && (
                    <p className="text-sm text-destructive">{errors.occupation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastDonationDate">সর্বশেষ রক্তদানের তারিখ</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastDonationDate"
                      type="date"
                      className="pl-10"
                      {...register('lastDonationDate')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="hidePersonalInfo" className="text-sm font-medium">
                      ব্যক্তিগত তথ্য গোপন রাখুন
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      সক্রিয় করলে শুধু লিঙ্গ, রক্তের গ্রুপ ও এলাকা দেখাবে
                    </p>
                  </div>
                </div>
                <Switch
                  id="hidePersonalInfo"
                  checked={hidePersonalInfo}
                  onCheckedChange={(checked) => setValue('hidePersonalInfo', checked)}
                />
              </div>

              <Button
                type="submit"
                className="w-full blood-gradient text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                লগইন করুন
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
