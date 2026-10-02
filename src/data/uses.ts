export type UsesItem = {
  name: string;
  spec: string;
  note: string;
  href?: string;
  /**
   * The reasoning: why this over the alternatives. Optional on purpose, so the
   * page can be half-answered without looking broken.
   */
  why?: string;
  /** What this replaced, and why the old thing lost. */
  swapFor?: string;
};

export type UsesSection = {
  slug: string;
  title: string;
  kicker: string;
  items: UsesItem[];
};

export const usesUpdatedAt = "2026-10-02";

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
        why: "It's a very good price to value machine you can buy these days. It's not top of the line stuff but when most of my coding happens outside of my local machine you don't need a beefy machine. The only thing I care about is does it feel good to use for general computing and does the battery last.",
      },
      {
        name: "ThinkPad X220",
        spec: "i5 · 8GB · 500GB",
        note: "My old main machine. Dad uses it most of the time.",
        why: "This was my first machine that I used for serious work. I still have it laying around at my house, mostly used by my dad. It served its purpose back then. I'd recommend getting an old ThinkPad if you're limited on budget. It does the job.",
      },
      {
        name: "Mao Wang GK65",
        spec: "Epomaker Wisteria",
        note: "Daily board. Loving this keyboard.",
        why: "A good and very cheap 65% keyboard. The body is fully aluminium with acrylic backplate because you attach an image at the back. Probably one of the best keyboard I've ever had. I really like how it feels when typing. Bought it for cheap from China second hand market",
      },
      {
        name: "NYK Nemesis MQ-10",
        spec: "PAW 3212",
        note: "Cheap and fullfils my needs.",
        why: "It does its job. It's your bog-standard wireless mouse. I like the fact that it has charging dock so I can just plonk it there whenever I'm done with it. Not the best, but not bad either. It's just a generic mouse that does the job.",
      },
      {
        name: "Ziigaat Nuo",
        spec: "10mm LCP",
        note: "Got it for cheap, sounds great.",
        why: "I used to be deep in audiophile stuff but these days I don't really care. Ziigat Nuo was one of the best at its price point and I happen to find someone selling it for really cheap so I bought it. I never have to think about IEM anymore.",
      },
      {
        name: "Custom Earbuds",
        spec: "-",
        note: "Made by local audio guy. I wear this if i don't want to be deaf",
        why: "Back when I was doing audiophile stuff I ordered this from a local custom earbud maker. I don't know how he does it but it's spot on. It sounds exactly like how I requested it.",
      },
      {
        name: "TOZO Aerosound 3",
        spec: "TWS",
        note: "Travel buddy. I use it a lot while travelling.",
        why: "Main purpose of it is for practicality. I'm bringing it with me whenever I'm travelling. Not much else to it really other than it's pretty good for its price.",
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
        why: "I started on Vim out of stubbornness, because everyone said Vim was hard and I wanted to prove that was aimed at people who gave up early. Neovim is basically the modern version of Vim with a bunch of additions. Used it for years, this used to be my main editor before I go all in with AI assisted coding. Now it's just there for quick script edit when I'm already in the terminal",
      },
      {
        name: "Zed",
        spec: "Text Editor",
        note: "The fastest GUI editor",
        href: "https://zed.dev",
        why: "One of the most exciting project I've been following since its first emergence. Now it's my main editor for editing something serious, like this website. I still do manual handcoding for fun and for when I need very granular control. It's a fun and fast editor to use. I'd highly recommend it.",
      },
      {
        name: "TypeScript",
        spec: "Typed JavaScript",
        note: "The language of agents",
        href: "https://www.typescriptlang.org",
        why: "My main language for building anything, really. I like it more these days because there's things like Effect and the fact that there's an abundance of training data so AI is good at writing them. This is not without tradeoffs, though. I've accepted its shortcoming for its benefits. I do use other language when the situation calls for it, but Typescript is usually my first choice.",
      },
      {
        name: "Effect",
        spec: "The only correct way of writing TypeScript",
        note: "Honestly, if you haven't used it, try it",
        href: "https://effect.website",
        why: "It's basically a whole ass system for Typescript. You can just think of it as the 'standard library' for Typescript. I build all my projects using Effect for quite a long time now. Don't let the weird syntax fool you, just give it a try. Your agents will thank you.",
      },
      {
        name: "Alchemy",
        spec: "Infrastructure as Code",
        note: "The painless way of managing infra",
        href: "https://alchemy.run",
        why: "It manages all infra related stuff for me. IaaC has been around for a while but Alchemy uses Effect and it just feels very composable and natural compared to something like Terraform. It's just Typescript at the end of the day.",
      },
      {
        name: "Foldkit",
        spec: "Frontend Framework",
        note: "Effect, but in the browser.",
        href: "https://foldkit.dev",
        why: "I pretty much replaced React with Foldkit these days. The goal is to have Effect end to end because it's such a robust system that makes me enjoy writing Typescript once again. Also because I'm quite fond of The Elm Architecture. Makes things simpler to reason about.",
      },
    ],
  },
  {
    slug: "agents",
    title: "agents",
    kicker: "The ones that actually write the code, not me",
    items: [
      {
        name: "Claude Code",
        spec: "Coding Agent",
        note: "Used for work stuff.",
        href: "https://claude.com/product/claude-code",
        why: "Probably one of the most used coding agents out there. It's what the default for most people. I only use it because the company pays for it and use it for work related stuff only.",
      },
      {
        name: "Pi",
        spec: "Coding Agent",
        note: "Where most of the coding happens.",
        href: "https://pi.dev",
        why: "Pretty much the Vim of coding agent. It's minimal by default but stupidly extensible you can build pretty much anything with it. This is my main agent for short tasks and quick things I need to do. It's pretty minimal and fast.",
      },
      {
        name: "AmpCode",
        spec: "Coding Agent",
        note: "The one running this whole session.",
        href: "https://ampcode.com",
        why: "My coding harness of choice. They're really ahead of their time, like, always. A lot of people describe them as the Porsche of coding agents and they're absolutely right! You should try it out, especially their orbs. It really takes the pain out of coding agents.",
      },
      {
        name: "OpenCode Go",
        spec: "Model Subscription",
        note: "One of the cheapest way to access LLM",
        href: "https://opencode.ai/go",
        why: "I'm sure it's the reason why coding agents become more accessible for a lot of people. It's really cheap and generous with its limit.",
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
        why: "I chose Fujifilm because it looks sexy and has great colour science, things like film simulation and whatnot. I use this camera mostly for street photography. It's just a hobby thing that I do when I'm bored of asking LLM to write code for me",
      },
      {
        name: "Tecno Camon 50 Ultra",
        spec: "Sony LYT 700C",
        note: "My point and shoot for when I don't have my camera with me",
        why: "It's my phone that happens to also have a decent camera. It's not amazing because I don't like computational photography, the same reason why I don't like iPhone camera, but it does the job when I need it. It's a phone camera so what do you expect lol.",
      },
    ],
  },
];
