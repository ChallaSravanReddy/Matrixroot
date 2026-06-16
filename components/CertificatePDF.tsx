"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import { domToPng } from "modern-screenshot";

import { getSiteUrl } from "@/lib/siteConfig";

interface CertificateProps {
  studentName: string;
  courseName: string;
  branch: string;
  score: number;
  certId: string;
  trigger?: React.ReactNode;
}

const CertificatePDF: React.FC<CertificateProps> = ({ studentName, courseName, branch, score, certId, trigger }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Matrix-Root-Certificate-${studentName.replace(/\s+/g, "-")}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const siteUrl = getSiteUrl();

  return (
    <div className="flex flex-col items-center gap-[24px]">
      {/* HIDDEN CERTIFICATE TEMPLATE */}
      <div className="fixed left-[-9999px]">
        <div 
          ref={certificateRef}
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#8B5A2B',
            width: '1122px',
            height: '793px',
          }}
          className="p-16 relative border-[12px] font-serif text-black"
        >
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4" style={{ borderColor: '#8B5A2B' }}></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4" style={{ borderColor: '#8B5A2B' }}></div>

          <div className="flex flex-col items-center h-full text-center font-sans">
            {/* Header - Fixed Height Area to prevent overlap */}
            <div className="h-[200px] flex flex-col justify-center items-center w-full shrink-0">
              <div className="mb-6">
                <img src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root" className="w-24 h-24 object-contain" />
              </div>
              <h1 className="text-[42px] font-normal tracking-[-0.01em] uppercase font-serif leading-none mb-4 text-black">
                Certificate of Excellence
              </h1>
              <p className="text-[12px] text-black/60 tracking-[0.2em] uppercase font-bold">
                Matrix Root Professional Mastery
              </p>
            </div>

            {/* Body - Flexible middle area */}
            <div className="flex-1 flex flex-col justify-center items-center w-full py-8">
              <p className="text-xl italic text-black/80 font-serif mb-8">This document attests that</p>
              <div className="w-full max-w-2xl border-b border-black/15 pb-4 mb-8">
                <h2 className="text-[64px] font-normal text-black font-serif leading-tight">
                  {studentName}
                </h2>
              </div>
              <p className="text-lg text-black/80 max-w-3xl mx-auto leading-relaxed font-light px-12">
                has satisfied the course requirements of the <span className="font-bold text-[#8B5A2B]">{courseName}</span> program 
                specializing in the <span className="font-bold text-black">{branch}</span> discipline.
              </p>
            </div>

            {/* Footer - Fixed Height Area */}
            <div className="h-[180px] w-full flex justify-between items-end px-12 border-t border-black/10 pt-8 shrink-0">
              <div className="flex items-center gap-10">
                {/* Performance Score */}
                <div className="text-left space-y-2">
                  <div className="p-4 rounded-[16px] border border-black/10 bg-neutral-50 min-w-[160px] shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5A2B] mb-1">Performance Rating</p>
                    <p className="text-3xl font-black text-black">{score}%</p>
                  </div>
                  <p className="text-[10px] font-bold text-black/40 tracking-wider">Authority ID: {certId?.substring(0, 13).toUpperCase()}</p>
                </div>

                {/* QR Code Verification */}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white border border-black/10 rounded-[16px] shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(siteUrl + '/verify/' + certId)}`} 
                      alt="Verify Certificate" 
                      className="w-16 h-16"
                    />
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#8B5A2B]">Scan Validation</p>
                </div>
              </div>

              <div className="flex flex-col items-center pb-2">
                  <div className="h-[44px] flex items-end justify-center mb-1">
                      <img 
                           src="/img/signature.png" 
                           alt="Program Director Signature" 
                           className="max-h-full max-w-[150px] object-contain" 
                      />
                  </div>
                  <div className="w-48 h-[2px] bg-black/10 mb-3"></div>
                  <p className="text-base font-bold text-black">Program Director</p>
                  <p className="text-[11px] font-bold text-black/50 uppercase tracking-widest">Matrix Root Institution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {trigger ? (
        <div onClick={downloadCertificate} className="cursor-pointer w-full">
          {trigger}
        </div>
      ) : (
        <button 
          onClick={downloadCertificate}
          className="w-full min-h-[44px] py-3 px-6 bg-black hover:bg-neutral-900 text-white font-medium rounded-[12px] transition-colors shadow-none flex items-center justify-center gap-2 text-sm border-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download Internship Certificate
        </button>
      )}
    </div>
  );
};

export default CertificatePDF;
