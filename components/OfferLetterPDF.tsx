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
    } catch (e) {
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
          className="p-16 relative font-sans text-[#3D2B1F] flex flex-col justify-between"
        >
          {/* Subtle Decorative Borders */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#8B4513]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#8B4513]"></div>

          <div>
            {/* Header: Company Logo & Details */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <img 
                  src="/img/matrixroot_combinedlogo-removebg-preview.png" 
                  alt="Matrix Root" 
                  className="h-14 object-contain" 
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-extrabold text-xl tracking-tight text-[#8B4513] font-sans">
                  MATRIX ROOT
                </span>
              </div>
              <div className="text-right text-[10px] text-[#3D2B1F]/60 leading-normal">
                <h3 className="font-extrabold text-xs text-[#8B4513] uppercase tracking-wider mb-1">Matrix Root Studio</h3>
                <p>Enterprise Software & IT Internships</p>
                <p>Registered MSME Entity</p>
                <p>Contact: support@matrixroot.in</p>
                <p>Website: www.matrixroot.in</p>
              </div>
            </div>

            {/* Reference Number & Date */}
            <div className="flex justify-between text-xs text-[#3D2B1F]/70 mb-8 border-b border-[#8B4513]/10 pb-4">
              <p><span className="font-bold text-[#8B4513]">Ref No:</span> MR/INT/2026/{enrollId.substring(0, 8).toUpperCase()}</p>
              <p><span className="font-bold text-[#8B4513]">Date:</span> {formatDate(enrolledAt)}</p>
            </div>

            {/* Recipient Details */}
            <div className="mb-8 text-xs leading-normal">
              <p className="font-extrabold text-[10px] text-[#8B4513] tracking-widest uppercase mb-2">Offer of Internship</p>
              <p className="font-extrabold text-base text-[#3D2B1F] mb-1">{studentName}</p>
              <p className="text-[#3D2B1F]/70">{email}</p>
              <p className="text-[#3D2B1F]/70">Intern ID: MR-INT-2026-{enrollId.substring(0, 5).toUpperCase()}</p>
            </div>

            {/* Subject */}
            <div className="text-center mb-8">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#3D2B1F] bg-[#F9F5F0] border-y border-[#8B4513]/20 py-2.5">
                Subject: Internship Joining & Enrollment Confirmation
              </h2>
            </div>

            {/* Letter Body */}
            <div className="space-y-4 text-xs text-[#3D2B1F]/90 leading-relaxed font-normal">
              <p>Dear <strong>{studentName}</strong>,</p>
              
              <p>
                We are pleased to congratulate you on successfully enrolling and joining the <strong>8-Week Training-cum-Internship Program</strong> at <strong>Matrix Root Studio</strong>. This letter serves as your official joining confirmation for the <strong>{courseName}</strong> specialization track.
              </p>

              <p>
                Your internship begins on <strong>{formatDate(enrolledAt)}</strong>. Throughout the course of this internship, you will be trained on modern industry tools, build project portfolios, and collaborate under the guidance of our engineering mentors to develop key industry skills.
              </p>

              <p>
                <strong>Internship Details:</strong>
              </p>
              <table className="w-full text-left border-collapse border border-[#8B4513]/15 my-4">
                <tbody>
                  <tr className="border-b border-[#8B4513]/15">
                    <td className="p-2.5 font-bold bg-[#F9F5F0] text-[#8B4513] w-1/3">Internship Role</td>
                    <td className="p-2.5">Intern - {courseName}</td>
                  </tr>
                  <tr className="border-b border-[#8B4513]/15">
                    <td className="p-2.5 font-bold bg-[#F9F5F0] text-[#8B4513]">Joining Date</td>
                    <td className="p-2.5">{formatDate(enrolledAt)}</td>
                  </tr>
                  <tr className="border-b border-[#8B4513]/15">
                    <td className="p-2.5 font-bold bg-[#F9F5F0] text-[#8B4513]">Tenure / Duration</td>
                    <td className="p-2.5">8 Weeks (Structured Learning, Mentorship & Capstone Deliverables)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold bg-[#F9F5F0] text-[#8B4513]">Credential Issued</td>
                    <td className="p-2.5">Verifiable Internship Certificate (Upon passing assignments)</td>
                  </tr>
                </tbody>
              </table>

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

              <p className="italic text-[#3D2B1F]/70 pt-1">
                Welcome to the team, and we wish you a highly successful learning journey!
              </p>
            </div>
          </div>

          {/* Letter Footer: Signatures & Bottom Info */}
          <div className="mt-8 pt-6 border-t border-[#8B4513]/10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-[#3D2B1F]/50 font-bold uppercase tracking-wider mb-1">Status: Active & Verified</p>
                <p className="text-[9px] text-[#3D2B1F]/40 font-mono">Verify Code: MR-{enrollId.substring(0, 13).toUpperCase()}</p>
              </div>
              
              <div className="flex flex-col items-center">
                {/* Signature box placeholder - customizable later */}
                <div className="h-12 w-44 flex items-center justify-center relative border border-[#8B4513]/10 rounded bg-[#F9F5F0]/50 mb-1">
                  <span className="text-[8px] text-[#8B4513]/50 font-extrabold tracking-widest uppercase">
                    [ Signature Placeholder ]
                  </span>
                </div>
                <div className="w-44 h-[1px] bg-[#8B4513]/30 mb-1"></div>
                <p className="text-[11px] font-extrabold text-[#3D2B1F]">Program Director</p>
                <p className="text-[9px] text-[#3D2B1F]/50 uppercase tracking-widest font-semibold">Matrix Root Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadOfferLetter}
        disabled={downloading}
        className="w-full min-h-[36px] py-2 px-4 bg-[#8B4513]/10 hover:bg-[#8B4513]/25 text-[#8B4513] font-bold rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 text-xs border border-[#8B4513]/20 hover:border-[#8B4513]/30 shadow-none disabled:opacity-50"
      >
        <FileText size={14} />
        {downloading ? "Generating..." : "Download Offer Letter"}
      </button>
    </div>
  );
};

export default OfferLetterPDF;
