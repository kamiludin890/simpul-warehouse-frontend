import type { ReactNode } from "react";

export type IconName =
  | "home"
  | "order"
  | "product"
  | "warehouse"
  | "plus"
  | "edit"
  | "close";

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </>
  ),
  order: (
    <>
      <path d="M5 3h14v18H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  product: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 8 9 5 9-5M3 13l9 5 9-5M3 8v9l9 5 9-5V8" />
    </>
  ),
  warehouse: (
    <>
      <path d="m3 9 9-6 9 6v11H3z" />
      <path d="M8 20v-7h8v7M8 8h.01M12 8h.01M16 8h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({
  name,
  size = 19,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
