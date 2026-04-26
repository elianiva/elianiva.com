import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^ws-]/g, "")
    .replace(/s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
