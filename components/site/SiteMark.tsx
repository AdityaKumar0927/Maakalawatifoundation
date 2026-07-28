import Image from "next/image";
import { getMedia } from "@/lib/media";
import { Logo } from "@/components/site/Logo";

/**
 * The Foundation's mark: the admin-uploaded logo when one is set, otherwise
 * the built-in lotus SVG. Height is fixed; wide logos keep their proportions.
 */
export async function SiteMark({ size = 40 }: { size?: number }) {
  const media = await getMedia();
  const logo = media.get("logo");
  if (!logo) return <Logo size={size} />;
  return (
    <Image
      src={logo.url}
      alt={logo.alt || "Maa Kalawati Foundation"}
      width={size * 3}
      height={size}
      className="object-contain"
      style={{ height: size, width: "auto", maxWidth: size * 3 }}
    />
  );
}