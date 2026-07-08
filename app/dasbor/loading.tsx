import { Loader2 } from "lucide-react";

export default function DasborLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-[#A89880]">
      <Loader2 size={40} className="animate-spin text-[#B8960C]" />
      <p className="text-sm font-medium animate-pulse" style={{ fontFamily: "var(--font-dm-sans)" }}>
        Menyiapkan dasbor Anda...
      </p>
    </div>
  );
}
