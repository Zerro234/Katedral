import { Suspense } from "react";
import CekEmailClient from "./CekEmailClient";

export default function CekEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">Loading...</div>}>
      <CekEmailClient />
    </Suspense>
  );
}
