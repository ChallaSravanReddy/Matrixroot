import { Suspense } from "react";
import CourseDetailPageClient from "./CourseDetailPageClient";

export default async function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#FAF6F0] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#FDBF84] border-t-[#8B5A2B] rounded-full"></div>
      </div>
    }>
      <CourseDetailPageClient />
    </Suspense>
  );
}
