"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Loader2 } from "lucide-react";

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  price?: number;
  onPay: () => void;
  loading: boolean;
}

export function EnrollmentModal({
  open,
  onOpenChange,
  courseTitle,
  price,
  onPay,
  loading,
}: EnrollmentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white text-black border-black/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black font-sans">Enroll in {courseTitle}</DialogTitle>
          <DialogDescription className="text-black/60 font-sans">
            Review the terms and manual payment verification process before enrolling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 font-sans">
          <div className="text-sm font-semibold text-black/80">Terms of Enrollment</div>
          <ScrollArea className="h-72 border border-black/10 bg-[#FAF6F0] p-4 text-xs leading-relaxed text-black/70 rounded-[8px]">
            <div className="space-y-4">
              <p>
                → By enrolling you agree to complete the training modules, pass the assigned tasks, and uphold Matrix Root's code of conduct.
              </p>
              <p>
                → A one-time training fee of ₹{price ?? 500} is applicable and is non-refundable once content access is granted. All payments are securely processed and verified manually via our Google Form.
              </p>
              <p>
                → A verifiable industrial internship certificate is issued only after successful submission and approval of all assignments by our mentors.
              </p>
              <p>
                → Any form of plagiarism in assignments will result in immediate disqualification from the program without refund.
              </p>
              <p>
                → Mentor reviews and feedback are provided within 5 working days of task submission through the portal.
              </p>
              <p>
                → All course content and materials remain the property of Matrix Root. Unauthorized redistribution is prohibited.
              </p>
              <p>
                → Your personal data is protected as per our privacy policy and is used solely for certification and academic records.
              </p>
              <p>
                → Issued certificates include a unique ID that can be verified via the Matrix Root official verification portal.
              </p>
              <p>
                → Matrix Root is a registered industrial training provider under MSME, Government of India.
              </p>
              <p>
                → Enrolled students get lifetime access to the course materials for the specific track they have enrolled in.
              </p>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 font-sans">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-black/15 text-black hover:bg-black/5"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onPay}
            className="flex-1 bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] border border-[#FDBF84]/25 font-extrabold gap-2 shadow-none cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-neutral-900" />
                Requesting Enrollment...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-neutral-900" />
                Proceed to Payment Form
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
