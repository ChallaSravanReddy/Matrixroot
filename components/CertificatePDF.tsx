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
      // Use modern-screenshot instead of html2canvas to fix 'lab' color issues
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
    <div className="flex flex-col items-center gap-6">
      {/* HIDDEN CERTIFICATE TEMPLATE */}
      <div className="fixed left-[-9999px]">
        <div 
          ref={certificateRef}
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#4f46e5',
            width: '1122px', // A4 Landscape ratio
            height: '793px',
          }}
          className="p-16 relative border-[16px] font-serif text-zinc-900"
        >
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8" style={{ borderColor: '#818cf8' }}></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8" style={{ borderColor: '#818cf8' }}></div>

          <div className="flex flex-col items-center h-full justify-between text-center">
            {/* Header */}
            <div className="space-y-4">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <img src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root" className="w-24 h-24 object-contain" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase" style={{ color: '#1e1b4b' }}>Certificate of Excellence</h1>
              <p className="text-xl text-zinc-500 font-sans tracking-widest uppercase">Matrix Root Internship Program</p>
            </div>

            {/* Body */}
            <div className="space-y-6">
              <p className="text-2xl italic text-zinc-600">This is to certify that</p>
              <h2 className="text-6xl font-bold text-zinc-900 underline underline-offset-8" style={{ textDecorationColor: '#e0e7ff' }}>{studentName}</h2>
              <p className="text-2xl text-zinc-700 max-w-2xl mx-auto leading-relaxed">
                has successfully completed the <span className="font-bold" style={{ color: '#4338ca' }}>{courseName}</span> Internship 
                in the <span className="font-bold">{branch}</span> academic branch.
              </p>
            </div>

            {/* Footer Stats & Signatures */}
            <div className="w-full flex justify-between items-end mt-12 px-12">
              <div className="flex items-center gap-8">
                {/* Performance Score */}
                <div className="text-left space-y-2">
                  <div className="p-4 rounded-xl border min-w-[140px]" style={{ backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }}>
                    <p className="text-[10px] font-sans font-bold uppercase" style={{ color: '#818cf8' }}>Performance Score</p>
                    <p className="text-3xl font-bold" style={{ color: '#312e81' }}>{score}%</p>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans tracking-tight">Certificate ID: {certId?.substring(0, 13).toUpperCase()}</p>
                </div>

                {/* QR Code Verification */}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-white border border-zinc-200 rounded-xl">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/verify/' + certId : '')}`} 
                      alt="Verify Certificate" 
                      className="w-16 h-16"
                    />
                  </div>
                  <p className="text-[8px] font-sans font-black uppercase tracking-widest text-zinc-400">Scan to Verify</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                  <div className="w-48 h-px bg-zinc-400 mb-2"></div>
                  <p className="text-lg font-bold text-zinc-900">Program Director</p>
                  <p className="text-xs text-zinc-500">Matrix Root Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={downloadCertificate}
        className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download Internship Certificate
      </button>
    </div>
  );
};

export default CertificatePDF;
