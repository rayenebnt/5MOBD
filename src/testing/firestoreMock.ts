// Simulation minimale du SDK Firestore pour les tests des services :
//   jest.mock('firebase/firestore', () => require('@/testing/firestoreMock').firestoreMock);
type Ref = { path: string; id?: string };

const join = (parent: Ref | undefined, segments: string[]) =>
  [parent?.path, ...segments].filter(Boolean).join('/');

export const mockBatch = {
  delete: jest.fn(),
  commit: jest.fn(async () => undefined),
};

export const firestoreMock = {
  collection: jest.fn((parent: Ref, ...segments: string[]) => ({ path: join(parent, segments) })),
  doc: jest.fn((parent: Ref, ...segments: string[]) => {
    if (segments.length === 0) {
      return { id: 'generated-id', path: `${parent.path}/generated-id` };
    }
    return { id: segments[segments.length - 1], path: join(parent, segments) };
  }),
  query: jest.fn((collectionRef: Ref, ...constraints: unknown[]) => ({ ...collectionRef, constraints })),
  where: jest.fn((field: string, op: string, value: unknown) => ({ field, op, value })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  setDoc: jest.fn(async () => undefined),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  writeBatch: jest.fn(() => mockBatch),
};

/** Faux document Firestore. */
export function fakeDoc(id: string, data: Record<string, unknown> | undefined) {
  return {
    id,
    ref: { id, path: `docs/${id}` },
    exists: () => data !== undefined,
    data: () => data,
  };
}

export function fakeTimestamp(iso: string) {
  return { toDate: () => new Date(iso) };
}
