import type { ReactNode } from 'react'

type IconProps = {
  size?: number
  className?: string
}

function Svg({
  size = 24,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconOrbit({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M17.1 6.9l1.7-1.7M5.2 18.8l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </Svg>
  )
}

export function IconPlanning({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M7 4.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.5 9h7M8.5 12.5h5M8.5 16h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="16.2" cy="16" r="1.3" fill="currentColor" />
    </Svg>
  )
}

export function IconProgress({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" opacity="0.35" />
      <path
        d="M12 3.8a8.2 8.2 0 0 1 8.2 8.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 8v4.2l2.6 1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconCompleted({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8.2 12.2l2.5 2.5 5.2-5.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconPlus({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 6.5v11M6.5 12h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconSun({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8M6.1 6.1l1.3 1.3M16.6 16.6l1.3 1.3M16.6 7.4l1.3-1.3M6.1 17.9l1.3-1.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconMoon({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M15.8 14.6A6.4 6.4 0 0 1 9.2 5.5a6.8 6.8 0 1 0 6.6 9.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconExport({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 4.5v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.5 8 12 4.5 15.5 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 15.5v2a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconImport({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 14.5V4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.5 11 12 14.5 15.5 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 15.5v2a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconComment({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M6.5 17.5 5 20l3.2-1.2A8 8 0 1 0 6.5 17.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 11h6.4M8.8 14h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconCalendar({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <rect
        x="4"
        y="5.5"
        width="16"
        height="14"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 3.8v3.2M16 3.8v3.2M4 10h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconClose({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconGrip({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="9" cy="8" r="1.2" fill="currentColor" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      <circle cx="9" cy="16" r="1.2" fill="currentColor" />
      <circle cx="15" cy="16" r="1.2" fill="currentColor" />
    </Svg>
  )
}

export function IconSpark({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 3.5 13.4 9l5.6 1.4-5.6 1.4L12 17.5l-1.4-5.7L5 10.4l5.6-1.4L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconSearch({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.2 16.2 20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IconSort({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M8 6v12M8 18l-2.4-2.4M8 18l2.4-2.4M16 18V6M16 6l-2.4 2.4M16 6l2.4 2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconChevron({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M8 10l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconCheck({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M6.5 12.2 10 15.7 17.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconTrash({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M5.5 8h13M10 8V6.5a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 14 6.5V8M9 10.5v6M12 10.5v6M15 10.5v6M7 8l.7 11a2 2 0 0 0 2 1.8h4.6a2 2 0 0 0 2-1.8L17 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconMore({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="6.5" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="17.5" cy="12" r="1.3" fill="currentColor" />
    </Svg>
  )
}

export function IconTarget({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </Svg>
  )
}
