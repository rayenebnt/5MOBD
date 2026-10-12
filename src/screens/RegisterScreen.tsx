import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';
import { getAuthErrorMessage } from '@/utils/authErrors';
import {
  type FormErrors,
  hasErrors,
  type RegisterValues,
  validateRegister,
} from '@/utils/validation';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [values, setValues] = useState<RegisterValues>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors<keyof RegisterValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof RegisterValues) => (text: string) =>
    setValues((previous) => ({ ...previous, [field]: text }));

  const onSubmit = async () => {
    const validation = validateRegister(values);
    setErrors(validation);
    setSubmitError(null);
    if (hasErrors(validation)) return;

    setLoading(true);
    try {
      await signUp({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Créez votre compte pour enregistrer et partager vos bonnes adresses.
        </Text>
        <TextField
          testID="register-name-input"
          label="Nom"
          value={values.displayName}
          onChangeText={setField('displayName')}
          error={errors.displayName}
          autoComplete="name"
          placeholder="Votre nom"
        />
        <TextField
          testID="register-email-input"
          label="E-mail"
          value={values.email}
          onChangeText={setField('email')}
          error={errors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="vous@exemple.com"
        />
        <TextField
          testID="register-password-input"
          label="Mot de passe"
          value={values.password}
          onChangeText={setField('password')}
          error={errors.password}
          secureTextEntry
          autoComplete="new-password"
          placeholder="6 caractères minimum"
        />
        <TextField
          testID="register-confirm-input"
          label="Confirmation du mot de passe"
          value={values.confirmPassword}
          onChangeText={setField('confirmPassword')}
          error={errors.confirmPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Répétez le mot de passe"
        />

        {submitError ? (
          <Text testID="register-error" style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}

        <Button testID="register-submit" title="Créer mon compte" onPress={onSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  intro: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  submitError: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
