import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Phone, MapPin, Heart, ArrowLeft } from 'lucide-react';
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from '@/data/mockData';
import { BloodGroup, Division } from '@/types';
import { Link } from 'react-router-dom';

export default function EmergencyRequest() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'জরুরি অনুরোধ পাঠানো হয়েছে',
      description: 'এডমিন দ্রুত আপনার সাথে যোগাযোগ করবেন',
    });

    setIsSubmitting(false);
    navigate('/');
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
            হোমে ফিরে যান
          </Link>

          <Card className="overflow-hidden">
            <div className="blood-gradient p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">জরুরি রক্তের অনুরোধ</h1>
                  <p className="opacity-90">সরাসরি এডমিনের কাছে অনুরোধ পাঠান</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    যোগাযোগের তথ্য
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">আপনার নাম *</Label>
                      <Input 
                        id="contactName" 
                        name="contactName" 
                        defaultValue={user?.name || ''} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">ফোন নম্বর *</Label>
                      <Input 
                        id="contactPhone" 
                        name="contactPhone" 
                        placeholder="+8801712345678"
                        defaultValue={user?.phone || ''} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    রোগীর তথ্য
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">রোগীর নাম *</Label>
                      <Input id="patientName" name="patientName" required />
                    </div>
                    <div className="space-y-2">
                      <Label>রক্তের গ্রুপ *</Label>
                      <Select name="bloodGroup" required>
                        <SelectTrigger>
                          <SelectValue placeholder="নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitsNeeded">কত ব্যাগ প্রয়োজন *</Label>
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
                      <Label htmlFor="requiredDate">কবে প্রয়োজন *</Label>
                      <Input id="requiredDate" name="requiredDate" type="date" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">কেন রক্ত প্রয়োজন *</Label>
                    <Textarea 
                      id="reason" 
                      name="reason" 
                      placeholder="অপারেশন, দুর্ঘটনা, রক্তশূন্যতা ইত্যাদি..."
                      required 
                    />
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    হাসপাতালের তথ্য
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">হাসপাতালের নাম *</Label>
                    <Input id="hospitalName" name="hospitalName" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>বিভাগ *</Label>
                      <Select 
                        name="division" 
                        onValueChange={(value) => setSelectedDivision(value as Division)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIVISIONS.map((division) => (
                            <SelectItem key={division} value={division}>{division}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>জেলা *</Label>
                      <Select name="district" required disabled={!selectedDivision}>
                        <SelectTrigger>
                          <SelectValue placeholder="নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDivision && DISTRICTS[selectedDivision].map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">সম্পূর্ণ ঠিকানা</Label>
                    <Input id="address" name="address" placeholder="হাসপাতালের সম্পূর্ণ ঠিকানা" />
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    জরুরি অনুরোধ শুধুমাত্র সত্যিকারের জরুরি পরিস্থিতিতে ব্যবহার করুন। অপব্যবহার করলে আপনার অ্যাকাউন্ট বন্ধ করা হতে পারে।
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full blood-gradient text-primary-foreground"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'পাঠানো হচ্ছে...' : 'জরুরি অনুরোধ পাঠান'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
