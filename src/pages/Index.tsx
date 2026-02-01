import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Layout } from "@/components/layout/Layout";
import {
  Droplet,
  Users,
  Heart,
  Clock,
  ArrowRight,
  Search,
  AlertCircle,
  Shield,
} from "lucide-react";
import { BLOOD_GROUPS } from "@/data/mockData";

import { FindDonorSection } from "@/components/home/FindDonorSection";
import { BloodRequestSection } from "@/components/home/BloodRequestSection";
import { RecentDonorsSection } from "@/components/home/RecentDonorsSection";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden blood-gradient py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Droplet className="h-4 w-4" />
              <span className="text-sm font-medium">রক্তদানে জীবন বাঁচান</span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Blood Link
            </h1>
            <p
              className="text-lg md:text-xl opacity-90 mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              আপনার রক্তের গ্রুপ অনুযায়ী ডোনার খুঁজুন অথবা রক্তদাতা হিসেবে
              রেজিস্ট্রেশন করুন।
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2"
              >
                <Link to="/donors">
                  <Search className="h-5 w-5" />
                  ডোনার খুঁজুন
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2"
              >
                <Link to="/register">
                  রেজিস্ট্রেশন করুন
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating blood drops */}
        <div className="absolute top-20 left-10 animate-float opacity-30">
          <Droplet className="h-16 w-16 text-primary-foreground fill-primary-foreground" />
        </div>
        <div
          className="absolute bottom-20 right-20 animate-float opacity-20"
          style={{ animationDelay: "1s" }}
        >
          <Droplet className="h-24 w-24 text-primary-foreground fill-primary-foreground" />
        </div>
      </section>

      {/* Blood Groups */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            সকল রক্তের গ্রুপের ডোনার আছে
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {BLOOD_GROUPS.map((group, index) => (
              <Link
                key={group}
                to={`/donors?bloodGroup=${group}`}
                className="animate-scale-in transition-transform hover:scale-110"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <BloodBadge bloodGroup={group} size="lg" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Find Donor Section */}
      <FindDonorSection />

      {/* Blood Request Section */}
      <BloodRequestSection />

      {/* Recent Donors Section */}
      <RecentDonorsSection />

      {/* Emergency CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full mb-6">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                জরুরি রক্তের প্রয়োজন?
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              এডমিনকে জানান
            </h2>
            <p className="text-muted-foreground mb-8">
              জরুরি পরিস্থিতিতে সরাসরি এডমিনের কাছে অনুরোধ পাঠান। আমরা দ্রুত
              সাড়া দেব।
            </p>
            <Button
              asChild
              size="lg"
              className="blood-gradient text-primary-foreground gap-2"
            >
              <Link to="/emergency-request">
                <Heart className="h-5 w-5" />
                জরুরি অনুরোধ পাঠান
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              কেন Blood Link?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              আমরা রক্তদাতা এবং রক্তগ্রহীতাদের মধ্যে সেতুবন্ধন তৈরি করি
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in">
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">বিশাল নেটওয়ার্ক</h3>
              <p className="text-muted-foreground text-sm">
                হাজারো রক্তদাতা এক প্ল্যাটফর্মে
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">সহজ অনুসন্ধান</h3>
              <p className="text-muted-foreground text-sm">
                এলাকা ও রক্তের গ্রুপ অনুযায়ী খুঁজুন
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">দ্রুত সাড়া</h3>
              <p className="text-muted-foreground text-sm">
                জরুরি অবস্থায় দ্রুত যোগাযোগ
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">গোপনীয়তা</h3>
              <p className="text-muted-foreground text-sm">
                আপনার তথ্য সম্পূর্ণ নিরাপদ
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                ১০০০+
              </p>
              <p className="text-muted-foreground">রক্তদাতা</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                ৬৪
              </p>
              <p className="text-muted-foreground">জেলায় সেবা</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                ৫০০+
              </p>
              <p className="text-muted-foreground">সফল রক্তদান</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                ২৪/৭
              </p>
              <p className="text-muted-foreground">সার্ভিস</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
