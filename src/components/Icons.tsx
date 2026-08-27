import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
    ...rest,
  };
}

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);

export const IconCross = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3.5 2.5" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 14.6 9l6 .6-4.5 4 1.3 5.9L12 16.4 6.6 19.5 7.9 13.6l-4.5-4 6-.6L12 3.5Z" />
  </svg>
);

export const IconTarget = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 12h.01" strokeWidth="3" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2.5 5 13.5h5.5L10 21.5l8-11h-5.5L13 2.5Z" />
  </svg>
);

export const IconNoReturn = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 6 3.5 12 9 18M3.5 12H20" />
    <path d="M4.5 4.5 20 20" stroke="var(--color-signal)" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 3.5V9h-5.5" />
  </svg>
);

export const IconFlag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 21V3.5M5.5 4h12l-2.5 4 2.5 4h-12" />
  </svg>
);

export const IconAsterisk = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
  </svg>
);

export const IconSquare = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="5" width="14" height="14" fill="currentColor" stroke="none" />
  </svg>
);
