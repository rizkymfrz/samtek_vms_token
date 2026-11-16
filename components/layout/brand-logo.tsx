import Image from "next/image";
import { cn } from "@/lib/utils";

export const BrandLogo = ({ className }: { className?: string }) => {
  return (
    <Image
      src="/logo.svg"
      alt="Samtek"
      width={627}
      height={659}
      className={cn("object-contain", className)}
      unoptimized
    />
  );
};
