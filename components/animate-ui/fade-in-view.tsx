import type { CSSProperties, ReactNode } from "react";

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  exit?: boolean;
}

export default function FadeInView({
  children,
  delay = 0,
  duration = 0.6,
  distance = 20,
  direction = "up",
  className = "",
}: FadeInViewProps) {
  const offset = {
    up: { x: "0px", y: `${distance}px` },
    down: { x: "0px", y: `${-distance}px` },
    left: { x: `${distance}px`, y: "0px" },
    right: { x: `${-distance}px`, y: "0px" },
  }[direction];

  const style = {
    "--entry-delay": `${delay}s`,
    "--entry-duration": `${duration}s`,
    "--entry-x": offset.x,
    "--entry-y": offset.y,
  } as CSSProperties;

  return (
    <div className={`entry-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
