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
  onPay: () => void;
  loading: boolean;
}

export function EnrollmentModal({
  open,
  onOpenChange,
  courseTitle,
  onPay,
  loading,
}: EnrollmentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white text-slate-900 border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Enroll in {courseTitle}</DialogTitle>
          <DialogDescription className="text-slate-500">
            Review the training terms and conditions before proceeding to payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="text-sm font-semibold text-slate-700">Terms of Enrollment</div>
          <ScrollArea className="h-64 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            <div className="space-y-4">
              <p>
                <strong className="text-slate-900 font-bold block mb-1">1. Enrollment.</strong> 
                By enrolling you agree to complete the training modules, pass the assigned tasks, and uphold Matrix Root's code of conduct.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">2. Training Fee.</strong> 
                A one-time training fee of ₹500 is applicable and is non-refundable once content access is granted. All payments are processed securely through Razorpay.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">3. Certification.</strong> 
                A verifiable industrial internship certificate is issued only after successful submission and approval of all assignments by our mentors.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">4. Plagiarism.</strong> 
                Any form of plagiarism in assignments will result in immediate disqualification from the program without refund.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">5. Mentorship.</strong> 
                Mentor reviews and feedback are provided within 5 working days of task submission through the portal.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">6. Intellectual Property.</strong> 
                All course content and materials remain the property of Matrix Root. Unauthorized redistribution is prohibited.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">7. Privacy.</strong> 
                Your personal data is protected as per our privacy policy and is used solely for certification and academic records.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">8. Verification.</strong> 
                Issued certificates include a unique ID that can be verified via the Matrix Root official verification portal.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">9. MSME Compliance.</strong> 
                Matrix Root is a registered industrial training provider under MSME, Government of India.
              </p>
              <p>
                <strong className="text-slate-900 font-bold block mb-1">10. Access Period.</strong> 
                Enrolled students get lifetime access to the course materials for the specific track they have enrolled in.
              </p>
            </div>
          </ScrollArea>
        </div>

        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Checkbox 
            id="terms" 
            checked={agreed} 
            onCheckedChange={(checked) => setAgreed(!!checked)} 
            className="mt-1 border-blue-300 data-[state=checked]:bg-blue-600"
          />
          <label 
            htmlFor="terms" 
            className="text-sm text-blue-900 font-medium cursor-pointer leading-tight"
          >
            I have read and agree to the Terms of Enrollment and understand the ₹500 fee is for training infrastructure.
          </label>
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            disabled={!agreed || loading} 
            onClick={onPay}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> 
                Pay & Start Internship
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
