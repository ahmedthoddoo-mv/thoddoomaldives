import type { SVGProps } from "react";

type TransferIconName =
  | "boat"
  | "calendar"
  | "check"
  | "clock"
  | "luggage"
  | "pin"
  | "route"
  | "shield"
  | "sun"
  | "users"
  | "whatsapp";

const ICON_PATHS: Record<TransferIconName, string> = {
  boat: "M3 15l9 4l9-4M5 12h14l-2-5H7l-2 5Zm3-5V5h8v2",
  calendar: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  check: "M5 12l4 4L19 6",
  clock: "M12 7v5l3 3m6-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z",
  luggage: "M8 8V6a4 4 0 1 1 8 0v2m-9 0h10a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z",
  pin: "M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Zm0-8a3 3 0 1 1 0-6a3 3 0 0 1 0 6Z",
  route: "M5 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm14-14a2 2 0 1 0 0-4a2 2 0 0 0 0 4ZM7 17c5 0 5-10 10-10",
  shield: "M12 3l7 3v5c0 5-3.5 8-7 10c-3.5-2-7-5-7-10V6l7-3Z",
  sun: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8Z",
  users: "M9 11a3 3 0 1 0-6 0a3 3 0 0 0 6 0Zm12 0a3 3 0 1 0-6 0a3 3 0 0 0 6 0ZM2 21a7 7 0 0 1 14 0M12 21a7 7 0 0 1 10-6",
  whatsapp: "M20 11.5a7.5 7.5 0 1 1-14.3-3.1L4 19l10.8-1.6A7.5 7.5 0 0 1 20 11.5Z",
};

export function TransferIcon({
  name,
  className = "transferIcon",
  ...props
}: SVGProps<SVGSVGElement> & { name: TransferIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      <path
        d={ICON_PATHS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
