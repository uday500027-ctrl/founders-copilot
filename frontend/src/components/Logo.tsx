import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 select-none">
      <Image
        src="/logo.jpg"
        alt="Praxism logo"
        width={size}
        height={size}
        priority
        className="block shrink-0 bg-graphite"
      />
      <span className="font-heading font-bold text-bone text-lg tracking-tight">
        Praxism
      </span>
    </Link>
  );
}
