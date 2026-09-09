export type UsesItem = {
  name: string;
  spec: string;
  note: string;
  href?: string;
};

export type UsesSection = {
  slug: string;
  title: string;
  kicker: string;
  items: UsesItem[];
};

export const usesUpdatedAt = "2026-09-09";

export const uses: UsesSection[] = [
  {
    slug: "hardware",
    title: "hardware",
    kicker: "Hardworking pieces of hardened sand (silicon) lol",
    items: [
      {
        name: "MacBook Air",
        spec: "M1 · 16GB · 512GB",
        note: "Bought used. Daily driver.",
      },
      {
        name: "ThinkPad X220",
        spec: "i5 · 8GB · 500GB",
        note: "Old one. Dad uses it most of the time.",
      },
      {
        name: "Mao Wang GK65",
        spec: "Epomaker Wisteria",
        note: "Daily board. Loving this keyboard.",
      },
      {
        name: "NYK Nemesis MQ-10",
        spec: "PAW 3212",
        note: "Cheap and fullfils my needs.",
      },
      {
        name: "Ziigaat Nuo",
        spec: "10mm LCP",
        note: "Got it for damn cheap, sounds great.",
      },
      {
        name: "Custom Earbuds",
        spec: "-",
        note: "Made by local audio guy. I wear this if i don't want to be deaf",
      },
      {
        name: "TOZO Aerosound 3",
        spec: "TWS",
        note: "Travel buddy. I use it a lot while travelling.",
      },
    ],
  },
  {
    slug: "software",
    title: "software",
    kicker: "My day to day work happens using these tools",
    items: [
      {
        name: "Neovim",
        spec: "Text Editor",
        note: "The good ol' trusty editor since I started my career.",
        href: "https://neovim.io",
      },
      {
        name: "Claude Code",
        spec: "Coding Agent",
        note: "Used for work stuff.",
      },
      {
        name: "Pi",
        spec: "Coding Agent",
        note: "Where most of the coding happens.",
        href: "https://pi.dev",
      },
      {
        name: "BB",
        spec: "Coding Agent Control Plane",
        note: "I use Pi and CC through this, it's so damn good.",
        href: "https://getbb.app",
      },
      {
        name: "Jujutsu",
        spec: "Version Control",
        note: "I much prefer this over Git.",
      },
    ],
  },
  {
    slug: "camera",
    title: "camera",
    kicker: "Things I use to take pictures",
    items: [
      {
        name: "Fujifilm X-T20",
        spec: "7Artisans 25mm f/1.8",
        note: "I love this camera so much.",
      },
      {
        name: "Tecno Camon 50 Ultra",
        spec: "Sony LYT 700C",
        note: "My point and shoot for when I don't have my camera with me",
      },
    ],
  },
];
