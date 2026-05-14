"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import { domToPng } from "modern-screenshot";

interface CertificateProps {
  studentName: string;
  courseName: string;
  branch: string;
  score: number;
  certId: string;
}

const CertificatePDF: React.FC<CertificateProps> = ({ studentName, courseName, branch, score, certId }) => {
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

  return (
    <div className="flex flex-col items-center gap-[24px]">
      {/* HIDDEN CERTIFICATE TEMPLATE */}
      <div className="fixed left-[-9999px]">
        <div 
          ref={certificateRef}
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#8B4513',
            width: '1122px',
            height: '793px',
          }}
          className="p-16 relative border-[12px] font-serif text-[#3D2B1F]"
        >
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4" style={{ borderColor: '#8B4513' }}></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4" style={{ borderColor: '#8B4513' }}></div>

          <div className="flex flex-col items-center h-full justify-between text-center font-sans">
            {/* Header */}
            <div className="space-y-4">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <img src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root" className="w-20 h-20 object-contain opacity-90" />
              </div>
              <h1 className="text-4xl font-normal tracking-[-0.02em] uppercase font-serif" style={{ color: '#3D2B1F' }}>
                Certificate of Excellence
              </h1>
              <p className="text-sm text-[#3D2B1F]/60 tracking-widest uppercase">
                Matrix Root Professional Mastery
              </p>
            </div>

            {/* Body */}
            <div className="space-y-6">
              <p className="text-lg italic text-[#3D2B1F]/80 font-serif">This document attests that</p>
              <h2 className="text-5xl font-normal text-[#3D2B1F] font-serif border-b border-[#8B4513]/20 pb-4 max-w-xl mx-auto">
                {studentName}
              </h2>
              <p className="text-base text-[#3D2B1F]/80 max-w-2xl mx-auto leading-relaxed font-light">
                has fully satisfied the rigorous operational requirements of the <span className="font-medium text-[#8B4513]">{courseName}</span> program 
                specializing in the <span className="font-medium text-[#3D2B1F]">{branch}</span> discipline.
              </p>
            </div>

            {/* Footer Stats & Signatures */}
            <div className="w-full flex justify-between items-end mt-12 px-12 border-t border-[#8B4513]/10 pt-6">
              <div className="flex items-center gap-8">
                {/* Performance Score */}
                <div className="text-left space-y-1">
                  <div className="p-3 rounded-[12px] border border-[#8B4513]/20 bg-[#F9F5F0] min-w-[140px]">
                    <p className="text-[9px] font-medium uppercase text-[#8B4513]">Performance Rating</p>
                    <p className="text-2xl font-semibold text-[#3D2B1F]">{score}%</p>
                  </div>
                  <p className="text-[9px] text-[#3D2B1F]/40 tracking-tight">Authority ID: {certId?.substring(0, 13).toUpperCase()}</p>
                </div>

                {/* QR Code Verification */}
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-white border border-[#8B4513]/20 rounded-[12px]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/verify/' + certId : '')}`} 
                      alt="Verify Certificate" 
                      className="w-14 h-14"
                    />
                  </div>
                  <p className="text-[7px] font-semibold uppercase tracking-widest text-[#8B4513]">Scan Validation</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                  <div className="w-40 h-px bg-[#8B4513]/40 mb-2"></div>
                  <p className="text-sm font-medium text-[#3D2B1F]">Program Director</p>
                  <p className="text-[10px] text-[#3D2B1F]/60">Matrix Root Institution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={downloadCertificate}
        className="w-full min-h-[44px] py-3 px-6 bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] font-medium rounded-[12px] transition-colors shadow-none flex items-center justify-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#8B4513]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download Internship Certificate
      </button>
    </div>
  );
};

export default CertificatePDF;
