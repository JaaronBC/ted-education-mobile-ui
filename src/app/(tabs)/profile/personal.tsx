import { useLanguage as useLocale12 , useLanguage as useLocale10 , useLanguage } from '@/i18n/LanguageContext';
// PERSONAL_STAGE1_V1: Account basics, read-only email, nullable gender, save status.
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import type { Account } from '../../../services/authApi';
import AvatarEditor from '../../../features/profile/components/AvatarEditor';
import { theme } from '../../../constants/theme';

const C = theme.colors;

const genderOptions: { value: Account['gender']; label: string }[] = [
  { value: null, label: 'Not specified' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export default function PersonalInformationScreen() {
  const { user } = useSession();
  if (!user) return <Redirect href="/(auth)/login" />;
  return <PersonalInformationForm key={user.id} user={user} />;
}

function PersonalInformationForm({ user }: { user: Account }) {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const { updateAccountProfile } = useSession();
  const { t } = useLanguage();

  const [name, setName] = useState(user.fullName);
  const [gender, setGender] = useState<Account['gender']>(user.gender);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const previous = useRef({
    name: user.fullName,
    gender: user.gender
  });

  // Sync server changes without overwriting unsaved edits.
  useEffect(() => {
    const old = previous.current;

    setName(current =>
      current === old.name ? user.fullName : current
    );

    setGender(current =>
      current === old.gender ? user.gender : current
    );

    previous.current = {
      name: user.fullName,
      gender: user.gender
    };
  }, [user.fullName, user.gender]);

  const normalized = normalizeName(name);

  const changed =
    normalized !== user.fullName ||
    gender !== user.gender;

  async function save() {
    if (saving || !changed) return;

    if (normalized.length < 2 || normalized.length > 120) {
      setStatus('error');
      setError('Full name must contain 2 to 120 characters.');
      return;
    }

    setSaving(true);
    setStatus('idle');
    setError('');

    try {
      const updated = await updateAccountProfile({
        fullName: normalized,
        gender,
      });

      setName(updated.fullName);
      setGender(updated.gender);
      setStatus('saved');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to save your details.'
      );
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setName(user.fullName);
    setGender(user.gender);
    setError('');
    setStatus('idle');
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>
          {t('Personal Information')}
        </Text>

        <AvatarEditor />

        <Text style={styles.label}>
          {t('Email address')}
        </Text>

        <View style={styles.readOnly}>
          <Text selectable style={styles.readOnlyText}>
            {user.email}
          </Text>
        </View>

        <Text style={styles.hint}>{t12("Your account email is read-only here. Email changes will be added separately.")}</Text>

        <Text style={styles.label}>
          {t('Full name')} *
        </Text>

        <TextInput
          style={styles.input}
          accessibilityLabel={t('Full name')}
          value={name}
          onChangeText={value => {
            setName(value);
            setStatus('idle');
          }}
          editable={!saving}
          autoComplete="name"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={120}
          placeholder={t('Enter your full name')}
        />

        <Text style={styles.label}>
          {t('Gender')} ({t('Optional')})
        </Text>

        {genderOptions.map(option => (
          <Pressable
            key={option.value ?? 'none'}
            accessibilityRole="radio"
            accessibilityState={{
              checked: gender === option.value,
              disabled: saving
            }}
            disabled={saving}
            style={[
              styles.option,
              gender === option.value && styles.active
            ]}
            onPress={() => {
              setGender(option.value);
              setStatus('idle');
            }}
          >
            <Text style={styles.optionText}>
              {t(option.label)}
            </Text>

            <Text style={styles.optionText}>
              {gender === option.value ? '?' : ''}
            </Text>
          </Pressable>
        ))}

        {status === 'saved' && !changed ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.success}
          >{tr10("Your profile has been updated.")} </Text>
        ) : null}

        {status === 'error' ? (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {t12(error)}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: saving || !changed
          }}
          disabled={saving || !changed}
          onPress={() => { void save(); }}
          style={[
            styles.button,
            (saving || !changed) && styles.disabled
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : null}

          <Text style={styles.buttonText}>
            {saving ? tr10("Saving...") : t('Save changes')}
          </Text>
        </Pressable>

        {changed && !saving ? (
          <Pressable
            accessibilityRole="button"
            onPress={discard}
            style={styles.discard}
          >
            <Text style={styles.discardText}>{tr10("Discard changes")} </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.surface
  },
  content: {
    padding: 22,
    paddingBottom: 60
  },
  heading: {
    fontSize: 27,
    fontWeight: '700',
    color: C.primaryText,
    marginBottom: 14
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primaryText,
    marginTop: 18,
    marginBottom: 9
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 54,
    paddingHorizontal: 14,
    fontSize: 17,
    color: C.primaryText
  },
  readOnly: {
    backgroundColor: '#EAF0F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  readOnlyText: {
    color: C.secondaryText,
    fontSize: 16
  },
  hint: {
    marginTop: 8,
    color: C.secondaryText,
    fontSize: 12
  },
  option: {
    minHeight: 51,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF'
  },
  active: {
    backgroundColor: C.lightBlue,
    borderColor: C.darkBlue
  },
  optionText: {
    color: C.primaryText,
    fontSize: 15
  },
  button: {
    minHeight: 53,
    backgroundColor: C.darkBlue,
    borderRadius: 13,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  disabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  success: {
    color: C.success,
    marginTop: 14,
    fontSize: 14
  },
  error: {
    color: C.error,
    marginTop: 14,
    fontSize: 14
  },
  discard: {
    alignItems: 'center',
    paddingVertical: 14
  },
  discardText: {
    color: C.darkBlue,
    fontWeight: '600',
    fontSize: 14
  },
});
