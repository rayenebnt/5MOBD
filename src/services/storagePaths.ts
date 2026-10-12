/** Emplacements des images dans Cloud Storage (cf. storage.rules). */
export const storagePaths = {
  avatar: (uid: string) => `users/${uid}/avatar.jpg`,
  addressPhoto: (uid: string, addressId: string) => `addresses/${uid}/${addressId}.jpg`,
  reviewPhoto: (addressId: string, uid: string, reviewId: string) =>
    `reviews/${addressId}/${uid}/${reviewId}.jpg`,
};
