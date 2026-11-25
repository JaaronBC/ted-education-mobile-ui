import { useLanguage as useLocale12 , useLanguage as useDateLanguage10 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { formatDateTime } from '@/i18n/format';
import { useLayoutEffect,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  Smartphone,
  MonitorSmartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react-native';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { sessionGeneration } from '../../../services/sessionTokens';

import {
  sessionApi,
  type AccountSession,
} from '../api/sessionApi';

import { theme } from '../../../constants/theme';

const C = theme.colors;



function deviceTitle(platform?: string | null) {
  switch (platform) {
    case 'android':
      return 'Android device';

    case 'ios':
      return 'iOS device';

    case 'web':
      return 'Web browser';

    default:
      return 'Unknown device';
  }
}

function DeviceIcon({
  platform,
}: {
  platform?: string | null;
}) {
  const Icon =
    platform === 'web'
      ? Monitor
      : platform === 'android' || platform === 'ios'
        ? Smartphone
        : MonitorSmartphone;

  return (
    <Icon
      size={26}
      color={C.darkBlue}
    />
  );
}

export default function SessionManager() {
  const { user } = useSession();

  if (!user) return null;

  const epoch = sessionGeneration();

  return (
    <SessionManagerContent
      key={user.id + ':' + epoch}
      epoch={epoch}
    />
  );
}

function SessionManagerContent({
  epoch,
}: {
  epoch: number;
}) {
  const { t: t12 } = useLocale12();

  const { language: dateLanguage10 } = useDateLanguage10();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();
  const context = useSession();

  const contextRef = useRef(context);
  useLayoutEffect(() => {
    contextRef.current = context;
  }, [context]);

  const routerRef = useRef(router);
  useLayoutEffect(() => {
    routerRef.current = router;
  }, [router]);

  const [sessions, setSessions] =
    useState<AccountSession[]>([]);

  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const mounted = useRef(false);
  const focused = useRef(false);
  const locked = useRef(false);

  const revision = useRef({ value: 0 });
  const pendingRefresh = useRef(false);

  useEffect(() => {
    const cleanupCounter = revision.current;

    mounted.current = true;

    return () => {
      mounted.current = false;
      cleanupCounter.value++;
    };
  }, []);

  const execute = useCallback(
    async function run(
      operation: 'refresh' | 'revoke' | 'all' = 'refresh',
      targetId?: string,
    ): Promise<void> {
      const validEpoch = () =>
        mounted.current &&
        epoch === sessionGeneration();

      if (!validEpoch() || !focused.current) {
        return;
      }

      if (locked.current) {
        if (operation === 'refresh') {
          pendingRefresh.current = true;
        }

        return;
      }

      if (
        operation !== 'refresh' &&
        AppState.currentState !== 'active'
      ) {
        return;
      }

      const viewRevision = revision.current.value;

      const current = () =>
        validEpoch() &&
        focused.current &&
        revision.current.value === viewRevision;

      locked.current = true;

      setBusy(true);
      setError('');

      try {
        if (operation === 'all') {
          if (!current()) return;

          // SessionContext handles server revocation
          // and secure local credential cleanup.

          const nextEpoch =
            await contextRef.current.signOutAll();

          if (
            typeof nextEpoch === 'number' &&
            nextEpoch === sessionGeneration()
          ) {
            routerRef.current.replace('/welcome');
          }

          return;
        }

        const token =
          await contextRef.current.getToken();

        if (!current()) return;

        if (!token) {
          throw new Error('Sign in again.');
        }

        if (operation === 'revoke') {
          if (
            !targetId ||
            AppState.currentState !== 'active'
          ) {
            return;
          }

          await sessionApi.revoke(
            token,
            targetId,
          );
        }

        if (!current()) return;

        const result = await sessionApi.list(token);

        if (!current()) return;

        setSessions(result.sessions);
        setHasMore(result.hasMore);
        setLoaded(true);
      } catch (err) {
        if (current()) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to manage sessions.',
          );
        }
      } finally {
        locked.current = false;

        if (validEpoch()) {
          setBusy(false);

          if (
            focused.current &&
            pendingRefresh.current
          ) {
            pendingRefresh.current = false;
            void run();
          }
        }
      }
    },
    [epoch],
  );

  useFocusEffect(useCallback(() => {
    focused.current = true;
    revision.current.value++;

    setSessions([]);
    setLoaded(false);
    setHasMore(false);

    void execute();

    return () => {
      focused.current = false;
      revision.current.value++;
      pendingRefresh.current = false;
    };
  }, [execute]));

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      state => {
        revision.current.value++;

        if (
          state === 'active' &&
          focused.current &&
          epoch === sessionGeneration()
        ) {
          void execute();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [epoch, execute]);

  function mayConfirm(viewRevision: number) {
    return (
      mounted.current &&
      focused.current &&
      revision.current.value === viewRevision &&
      !locked.current &&
      epoch === sessionGeneration() &&
      AppState.currentState === 'active'
    );
  }

  function confirmRevoke(session: AccountSession) {
    const viewRevision = revision.current.value;

    if (
      session.current ||
      !mayConfirm(viewRevision)
    ) {
      return;
    }

    Alert.alert(
      tr10("Revoke this session?"),
      tr10("This session will need to sign in again."),
      [
        {
          text: tr10("Cancel"),
          style: 'cancel',
        },
        {
          text: tr10("Revoke"),
          style: 'destructive',
          onPress: () => {
            if (mayConfirm(viewRevision)) {
              void execute('revoke', session.id);
            }
          },
        },
      ],
    );
  }

  function confirmAll() {
    const viewRevision = revision.current.value;

    if (!mayConfirm(viewRevision)) return;

    Alert.alert(
      tr10("Sign out of all devices?"),
      tr10("This ends all active sessions, including the current session. You will need to sign in again."),
      [
        {
          text: tr10("Cancel"),
          style: 'cancel',
        },
        {
          text: tr10("Sign out"),
          style: 'destructive',
          onPress: () => {
            if (mayConfirm(viewRevision)) {
              void execute('all');
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{t12("Review where you are signed in and manage your active TED Education sessions.")}</Text>

      <Text style={styles.note}>{t12("Device labels are reported by the app. Multiple sessions may belong to one device.")}</Text>

      {loaded && (
        <Text style={styles.heading}>
          {sessions.length} active sessions shown
        </Text>
      )}

      {sessions.map(session => (
        <View
          key={session.id}
          style={styles.card}
        >
          <View style={styles.header}>
            <DeviceIcon
              platform={session.devicePlatform}
            />

            <View style={styles.deviceDetails}>
              <Text style={styles.title}>
                {t12(deviceTitle(session.devicePlatform))}
              </Text>

              <Text style={
                session.current
                  ? styles.current
                  : styles.detail
              }>
                {session.current
                  ? tr10("Current session")
                  : tr10("Other session")}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.detail}>{tr10("Signed in:")} {formatDateTime(dateLanguage10, session.createdAt)}
          </Text>

          <Text style={styles.detail}>{tr10("Last active:")} {formatDateTime(dateLanguage10, session.lastActiveAt)}
          </Text>

          <Text style={styles.detail}>{tr10("Expires:")} {formatDateTime(dateLanguage10, session.expiresAt)}
          </Text>

          {!session.current && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                'Revoke ' +
                deviceTitle(session.devicePlatform) +
                ' session'
              }
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              style={[
                styles.dangerButton,
                busy && styles.disabled,
              ]}
              onPress={() => confirmRevoke(session)}
            >
              <Text style={styles.dangerText}>{tr10("Revoke session")} </Text>
            </Pressable>
          )}
        </View>
      ))}

      {hasMore && (
        <Text style={styles.note}>{t12("Only the first 100 other sessions are shown. Revoke sessions and refresh to see more.")}</Text>
      )}

      {loaded && sessions.length === 0 && (
        <Text style={styles.note}>{tr10("No active sessions found.")} </Text>
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

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        style={[
          styles.refreshButton,
          busy && styles.disabled,
        ]}
        onPress={() => {
          void execute();
        }}
      >
        <RefreshCw size={18} color="#FFFFFF" />

        <Text style={styles.refreshText}>{tr10("Refresh sessions")} </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          disabled: busy || !loaded,
        }}
        disabled={busy || !loaded}
        onPress={confirmAll}
        style={[
          styles.dangerButton,
          (busy || !loaded) && styles.disabled,
        ]}
      >
        <Text style={styles.dangerText}>{tr10("Sign out of all devices")} </Text>
      </Pressable>

      <Text style={styles.note}>{t12("Recent activity is approximate and may be updated at five-minute intervals.")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  heading: {
    color: C.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },

  description: {
    color: C.primaryText,
    fontSize: 15,
    lineHeight: 23,
  },

  note: {
    color: C.secondaryText,
    fontSize: 13,
    lineHeight: 20,
  },

  card: {
    gap: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  deviceDetails: {
    flex: 1,
    gap: 4,
  },

  title: {
    color: C.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },

  current: {
    color: C.darkBlue,
    fontSize: 13,
    fontWeight: '700',
  },

  detail: {
    color: C.secondaryText,
    fontSize: 13,
    lineHeight: 20,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
  },

  refreshButton: {
    minHeight: 48,
    padding: 13,
    borderRadius: 12,
    backgroundColor: C.darkBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  refreshText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },

  dangerButton: {
    minHeight: 48,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.error,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dangerText: {
    color: C.error,
    fontWeight: '600',
    textAlign: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  error: {
    color: C.error,
    fontSize: 13,
    lineHeight: 20,
  },
});
