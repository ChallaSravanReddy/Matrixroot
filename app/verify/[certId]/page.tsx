"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  BadgeCheck, 
  Calendar, 
  GraduationCap, 
  ShieldCheck, 
  Building2,
  Clock,
  Award,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function VerificationPage() {
  const params = useParams();
  const certId = params?.certId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationData = async () => {
      if (!certId) return;

      try {
        console.log("Starting verification for ID:", certId);
        
        // Step 1: Fetch the core enrollment data
        const { data: enrollData, error: enrollError } = await supabase
          .from("enrollments")
          .select("*")
          .eq("id", certId)
          .maybeSingle();

        if (enrollError) {
          console.error("Enrollment DB Error:", enrollError);
          setErrorMsg(`Database error: ${enrollError.message}`);
          setLoading(false);
          return;
        }

        if (!enrollData) {
          setErrorMsg("Certificate record not found in our registry.");
          setLoading(false);
          return;
        }

        // Step 2: Fetch Profile and Course data separately to bypass missing FK relationships
        const [profileRes, courseRes] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", enrollData.student_id).maybeSingle(),
          supabase.from("courses").select("title, departments(name)").eq("id", enrollData.course_id).maybeSingle()
        ]);

        // Combine the data
        const combinedData = {
          ...enrollData,
          profiles: profileRes.data,
          courses: courseRes.data
        };

        if (combinedData.certification_status !== 'approved') {
          setErrorMsg("This certificate is pending approval and cannot be verified yet.");
        } else {
          setData(combinedData);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-black mb-4">Verification Error</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {errorMsg || "The certificate ID you are looking for does not exist or has not been officially verified by Matrix Root."}
        </p>

        {/* Diagnostic Debug Info */}
        <div className="bg-muted p-4 rounded-xl text-left text-[10px] font-mono mb-8 max-w-md w-full border border-border">
          <p className="text-muted-foreground uppercase font-bold mb-2">Diagnostic Data</p>
          <p>Target ID: <span className="text-foreground">{certId}</span></p>
          <p>Status: <span className="text-destructive">{errorMsg ? 'Fetch Failed' : 'No Data Found'}</span></p>
        </div>

        {errorMsg?.includes("policy") || errorMsg?.includes("Database") && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-xs font-medium mb-8 max-w-md">
            <p className="font-bold mb-1">Administrator Action Required:</p>
            This usually means the database permissions (RLS) are blocking public access. Please run the SQL fix provided.
          </div>
        )}
        <Button onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
      <div className="absolute inset-0 matrix-bg -z-10 opacity-10" />
      
      {/* Verification Card */}
      <div className="max-w-2xl w-full bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="bg-primary p-8 text-primary-foreground text-center relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            ID: {certId.substring(0,13).toUpperCase()}
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl">
              <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root" width={56} height={56} />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Matrix Root Official Verification</h1>
          <p className="text-primary-foreground/80 text-sm font-medium">This credential has been verified and recorded on our secure servers.</p>
        </div>

        <div className="p-10 space-y-10">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-3 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
            <BadgeCheck size={24} />
            <span className="font-black uppercase tracking-widest text-sm">Verified Accomplishment</span>
          </div>

          {/* Details Grid */}
          <div className="grid gap-8">
            <DetailRow 
              icon={<GraduationCap className="text-primary" />} 
              label="Recipient Name" 
              value={data.profiles?.full_name} 
            />
            <DetailRow 
              icon={<Award className="text-primary" />} 
              label="Program Track" 
              value={data.courses?.title} 
            />
             <DetailRow 
              icon={<Building2 className="text-primary" />} 
              label="Department" 
              value={data.courses?.departments?.name} 
            />
            <div className="grid grid-cols-2 gap-4">
               <DetailRow 
                icon={<Calendar className="text-primary" />} 
                label="Enrolled On" 
                value={new Date(data.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} 
              />
               <DetailRow 
                icon={<Clock className="text-primary" />} 
                label="Completed On" 
                value={new Date(data.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} // In a real case, use a completed_at field
              />
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col items-center gap-4">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Official Industry Certification</p>
             <div className="flex items-center gap-6">
                <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Company" width={40} height={40} className="grayscale opacity-50" />
                <div className="h-8 w-px bg-border" />
                <div className="text-left">
                   <p className="text-xs font-black uppercase tracking-tight">Matrix Root Engineering</p>
                   <p className="text-[10px] text-muted-foreground font-bold">Bangalore, India</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <button onClick={() => window.location.href = '/'} className="mt-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
        <ArrowLeft size={16} /> Back to Matrix Root
      </button>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}
