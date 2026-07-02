import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryBadgeColor(categoryName: string) {
  if (!categoryName) return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  const name = normalize(categoryName);

  if (name.includes('EDUCACAO') || name.includes('DIGITAL') || name.includes('INCLUSAO') || name.includes('ALFABETIZACAO')) return 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (name.includes('LUTA') || name.includes('MARCIAL') || name.includes('DEFESA')) return 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  if (name.includes('DANCA')) return 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  if (name.includes('MUSICA') || name.includes('CORAL') || name.includes('VIOLAO')) return 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
  if (name.includes('FISICA') || name.includes('ATIVIDADE') || name.includes('ALONGAMENTO')) return 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  if (name.includes('BEM-ESTAR') || name.includes('SAUDE')) return 'bg-teal-100/80 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800';
  if (name.includes('RECREACAO') || name.includes('LAZER')) return 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  if (name.includes('ARTESANATO') || name.includes('ARTES VISUAIS') || name.includes('PINTURA')) return 'bg-fuchsia-100/80 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800';
  if (name.includes('TEATRO')) return 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  if (name.includes('FUTSAL') || name.includes('VOLEI')) return 'bg-lime-100/80 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200 dark:border-lime-800';

  // Default fallback
  return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
}
