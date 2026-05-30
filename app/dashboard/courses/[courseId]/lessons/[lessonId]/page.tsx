import { Suspense } from "react";
import LessonPageClient from "./LessonPageClient";

export default async function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <LessonPageClient />
    </Suspense>
  );
}
