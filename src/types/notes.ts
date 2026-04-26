export type NoteCategory = "articles" | "vault" | "people" | "music";

export type Note = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  date: string;
  modifiedAt?: string;
  backlinks: string[];
  outboundLinks: string[];
  isPublic: boolean;
  // Category-specific fields
  domain?: string; // for articles
  url?: string; // for articles (alias)
  author?: string; // for articles
  links?: string[]; // for people
  artist?: string; // for music
  album?: string; // for music
  year?: (string | number)[]; // for music (array)
};

export type NotesGraph = {
  nodes: Array<{
    id: string;
    name: string;
    category: NoteCategory;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
};
