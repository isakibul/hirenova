import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ className = "" }) {
  return (
    <Link
      href="/"
      aria-label="HireNova home"
      className={`brand-logo inline-flex items-center gap-2 tracking-tight ${className}`}
    >
      <span className="relative h-12 w-48 shrink-0" aria-hidden="true">
        <Image
          src="/brand/hirenova-wordmark-cropped.png"
          alt=""
          fill
          priority
          sizes="192px"
          className="object-contain"
        />
      </span>
    </Link>
  );
}
