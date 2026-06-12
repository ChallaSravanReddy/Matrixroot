"use client";

import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import { domToPng } from "modern-screenshot";
import { FileText } from "lucide-react";
import { useNotification } from "@/components/NotificationProvider";

interface OfferLetterProps {
  studentName: string;
  email: string;
  courseName: string;
  enrolledAt: string;
  enrollId: string;
}

const OfferLetterPDF: React.FC<OfferLetterProps> = ({ studentName, email, courseName, enrolledAt, enrollId }) => {
  const offerLetterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { showNotification } = useNotification();

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const downloadOfferLetter = async () => {
    const element = offerLetterRef.current;
    if (!element) return;

    setDownloading(true);
    showNotification("Generating Offer Letter PDF...", "info");

    try {
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Matrix-Root-Offer-Letter-${studentName.replace(/\s+/g, "-")}.pdf`);
      showNotification("Offer Letter downloaded successfully!", "success");
    } catch (error) {
      console.error("Offer Letter Generation Error:", error);
      showNotification("Failed to generate PDF. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full">
      {/* HIDDEN PORTRAIT OFFER LETTER TEMPLATE (A4 aspect ratio: 794px x 1123px) */}
      <div className="fixed left-[-9999px]">
        <div 
          ref={offerLetterRef}
          style={{ 
            backgroundColor: '#ffffff', 
            width: '794px',
            height: '1123px',
          }}
          className="p-16 relative font-sans text-black flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Decorative Borders */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#8B5A2B]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#8B5A2B]"></div>

          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <img 
              src="/img/Matrixroot_onlyimglogo-removebg-preview.png" 
              alt="Watermark" 
              className="w-[420px] h-[420px] object-contain"
            />
          </div>

          <div className="relative z-10">
            {/* Header: Company Logo & Details */}
            <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-6">
              <div className="flex items-center gap-3">
                <img 
                  src="/img/Matrixroot_onlyimglogo-removebg-preview.png" 
                  alt="Matrix Root Logo" 
                  className="h-12 w-12 object-contain" 
                />
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tight text-black leading-none">
                    MATRIX ROOT
                  </span>
                  <span className="text-[9px] font-bold text-[#8B5A2B] tracking-widest uppercase mt-0.5">
                    STUDIO
                  </span>
                </div>
              </div>
              <div className="text-right text-[10px] text-black/60 leading-normal">
                <h3 className="font-extrabold text-xs text-[#8B5A2B] uppercase tracking-wider mb-1">Matrix Root Studio</h3>
                <p>Enterprise Software & IT Internships</p>
                <p>Registered MSME Entity</p>
                <p>Contact: matrixroottechnologies@gmail.com</p>
                <p>Website: www.matrixroot.in</p>
              </div>
            </div>

            {/* Reference Number & Date */}
            <div className="flex justify-between text-xs text-black/70 mb-6">
              <p><span className="font-bold text-[#8B5A2B]">Ref No:</span> MR/INT/2026/{enrollId.substring(0, 8).toUpperCase()}</p>
              <p><span className="font-bold text-[#8B5A2B]">Date:</span> {formatDate(enrolledAt)}</p>
            </div>

            {/* Recipient Details */}
            <div className="mb-6 text-xs leading-normal">
              <p className="font-bold text-[10px] text-[#8B5A2B] tracking-widest uppercase mb-2">INTERNSHIP OFFER LETTER</p>
              <div className="space-y-0.5">
                <p className="text-black/50 text-[10px]">To,</p>
                <p className="font-extrabold text-base text-black capitalize">{studentName}</p>
                <p className="text-black/70">{email}</p>
                <p className="text-black/70 font-mono text-[11px]">Intern ID: MR-INT-2026-{enrollId.substring(0, 5).toUpperCase()}</p>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black border-l-4 border-[#8B5A2B] pl-3 py-1">
                Subject: Internship Joining & Enrollment Confirmation
              </h2>
            </div>

            {/* Letter Body */}
            <div className="space-y-3.5 text-xs text-black/90 leading-relaxed text-justify font-normal">
              <p>Dear <strong className="capitalize">{studentName}</strong>,</p>
              
              <p>
                We are pleased to congratulate you on successfully enrolling and joining the <strong>8-Week Training-cum-Internship Program</strong> at <strong>Matrix Root Studio</strong>. This letter serves as your official joining confirmation for the <strong>{courseName}</strong> specialization track.
              </p>

              <p>
                Your internship begins on <strong>{formatDate(enrolledAt)}</strong>. Throughout the course of this internship, you will be trained on modern industry tools, build project portfolios, and collaborate under the guidance of our engineering mentors to develop key industry skills.
              </p>

              <div className="my-5 border border-black/10 rounded-[8px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-black/10 bg-neutral-50/50">
                      <td className="p-3 font-semibold text-[#8B5A2B] text-[11px] uppercase tracking-wider w-1/3">Internship Role</td>
                      <td className="p-3 text-xs text-black">Intern - {courseName}</td>
                    </tr>
                    <tr className="border-b border-black/10">
                      <td className="p-3 font-semibold text-[#8B5A2B] text-[11px] uppercase tracking-wider">Joining Date</td>
                      <td className="p-3 text-xs text-black">{formatDate(enrolledAt)}</td>
                    </tr>
                    <tr className="border-b border-black/10 bg-neutral-50/50">
                      <td className="p-3 font-semibold text-[#8B5A2B] text-[11px] uppercase tracking-wider">Tenure / Duration</td>
                      <td className="p-3 text-xs text-black">8 Weeks (Structured Learning, Mentorship & Capstone Deliverables)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#8B5A2B] text-[11px] uppercase tracking-wider">Credential Issued</td>
                      <td className="p-3 text-xs text-black">Verifiable Internship Certificate (Upon passing assignments)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>Operational Terms & Learning Policies:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1.5 my-2">
                <li>You are expected to commit adequate hours weekly to lessons, task reviews, and assignments.</li>
                <li>All assignments and code submissions must be completed and submitted through the Matrix Root dashboard.</li>
                <li>Your internship completion certificate will be generated and issued immediately upon positive mentor evaluations.</li>
                <li>This internship is designed for industrial training and project-based experience. All projects developed during the training belong to the respective training tracks.</li>
              </ul>

              <p className="pt-2">
                We hope this experience will be a foundational step towards your career goals. We are excited to have you on board!
              </p>

              <p className="italic text-black/70 pt-1">
                Welcome to the team, and we wish you a highly successful learning journey!
              </p>
            </div>
          </div>

          {/* Letter Footer: Signatures & Bottom Info */}
          <div className="mt-8 pt-6 border-t border-black/10 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wider inline-block mb-1">
                  Status: Active & Verified
                </p>
                <p className="text-[9px] text-black/50 font-mono">Verification Hash: MR-{enrollId.substring(0, 13).toUpperCase()}</p>
              </div>
              
              <div className="flex flex-col items-center mr-4">
                <div className="h-[48px] flex items-end justify-center mb-1">
                  <img 
                    src="/img/signature.png" 
                    alt="Program Director Signature" 
                    className="max-h-full max-w-[140px] object-contain mix-blend-multiply" 
                  />
                </div>
                <div className="w-40 h-[1px] bg-black/10 mb-1"></div>
                <p className="text-[11px] font-extrabold text-black">Program Director</p>
                <p className="text-[9px] text-[#8B5A2B] uppercase tracking-widest font-bold">Matrix Root Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadOfferLetter}
        disabled={downloading}
        className="w-full min-h-[36px] py-2 px-4 bg-black/5 hover:bg-black/10 text-black font-bold rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 text-xs border border-black/15 hover:border-black/25 shadow-none disabled:opacity-50"
      >
        <FileText size={14} />
        {downloading ? "Generating..." : "Download Offer Letter"}
      </button>
    </div>
  );
};

export default OfferLetterPDF;
