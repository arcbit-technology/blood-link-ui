import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BloodBadge } from '@/components/ui/blood-badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Heart,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { mockDonationRequests, mockDonationPosts } from '@/data/mockData';
import { Navigate } from 'react-router-dom';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [hideInfo, setHideInfo] = useState(user?.hidePersonalInfo ?? false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const incomingRequests = mockDonationRequests.filter(
    req => req.donorId === user.id && req.status === 'pending'
  );

  const myRequests = mockDonationRequests.filter(
    req => req.requesterId === user.id
  );

  const interestedPosts = mockDonationPosts.filter(
    post => post.interestedUsers.includes(user.id)
  );

  const handleAcceptRequest = (requestId: string) => {
    toast({
      title: 'অনুরোধ গ্রহণ করা হয়েছে',
      description: 'ধন্যবাদ! আপনার সাথে যোগাযোগ করা হবে।',
    });
  };

  const handleRejectRequest = (requestId: string) => {
    toast({
      title: 'অনুরোধ প্রত্যাখ্যান করা হয়েছে',
    });
  };

  const genderLabel = {
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য'
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  const statusLabels = {
    pending: 'অপেক্ষমান',
    accepted: 'গৃহীত',
    rejected: 'প্রত্যাখ্যাত',
    completed: 'সম্পন্ন',
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="blood-gradient h-24" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
                <BloodBadge 
                  bloodGroup={user.bloodGroup} 
                  size="xl" 
                  className="border-4 border-background shadow-lg"
                />
                <div className="text-center md:text-left flex-1 pb-4">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Badge className={user.role === 'admin' ? 'bg-primary' : 'bg-secondary text-secondary-foreground'}>
                  {user.role === 'admin' ? 'এডমিন' : 'রক্তদাতা'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">আমার তথ্য</TabsTrigger>
              <TabsTrigger value="requests">
                অনুরোধসমূহ
                {incomingRequests.length > 0 && (
                  <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                    {incomingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity">আমার কার্যক্রম</TabsTrigger>
            </TabsList>

            {/* Profile Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">লিঙ্গ ও বয়স</p>
                        <p className="font-medium">{genderLabel[user.gender]}, {user.age} বছর</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">ফোন</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">ইমেইল</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">পেশা</p>
                        <p className="font-medium">{user.occupation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg md:col-span-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">ঠিকানা</p>
                        <p className="font-medium">{user.address}, {user.district}, {user.division}</p>
                      </div>
                    </div>

                    {user.lastDonationDate && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg md:col-span-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">সর্বশেষ রক্তদান</p>
                          <p className="font-medium">{new Date(user.lastDonationDate).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>গোপনীয়তা সেটিংস</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-primary" />
                      <div>
                        <Label htmlFor="hideInfo" className="font-medium">
                          ব্যক্তিগত তথ্য গোপন রাখুন
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          সক্রিয় করলে শুধু লিঙ্গ, রক্তের গ্রুপ ও এলাকা দেখাবে
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="hideInfo"
                      checked={hideInfo}
                      onCheckedChange={(checked) => {
                        setHideInfo(checked);
                        toast({ title: 'সেটিংস আপডেট হয়েছে' });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              {/* Incoming Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    আমার কাছে আসা অনুরোধ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {incomingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {incomingRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{request.requesterName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {request.hospitalName}, {request.district}
                              </p>
                            </div>
                            <BloodBadge bloodGroup={request.bloodGroup} size="sm" />
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">রোগী:</span> {request.patientName} | 
                            <span className="font-medium"> কারণ:</span> {request.reason} |
                            <span className="font-medium"> প্রয়োজন:</span> {request.unitsNeeded} ব্যাগ
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleAcceptRequest(request.id)}
                              className="flex-1 blood-gradient text-primary-foreground"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              গ্রহণ করুন
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              প্রত্যাখ্যান
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>কোনো নতুন অনুরোধ নেই</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>আমার পাঠানো অনুরোধ</CardTitle>
                </CardHeader>
                <CardContent>
                  {myRequests.length > 0 ? (
                    <div className="space-y-4">
                      {myRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{request.patientName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {request.hospitalName}
                              </p>
                            </div>
                            <Badge className={statusColors[request.status]}>
                              {statusLabels[request.status]}
                            </Badge>
                          </div>
                          {request.donorName && (
                            <p className="text-sm">
                              <span className="font-medium">ডোনার:</span> {request.donorName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>আপনি কোনো অনুরোধ পাঠাননি</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>আগ্রহ প্রকাশ করা পোস্ট</CardTitle>
                </CardHeader>
                <CardContent>
                  {interestedPosts.length > 0 ? (
                    <div className="space-y-4">
                      {interestedPosts.map((post) => (
                        <div key={post.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{post.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {post.hospitalName}, {post.district}
                              </p>
                            </div>
                            <BloodBadge bloodGroup={post.bloodGroup} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground">{post.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>কোনো পোস্টে আগ্রহ প্রকাশ করেননি</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
