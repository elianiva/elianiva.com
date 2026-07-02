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
  domain?: string;
  url?: string;
  author?: string;
  links?: string[];
  artist?: string;
  album?: string;
  year?: (string | number)[];
};

