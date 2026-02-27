import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryBadgeColor(categoryName: string) {
  if (!categoryName) return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  const name = normalize(categoryName);

  if (name.includes('ALFABETIZACAO')) return 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (name.includes('ALONGAMENTO')) return 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  if (name.includes('ARTESANATO')) return 'bg-pink-100/80 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800';
  if (name.includes('CORAL')) return 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
  if (name.includes('CAPOEIRA')) return 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
  if (name.includes('DEFESA')) return 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  if (name.includes('MUSICA')) return 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
  if (name.includes('PINTURA')) return 'bg-teal-100/80 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800';
  if (name.includes('TEATRO')) return 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  if (name.includes('VIOLAO')) return 'bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
  if (name.includes('FUTSAL') || name.includes('VOLEI')) return 'bg-lime-100/80 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200 dark:border-lime-800';

  // Default fallback
  return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
}
