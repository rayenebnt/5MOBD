export type FormErrors<T extends string> = Partial<Record<T, string>>;

export const LIMITS = {
  displayNameMax: 50,
  passwordMin: 6,
  addressNameMax: 80,
  descriptionMax: 500,
  commentMax: 500,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export interface LoginValues {
  email: string;
  password: string;
}

export function validateLogin(values: LoginValues): FormErrors<keyof LoginValues> {
  const errors: FormErrors<keyof LoginValues> = {};
  if (!values.email.trim()) errors.email = "L'e-mail est obligatoire.";
  else if (!isValidEmail(values.email)) errors.email = 'Adresse e-mail invalide.';
  if (!values.password) errors.password = 'Le mot de passe est obligatoire.';
  return errors;
}

export interface RegisterValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegister(values: RegisterValues): FormErrors<keyof RegisterValues> {
  const errors: FormErrors<keyof RegisterValues> = {};
  const name = values.displayName.trim();
  if (!name) errors.displayName = 'Le nom est obligatoire.';
  else if (name.length > LIMITS.displayNameMax)
    errors.displayName = `Le nom ne doit pas dépasser ${LIMITS.displayNameMax} caractères.`;

  if (!values.email.trim()) errors.email = "L'e-mail est obligatoire.";
  else if (!isValidEmail(values.email)) errors.email = 'Adresse e-mail invalide.';

  if (values.password.length < LIMITS.passwordMin)
    errors.password = `Le mot de passe doit contenir au moins ${LIMITS.passwordMin} caractères.`;

  if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
  return errors;
}

export interface AddressFormValues {
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}

export function validateAddress(
  values: AddressFormValues,
): FormErrors<'name' | 'description' | 'location'> {
  const errors: FormErrors<'name' | 'description' | 'location'> = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Le nom est obligatoire.';
  else if (name.length > LIMITS.addressNameMax)
    errors.name = `Le nom ne doit pas dépasser ${LIMITS.addressNameMax} caractères.`;

  if (values.description.trim().length > LIMITS.descriptionMax)
    errors.description = `La description ne doit pas dépasser ${LIMITS.descriptionMax} caractères.`;

  if (values.latitude === null || values.longitude === null)
    errors.location = "Choisissez l'emplacement de l'adresse sur la carte.";
  return errors;
}

export interface ReviewFormValues {
  rating: number;
  comment: string;
}

export function validateReview(values: ReviewFormValues): FormErrors<keyof ReviewFormValues> {
  const errors: FormErrors<keyof ReviewFormValues> = {};
  if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5)
    errors.rating = 'Donnez une note entre 1 et 5 étoiles.';
  const comment = values.comment.trim();
  if (!comment) errors.comment = 'Le commentaire est obligatoire.';
  else if (comment.length > LIMITS.commentMax)
    errors.comment = `Le commentaire ne doit pas dépasser ${LIMITS.commentMax} caractères.`;
  return errors;
}
