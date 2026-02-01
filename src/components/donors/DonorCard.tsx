import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { BloodBadge } from '@/components/ui/blood-badge';
import { MapPin, User as UserIcon, Briefcase, Calendar, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DonorCardProps {
  donor: User;
  onClick: () => void;
}

export function DonorCard({ donor, onClick }: DonorCardProps) {
  const genderLabel = {
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য'
  };

  const canDonate = () => {
    if (!donor.lastDonationDate) return true;
    const lastDonation = new Date(donor.lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDonation < threeMonthsAgo;
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:blood-shadow hover:-translate-y-1",
        "bg-card border-border overflow-hidden group"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Header with blood group */}
        <div className="relative p-4 pb-8 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="absolute -bottom-6 right-4">
            <BloodBadge
              bloodGroup={donor.bloodGroup}
              size="lg"
              className="shadow-lg group-hover:animate-pulse-blood"
            />
          </div>
          
          {donor.hidePersonalInfo ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm">তথ্য গোপন</span>
            </div>
          ) : (
            <h3 className="font-semibold text-lg truncate pr-16">{donor.name}</h3>
          )}
        </div>

        {/* Body */}
        <div className="p-4 pt-8 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4 text-primary" />
            <span>{genderLabel[donor.gender]}</span>
            {!donor.hidePersonalInfo && (
              <>
                <span className="text-border">•</span>
                <span>{donor.age} বছর</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">
              {donor.hidePersonalInfo ? donor.district : `${donor.address}, ${donor.district}`}
            </span>
          </div>

          {!donor.hidePersonalInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="truncate">{donor.occupation}</span>
            </div>
          )}

          {donor.lastDonationDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className={cn(
                canDonate() ? 'text-green-600' : 'text-amber-600'
              )}>
                {canDonate() ? 'রক্তদানে সক্ষম' : 'সম্প্রতি রক্তদান করেছেন'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-muted/50 border-t text-center">
          <span className="text-sm text-primary font-medium">
            বিস্তারিত দেখুন →
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
