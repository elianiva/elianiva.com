export interface PhotoEntry {
  id: string;
  dateTaken: string; // "2025-03-15"
  image: string; // "photography/2025-03-15/img-001.webp"
  camera?: string; // "Fujifilm X-T5", "iPhone 16 Pro"
  lens?: string; // "XF 23mm f/1.4"
  editedWith?: string; // "Lightroom", "Darkroom", "VSCO"
}

export const photos: PhotoEntry[] = [
  {
    id: "sunset-at-pura-uluwatu",
    dateTaken: "2025-06-12",
    image: "photography/2025-06-12/img-001.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
    editedWith: "Lightroom",
  },
  {
    id: "morning-rice-terraces",
    dateTaken: "2025-06-12",
    image: "photography/2025-06-12/img-002.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
    editedWith: "Lightroom",
  },
  {
    id: "warung-cat",
    dateTaken: "2025-06-12",
    image: "photography/2025-06-12/img-003.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 56mm f/1.2",
    editedWith: "Lightroom",
  },
  {
    id: "coffee-at-senyum",
    dateTaken: "2025-06-10",
    image: "photography/2025-06-10/img-001.webp",
    camera: "iPhone 16 Pro",
    editedWith: "Darkroom",
  },
  {
    id: "rainy-jalan-kayu-manis",
    dateTaken: "2025-06-10",
    image: "photography/2025-06-10/img-002.webp",
    camera: "iPhone 16 Pro",
    editedWith: "Darkroom",
  },
  {
    id: "monkey-forest-portrait",
    dateTaken: "2025-06-08",
    image: "photography/2025-06-08/img-001.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 90mm f/2",
    editedWith: "Lightroom",
  },
  {
    id: "temple-silhouette",
    dateTaken: "2025-06-08",
    image: "photography/2025-06-08/img-002.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
  },
  {
    id: "beach-at-pandawa",
    dateTaken: "2025-05-28",
    image: "photography/2025-05-28/img-001.webp",
    camera: "iPhone 16 Pro",
  },
  {
    id: "night-market-babigulingan",
    dateTaken: "2025-05-28",
    image: "photography/2025-05-28/img-002.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
    editedWith: "Lightroom",
  },
  {
    id: "leaking-bamboo",
    dateTaken: "2025-05-20",
    image: "photography/2025-05-20/img-001.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 56mm f/1.2",
    editedWith: "Lightroom",
  },
  {
    id: "morning-light-through-window",
    dateTaken: "2025-05-20",
    image: "photography/2025-05-20/img-002.webp",
    camera: "iPhone 16 Pro",
  },
  {
    id: "canang-sari",
    dateTaken: "2025-05-20",
    image: "photography/2025-05-20/img-003.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
    editedWith: "Lightroom",
  },
  {
    id: "pura-besakih-stairs",
    dateTaken: "2025-05-15",
    image: "photography/2025-05-15/img-001.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
    editedWith: "VSCO",
  },
  {
    id: "bali-street-dog",
    dateTaken: "2025-05-15",
    image: "photography/2025-05-15/img-002.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 90mm f/2",
    editedWith: "Lightroom",
  },
  {
    id: "bamboo-forest-light",
    dateTaken: "2025-05-12",
    image: "photography/2025-05-12/img-001.webp",
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4",
    editedWith: "Lightroom",
  },
];
