import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DonorCard } from '@/components/donors/DonorCard';
import { DonorDialog } from '@/components/donors/DonorDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BloodBadge } from '@/components/ui/blood-badge';
import { Search, Filter, X } from 'lucide-react';
import { mockUsers, BLOOD_GROUPS, DIVISIONS, DISTRICTS } from '@/data/mockData';
import { User, BloodGroup, Division, Gender } from '@/types';
import { useSearchParams } from 'react-router-dom';

export default function Donors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDonor, setSelectedDonor] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | 'all'>(
    (searchParams.get('bloodGroup') as BloodGroup) || 'all'
  );
  const [divisionFilter, setDivisionFilter] = useState<Division | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const donors = useMemo(() => {
    return mockUsers.filter(user => {
      if (user.role === 'admin') return false;
      
      if (bloodGroupFilter !== 'all' && user.bloodGroup !== bloodGroupFilter) return false;
      if (divisionFilter !== 'all' && user.division !== divisionFilter) return false;
      if (districtFilter !== 'all' && user.district !== districtFilter) return false;
      if (genderFilter !== 'all' && user.gender !== genderFilter) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = !user.hidePersonalInfo && user.name.toLowerCase().includes(query);
        const matchesAddress = user.address.toLowerCase().includes(query);
        const matchesDistrict = user.district.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress && !matchesDistrict) return false;
      }
      
      return true;
    });
  }, [bloodGroupFilter, divisionFilter, districtFilter, genderFilter, searchQuery]);

  const handleDonorClick = (donor: User) => {
    setSelectedDonor(donor);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setBloodGroupFilter('all');
    setDivisionFilter('all');
    setDistrictFilter('all');
    setGenderFilter('all');
    setSearchQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = bloodGroupFilter !== 'all' || divisionFilter !== 'all' || 
    districtFilter !== 'all' || genderFilter !== 'all' || searchQuery !== '';

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ডোনার খুঁজুন</h1>
          <p className="text-muted-foreground">
            আপনার প্রয়োজন অনুযায়ী রক্তদাতা খুঁজুন
          </p>
        </div>

        {/* Blood Group Quick Filter */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">রক্তের গ্রুপ নির্বাচন করুন:</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setBloodGroupFilter('all');
                setSearchParams({});
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                bloodGroupFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              সব
            </button>
            {BLOOD_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => {
                  setBloodGroupFilter(group);
                  setSearchParams({ bloodGroup: group });
                }}
                className="transition-transform hover:scale-110"
              >
                <BloodBadge
                  bloodGroup={group}
                  size="sm"
                  className={bloodGroupFilter === group ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-70'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নাম, ঠিকানা বা জেলা দিয়ে খুঁজুন..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            ফিল্টার
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2 text-destructive">
              <X className="h-4 w-4" />
              রিসেট
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6 animate-fade-in">
            <div className="space-y-2">
              <Label>বিভাগ</Label>
              <Select
                value={divisionFilter}
                onValueChange={(value) => {
                  setDivisionFilter(value as Division | 'all');
                  setDistrictFilter('all');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="সব বিভাগ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বিভাগ</SelectItem>
                  {DIVISIONS.map((division) => (
                    <SelectItem key={division} value={division}>{division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>জেলা</Label>
              <Select
                value={districtFilter}
                onValueChange={setDistrictFilter}
                disabled={divisionFilter === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="সব জেলা" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব জেলা</SelectItem>
                  {divisionFilter !== 'all' && DISTRICTS[divisionFilter].map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>লিঙ্গ</Label>
              <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as Gender | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="সব" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  <SelectItem value="male">পুরুষ</SelectItem>
                  <SelectItem value="female">মহিলা</SelectItem>
                  <SelectItem value="other">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          মোট <span className="font-medium text-foreground">{donors.length}</span> জন ডোনার পাওয়া গেছে
        </p>

        {/* Donor Cards Grid */}
        {donors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {donors.map((donor, index) => (
              <div key={donor.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <DonorCard donor={donor} onClick={() => handleDonorClick(donor)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">কোনো ডোনার পাওয়া যায়নি</h3>
            <p className="text-muted-foreground">অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        )}

        {/* Donor Dialog */}
        <DonorDialog
          donor={selectedDonor}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </Layout>
  );
}
