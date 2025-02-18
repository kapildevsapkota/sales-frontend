"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Enquiry } from "@/types/enquiries";
import RentalCard from "@/components/cards/RentalCard";

interface ViewEnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiry: Enquiry;
}

export function ViewEnquiryDialog({
  open,
  onOpenChange,
  enquiry,
}: ViewEnquiryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enquiry Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Contact Information</h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {enquiry.first_name} {enquiry.last_name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {enquiry.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {enquiry.phone_number}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Enquiry Information</h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {enquiry.inquiry_type}
                </p>
                <p>
                  <span className="font-medium">Submitted:</span>{" "}
                  {format(new Date(enquiry.submitted_at), "PPp")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Message</h3>
            <p className="mt-2 whitespace-pre-wrap">{enquiry.message}</p>
          </div>

          {enquiry.property && (
            <div>
              <h3 className="font-semibold mb-4">Property Details</h3>
              <RentalCard rental={enquiry.property} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
