"use client";

import TreatmentStaffManager from "@/components/treatment/TreatmentStaffManager";

export default function BottleMemberPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TreatmentStaffManager
        treatmentType="bottle_member"
        title="Bottle Member Treatments"
      />
    </div>
  );
}
