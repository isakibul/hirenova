type IconName =
  | "bell"
  | "briefcase"
  | "chart"
  | "check"
  | "file"
  | "moon"
  | "search"
  | "spark"
  | "sun"
  | "target"
  | "user";

const paths: Record<IconName, React.ReactNode> = {
  bell: (
    <>
      <path d="M18 16v-5a6 6 0 0 0-12 0v5" />
      <path d="M4 16h16" />
      <path d="M10 20h4" />
    </>
  ),
  briefcase: (
    <>
      <path d="M9 7V5h6v2" />
      <path d="M5 7h14v12H5z" />
      <path d="M5 12h14" />
    </>
  ),
  chart: (
    <>
      <path d="M5 19V5" />
      <path d="M5 19h14" />
      <path d="M9 15v-4" />
      <path d="M13 15V8" />
      <path d="M17 15v-2" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </>
  ),
  moon: (
    <>
      <path d="M20 15.5A8 8 0 0 1 8.5 4 7 7 0 1 0 20 15.5z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v5" />
      <path d="M12 16v5" />
      <path d="M3 12h5" />
      <path d="M16 12h5" />
      <path d="m6 6 3 3" />
      <path d="m15 15 3 3" />
      <path d="m18 6-3 3" />
      <path d="m9 15-3 3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
};

export default function Icon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {paths[name]}
    </svg>
  );
}
