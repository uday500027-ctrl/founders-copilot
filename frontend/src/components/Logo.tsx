import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 select-none group">
      <Image
        src="/logo.jpg"
        alt="Praxism logo"
        width={size}
        height={size}
        priority
        className="block shrink-0 bg-graphite rounded-sm"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          filter: "brightness(1.35) contrast(1.25)",
        }}
      />
      <span className="font-heading font-bold text-bone text-lg tracking-tight">
        Praxism
      </span>
    </Link>
  );
}
