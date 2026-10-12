export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const initials = parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
  return initials.toUpperCase();
}

export function averageRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/** Trie du plus récent au plus ancien (les documents sans date en premier : écriture en cours). */
export function sortByNewest<T extends { createdAt: Date | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const timeA = a.createdAt ? a.createdAt.getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.createdAt ? b.createdAt.getTime() : Number.MAX_SAFE_INTEGER;
    return timeB - timeA;
  });
}
