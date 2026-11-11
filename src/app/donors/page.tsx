import { Suspense } from "react";
import Donors from "@/views/Donors";

export default function DonorsPage() {
  return (
    <Suspense>
      <Donors />
    </Suspense>
  );
}
