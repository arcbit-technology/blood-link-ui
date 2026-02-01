import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BloodBadge } from '@/components/ui/blood-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, Calendar, Users, Heart, Clock } from 'lucide-react';
import { mockDonationPosts, BLOOD_GROUPS, DIVISIONS, DISTRICTS } from '@/data/mockData';
import { BloodGroup, Division, DonationPost } from '@/types';
import { Link } from 'react-router-dom';

export default function Posts() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<DonationPost[]>(mockDonationPosts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  const handleInterest = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'লগইন প্রয়োজন',
        description: 'আগ্রহ প্রকাশ করতে প্রথমে লগইন করুন',
        variant: 'destructive',
      });
      return;
    }

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isInterested = post.interestedUsers.includes(user!.id);
        return {
          ...post,
          interestedUsers: isInterested
            ? post.interestedUsers.filter(id => id !== user!.id)
            : [...post.interestedUsers, user!.id]
        };
      }
      return post;
    }));

    toast({
      title: 'আগ্রহ প্রকাশ করা হয়েছে',
      description: 'পোস্টকারীর সাথে যোগাযোগ করা হবে',
    });
  };

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const formData = new FormData(e.currentTarget);
    const newPost: DonationPost = {
      id: `post_${Date.now()}`,
      authorId: user!.id,
      authorName: user!.name,
      bloodGroup: formData.get('bloodGroup') as BloodGroup,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      hospitalName: formData.get('hospitalName') as string,
      address: formData.get('address') as string,
      district: formData.get('district') as string,
      division: formData.get('division') as Division,
      requiredDate: formData.get('requiredDate') as string,
      interestedUsers: [],
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPosts([newPost, ...posts]);
    setDialogOpen(false);
    toast({
      title: 'পোস্ট তৈরি হয়েছে',
      description: 'আপনার রক্তের অনুরোধ প্রকাশিত হয়েছে',
    });
  };

  const statusColors = {
    open: 'bg-green-100 text-green-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    closed: 'bg-muted text-muted-foreground',
  };

  const statusLabels = {
    open: 'চলমান',
    fulfilled: 'পূরণ হয়েছে',
    closed: 'বন্ধ',
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">রক্তের অনুরোধ</h1>
            <p className="text-muted-foreground">
              যাদের রক্ত প্রয়োজন তাদের সাহায্য করুন
            </p>
          </div>

          {isAuthenticated ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="blood-gradient text-primary-foreground gap-2">
                  <Plus className="h-5 w-5" />
                  নতুন পোস্ট তৈরি করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>রক্তের অনুরোধ পোস্ট করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">শিরোনাম *</Label>
                    <Input id="title" name="title" placeholder="যেমন: O+ রক্তের জরুরি প্রয়োজন" required />
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

                  <div className="space-y-2">
                    <Label htmlFor="description">বিবরণ *</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="কেন রক্ত প্রয়োজন তার বিবরণ দিন..."
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">হাসপাতালের নাম *</Label>
                    <Input id="hospitalName" name="hospitalName" placeholder="হাসপাতালের নাম" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <Input id="address" name="address" placeholder="হাসপাতালের ঠিকানা" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredDate">কবে প্রয়োজন *</Label>
                    <Input id="requiredDate" name="requiredDate" type="date" required />
                  </div>

                  <Button type="submit" className="w-full blood-gradient text-primary-foreground">
                    পোস্ট করুন
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button asChild className="blood-gradient text-primary-foreground">
              <Link to="/login">লগইন করে পোস্ট করুন</Link>
            </Button>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="overflow-hidden hover:blood-shadow transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={statusColors[post.status]}>
                        {statusLabels[post.status]}
                      </Badge>
                      <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                    </div>
                    <BloodBadge bloodGroup={post.bloodGroup} size="md" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{post.hospitalName}, {post.district}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>প্রয়োজন: {new Date(post.requiredDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{post.interestedUsers.length} জন আগ্রহী</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handleInterest(post.id)}
                      variant={user && post.interestedUsers.includes(user.id) ? 'secondary' : 'default'}
                      className={user && post.interestedUsers.includes(user.id) 
                        ? '' 
                        : 'blood-gradient text-primary-foreground'
                      }
                      disabled={post.status !== 'open'}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${user && post.interestedUsers.includes(user.id) ? 'fill-current' : ''}`} />
                      {user && post.interestedUsers.includes(user.id) ? 'আগ্রহী' : 'আগ্রহ প্রকাশ করুন'}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>পোস্ট করেছেন: {post.authorName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">কোনো পোস্ট নেই</h3>
            <p className="text-muted-foreground">প্রথম পোস্ট তৈরি করুন</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
