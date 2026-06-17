import Image from "next/image";

/** Native aspect ratio of the Canva logo asset (200 × 34). */
const RATIO = 200 / 34;

interface ElbritLogoProps {
  height?: number;
  /**
   * Wordmark colour variant:
   *  - "white" (default) for the dark theme
   *  - "navy" for light backgrounds (the original Canva export)
   */
  variant?: "white" | "navy";
}

/**
 * Official Elbrit brand mark, sourced from Canva (Projects → Logo → "Elbrit Logo.png").
 * The white variant is the navy export recoloured for the dark landing page.
 */
export default function ElbritLogo({
  height = 36,
  variant = "white",
}: ElbritLogoProps) {
  const src = variant === "navy" ? "/elbrit-logo.png" : "/elbrit-logo-white.png";
  return (
    <Image
      className="elbrit-logo"
      src={src}
      alt="Elbrit"
      width={Math.round(height * RATIO)}
      height={height}
      priority
      style={{ height, width: "auto" }}
    />
  );
}
