import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function S({ size = 18, children, ...rest }: P & { children?: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IPlus = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const ICheck = (p: P) => (
  <S {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </S>
);

export const IArrowR = (p: P) => (
  <S {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </S>
);

export const IChevronD = (p: P) => (
  <S {...p}>
    <path d="M6 9.5 12 15.5 18 9.5" />
  </S>
);

export const IChat = (p: P) => (
  <S {...p}>
    <path d="M21 11.6a7.6 7.6 0 0 1-7.6 7.6H4l1.8-3.1A7.6 7.6 0 1 1 21 11.6Z" />
  </S>
);

export const ITrash = (p: P) => (
  <S {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </S>
);

export const IBriefcase = (p: P) => (
  <S {...p}>
    <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
    <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 13h18" />
  </S>
);

export const IHouse = (p: P) => (
  <S {...p}>
    <path d="M4 11.2 12 4l8 7.2" />
    <path d="M6.2 10v9.5h11.6V10" />
    <path d="M10 19.5v-5h4v5" />
  </S>
);

export const IPalette = (p: P) => (
  <S {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.8 2-1.9 0-1.3-1-1.5-1-2.5 0-.8.7-1.4 1.7-1.4h1.6A3.7 3.7 0 0 0 20 11.5C20 6.8 16.4 3 12 3Z" />
    <circle cx="8" cy="9" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="16.4" cy="9.6" r="1.1" fill="currentColor" stroke="none" />
  </S>
);

export const IClose = (p: P) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);

export const IUndo = (p: P) => (
  <S {...p}>
    <path d="M3.5 3.5v5h5" />
    <path d="M4 8.5A8.4 8.4 0 1 1 3.5 13" />
  </S>
);

export const ILayers = (p: P) => (
  <S {...p}>
    <path d="M12 3 3.5 7.8 12 12.5l8.5-4.7L12 3Z" />
    <path d="m3.5 12.5 8.5 4.7 8.5-4.7" />
    <path d="m3.5 16.7 8.5 4.8 8.5-4.8" />
  </S>
);

export const IInbox = (p: P) => (
  <S {...p}>
    <path d="M5 5h14l2 8v6H3v-6l2-8Z" />
    <path d="M3 13h5.5l1.5 2.5h4l1.5-2.5H21" />
  </S>
);
