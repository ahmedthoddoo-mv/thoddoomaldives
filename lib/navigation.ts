export type PublicNavigationLink = {
  label: string;
  href: string;
};

export const publicNavigationLinks: PublicNavigationLink[] = [
  { label: "Home", href: "/" },
  { label: "Stay", href: "/stay" },
  { label: "Excursions", href: "/excursions" },
  { label: "Transfer", href: "/transfer" },
  { label: "Gallery", href: "/gallery" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Guide", href: "/guide" },
  { label: "Contact", href: "/contact" }
];
