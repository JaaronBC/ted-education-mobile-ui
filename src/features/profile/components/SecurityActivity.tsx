import { useLanguage as useLocale12 , useLanguage as useDateLanguage10 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { formatDateTime } from '@/i18n/format';

import { useLayoutEffect,
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useFocusEffect } from 'expo-router';

import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react-native';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { sessionGeneration } from '../../../services/sessionTokens';

import {
  securityActivityApi,
  type SecurityEvent,
} from '../api/securityActivityApi';

import { theme } from '../../../constants/theme';

const C = theme.colors;

const LABELS: Record<string, string> = {
  SESSION_CREATED: 'New session created',
  SESSION_REVOKED: 'Other session revoked',
  SIGNED_OUT: 'Signed out',
  ALL_SESSIONS_REVOKED: 'All sessions revoked',

  PASSWORD_CHANGED: 'Password set or changed',
  PASSWORD_RESET: 'Password reset',
  EMAIL_CHANGED: 'Email address changed',

  GOOGLE_LINKED: 'Google account connected',
  GOOGLE_UNLINKED: 'Google account disconnected',

  MFA_ENABLED: 'Two-factor authentication enabled',
  MFA_DISABLED: 'Two-factor authentication disabled',
  RECOVERY_CODES_REGENERATED: 'Recovery codes replaced',

  PASSWORD_LOGIN_FAILED: 'Unsuccessful password sign-in',
  MFA_VERIFICATION_FAILED: 'Unsuccessful authenticator verification',
  REFRESH_TOKEN_REPLAY: 'Refresh token reuse detected; session revoked',
};

function category(type: string) {
  if (
    type === 'PASSWORD_LOGIN_FAILED' ||
    type === 'MFA_VERIFICATION_FAILED'
  ) return 'Authentication';

  if (type === 'REFRESH_TOKEN_REPLAY') {
    return 'Security alert';
  }

  if (
    type.startsWith('SESSION_') ||
    type === 'SIGNED_OUT' ||
    type === 'ALL_SESSIONS_REVOKED'
  ) return 'Session activity';

  return 'Account security';
}



export default function SecurityActivity() {
  const { user } = useSession();

  if (!user) return null;

  const epoch = sessionGeneration();

  return (
    <ActivityContent
      key={user.id + ':' + epoch}
      epoch={epoch}
    />
  );
}

function ActivityContent({
  epoch,
}: {
  epoch: number;
}) {
  const { t: t12 } = useLocale12();

  const { language: dateLanguage10 } = useDateLanguage10();

  const { tr: tr10 } = useLocale10();

  const { getToken } = useSession();

  const tokenRef = useRef(getToken);
  useLayoutEffect(() => {
    tokenRef.current = getToken;
  }, [getToken]);

  const loadRef = useRef<
    ((cursor?: string) => Promise<void>) | null
  >(null);

  const [events, setEvents] =
    useState<SecurityEvent[]>([]);

  const [cursor, setCursor] =
    useState<string | null>(null);

  const [busy, setBusy] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    let locked = false;

    const current = () =>
      active && epoch === sessionGeneration();

    async function load(next?: string) {
      if (!current() || locked) return;

      locked = true;
      setBusy(true);
      setError('');

      if (!next) {
        setCursor(null);
      }

      try {
        const token = await tokenRef.current();

        if (!current()) return;

        if (!token) {
          throw new Error('Sign in again.');
        }

        const result =
          await securityActivityApi.list(
            token,
            next,
          );

        if (!current()) return;

        if (
          !Array.isArray(result.events) ||
          result.events.length > 50
        ) {
          throw new Error('Invalid activity response.');
        }

        setEvents(previous => {
          const combined = next
            ? [...previous, ...result.events]
            : result.events;

          const unique = new Map(
            combined.map(event => [event.id, event]),
          );

          return Array.from(unique.values());
        });

        setCursor(
          result.hasMore &&
          typeof result.nextCursor === 'string' &&
          result.nextCursor !== next
            ? result.nextCursor
            : null,
        );

        setLoaded(true);

      } catch (err) {
        if (current()) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load security activity.',
          );
        }
      } finally {
        locked = false;

        if (current()) {
          setBusy(false);
        }
      }
    }

    setEvents([]);
    setCursor(null);
    setLoaded(false);

    loadRef.current = load;

    void load();

    return () => {
      active = false;
      loadRef.current = null;
    };
  }, [epoch]));

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{t12("Review recent security activity on your account.")}</Text>

      <Text style={styles.note}>{t12("Repeated authentication failures may be grouped. A failed attempt does not necessarily mean someone accessed your account.")}</Text>

      {events.map(event => {
        const group = category(event.type);

        const warning =
          group === 'Authentication' ||
          group === 'Security alert';

        const Icon = warning
          ? ShieldAlert
          : ShieldCheck;

        return (
          <View
            key={event.id}
            style={styles.event}
          >
            <Icon
              size={24}
              color={warning ? C.error : C.darkBlue}
            />

            <View style={styles.eventContent}>
              <Text style={styles.title}>
                {t12(LABELS[event.type] ?? 'Account security event')}
              </Text>

              <Text style={styles.note}>
                {t12(group)}
              </Text>

              <Text style={styles.note}>
                {formatDateTime(dateLanguage10, event.createdAt)}
              </Text>
            </View>
          </View>
        );
      })}

      {loaded && events.length === 0 && (
        <Text style={styles.note}>{tr10("No recent security activity.")} </Text>
      )}

      {busy && <ActivityIndicator />}

      {!!error && (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {t12(error)}
        </Text>
      )}

      {!!cursor && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          style={[
            styles.button,
            busy && styles.disabled,
          ]}
          onPress={() => {
            void loadRef.current?.(cursor);
          }}
        >
          <Text style={styles.buttonText}>{tr10("Load older activity")} </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        style={[
          styles.button,
          busy && styles.disabled,
        ]}
        onPress={() => {
          void loadRef.current?.();
        }}
      >
        <RefreshCw size={18} color={C.darkBlue} />

        <Text style={styles.buttonText}>{tr10("Refresh activity")} </Text>
      </Pressable>

      <Text style={styles.note}>{t12("Security activity is retained for approximately 90 days.")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: C.primaryText,
  },

  note: {
    fontSize: 13,
    lineHeight: 20,
    color: C.secondaryText,
  },

  event: {
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  eventContent: {
    flex: 1,
    gap: 5,
  },

  title: {
    fontSize: 15,
    color: C.primaryText,
    fontWeight: '700',
  },

  button: {
    minHeight: 48,
    padding: 13,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  buttonText: {
    color: C.darkBlue,
    fontWeight: '700',
    textAlign: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  error: {
    color: C.error,
    fontSize: 13,
  },
});
