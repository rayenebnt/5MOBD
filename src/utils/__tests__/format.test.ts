import { averageRating, formatDate, getInitials, sortByNewest } from '../format';

describe('getInitials', () => {
  it('renvoie les initiales du prénom et du nom', () => {
    expect(getInitials('Alice Martin')).toBe('AM');
    expect(getInitials('jean pierre dupont')).toBe('JD');
    expect(getInitials('Bob')).toBe('B');
  });

  it('renvoie "?" sans nom', () => {
    expect(getInitials(null)).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('averageRating', () => {
  it('calcule la moyenne arrondie au dixième', () => {
    expect(averageRating([4, 5, 5])).toBe(4.7);
    expect(averageRating([3])).toBe(3);
  });

  it('renvoie null sans avis', () => {
    expect(averageRating([])).toBeNull();
  });
});

describe('sortByNewest', () => {
  it('trie du plus récent au plus ancien sans modifier le tableau', () => {
    const items = [
      { id: 'old', createdAt: new Date('2026-01-01') },
      { id: 'pending', createdAt: null },
      { id: 'new', createdAt: new Date('2026-06-01') },
    ];
    expect(sortByNewest(items).map((item) => item.id)).toEqual(['pending', 'new', 'old']);
    expect(items[0].id).toBe('old');
  });
});

describe('formatDate', () => {
  it('formate une date en français', () => {
    expect(formatDate(new Date('2026-09-01T12:00:00Z'))).toMatch(/2026/);
    expect(formatDate(null)).toBe('');
  });
});
