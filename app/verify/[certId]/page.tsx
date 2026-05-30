import { Suspense } from "react";
import VerificationPageClient from "./VerificationPageClient";

export default async function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <VerificationPageClient />
    </Suspense>
  );
}
