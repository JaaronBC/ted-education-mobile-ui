import { AccessibleInput } from '@/components/ui/AccessibleInput';
import { useLanguage as useLocale12 , useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { authApi } from '../../../services/authApi';
import { sessionGeneration } from '../../../services/sessionTokens';
import { theme } from '../../../constants/theme';
const C = theme.colors;
type Setup = { secret: string; uri: string };

type SensitiveState = {
  owner: string;
  epoch: number;
  setup: Setup | null;
  recoveryCodes: string[];
  recoveryTotp: string;
  code: string;
};

function emptySensitive(
  owner: string,
  epoch: number,
): SensitiveState {
  return {
    owner,
    epoch,
    setup: null,
    recoveryCodes: [],
    recoveryTotp: '',
    code: '',
  };
}
export default function SecurityScreen() {
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router = useRouter();
  const { user, getToken, replaceSession } = useSession();
  const [mfaStatus, setMfaStatus] = useState<'loading' | 'enabled' | 'disabled' | 'error'>('loading');
  const [statusError, setStatusError] = useState('');
  const [statusReload, setStatusReload] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [sensitive, setSensitive] =
    useState<SensitiveState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const accountId = user?.id;
  const epoch = sessionGeneration();

  const mounted = useRef(false);
  const focusedRef = useRef(false);
  const operationLock = useRef(false);
  const viewRevision = useRef({ value: 0 });
  const interactionRevision = useRef(0);
  const statusRevision = useRef(0);

  const [renderView, setRenderView] = useState(0);
  const [renderInteraction, setRenderInteraction] = useState(0);

  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );

  const ownedSensitive =
    sensitive?.owner === accountId &&
    sensitive?.epoch === epoch
      ? sensitive
      : null;

  const setup = ownedSensitive?.setup ?? null;
  const recoveryCodes = ownedSensitive?.recoveryCodes ?? [];
  const recoveryTotp = ownedSensitive?.recoveryTotp ?? '';
  const code = ownedSensitive?.code ?? '';

  function updateSensitive(
    patch: Partial<Omit<SensitiveState, 'owner' | 'epoch'>>,
  ) {
    if (
      !accountId ||
      !mounted.current ||
      !focusedRef.current ||
      viewRevision.current.value !== renderView ||
      interactionRevision.current !== renderInteraction ||
      epoch !== sessionGeneration()
    ) return;

    setSensitive(previous => {
      if (epoch !== sessionGeneration()) {
        return previous;
      }

      const base =
        previous?.owner === accountId &&
        previous.epoch === epoch
          ? previous
          : emptySensitive(accountId, epoch);

      return { ...base, ...patch };
    });
  }

  const setSetup = (value: Setup | null) =>
    updateSensitive({ setup: value });

  const setRecoveryCodes = (value: string[]) =>
    updateSensitive({ recoveryCodes: value });

  const setRecoveryTotp = (value: string) =>
    updateSensitive({ recoveryTotp: value });

  const setCode = (value: string) =>
    updateSensitive({ code: value });

  useEffect(() => {
    const cleanupCounter = viewRevision.current;

    mounted.current = true;

    return () => {
      mounted.current = false;
      cleanupCounter.value++;
    };
  }, []);

  useFocusEffect(useCallback(() => {
    focusedRef.current = true;
    viewRevision.current.value++;
    interactionRevision.current++;
    setRenderView(viewRevision.current.value);
    setRenderInteraction(interactionRevision.current);

    setFocused(true);
    setMfaStatus('loading');
    setStatusError('');
    setStatusReload(value => value + 1);

    return () => {
      focusedRef.current = false;
      viewRevision.current.value++;
      interactionRevision.current++;
      setRenderView(viewRevision.current.value);
      setRenderInteraction(interactionRevision.current);

      setFocused(false);
      setSensitive(null);
      setError('');
    };
  }, []));

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      state => {
        setForeground(state === 'active');
        setMfaStatus('loading');
        setStatusError('');

        if (state !== 'active') {
          interactionRevision.current++;
          setRenderInteraction(interactionRevision.current);

          setSensitive(previous =>
            previous
              ? {
                  ...previous,
                  code: '',
                  recoveryTotp: '',
                }
              : null,
          );
        }
      },
    );

    return () => subscription.remove();
  }, []);

  if (sensitive && (
    sensitive.epoch !== epoch ||
    (accountId && sensitive.owner !== accountId)
  )) {
    setSensitive(null);
  }


  function startOperation() {
    if (
      !accountId ||
      !mounted.current ||
      !focusedRef.current ||
      AppState.currentState !== 'active' ||
      operationLock.current ||
      epoch !== sessionGeneration() ||
      renderView !== viewRevision.current.value ||
      renderInteraction !== interactionRevision.current
    ) return null;

    operationLock.current = true;
    statusRevision.current++;

    setBusy(true);
    setError('');

    return {
      owner: accountId,
      epoch,
      view: viewRevision.current.value,
    };
  }

  type Operation = NonNullable<
    ReturnType<typeof startOperation>
  >;

  function viewCurrent(operation: Operation) {
    return (
      mounted.current &&
      focusedRef.current &&
      viewRevision.current.value === operation.view
    );
  }

  function operationCurrent(operation: Operation) {
    return (
      viewCurrent(operation) &&
      operation.epoch === sessionGeneration()
    );
  }

  function finishOperation() {
    operationLock.current = false;

    if (mounted.current) {
      setMfaStatus('loading');
      setStatusError('');
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!accountId || !focused || !foreground || busy) {
      return;
    }

    let active = true;
    const revision = statusRevision.current;

    function valid() {
      return (
        active &&
        focusedRef.current &&
        !operationLock.current &&
        revision === statusRevision.current &&
        epoch === sessionGeneration()
      );
    }

    void (async () => {
      try {
        const token = await getToken();

        if (!valid()) return;
        setMfaStatus('loading');
        setStatusError('');

        if (!token) {
          throw new Error('Sign in again.');
        }

        const info = await authApi.mfaStatus(token);

        if (!valid()) return;

        setRemaining(info.recoveryCodesRemaining);
        setMfaStatus(info.enabled ? 'enabled' : 'disabled');
      } catch (e) {
        if (!valid()) return;

        setRemaining(0);
        setMfaStatus('error');
        setStatusError(
          e instanceof Error
            ? e.message
            : 'Cannot load security settings.',
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [
    accountId,
    epoch,
    getToken,
    statusReload,
    focused,
    foreground,
    busy,
  ]);

  async function beginSetup() {
    if (mfaStatus !== 'disabled') return;

    const operation = startOperation();

    if (!operation) return;

    try {
      const token = await getToken();

      if (!operationCurrent(operation)) return;

      if (!token) throw new Error('Sign in again.');

      const result = await authApi.mfaSetup(token);

      if (!operationCurrent(operation)) return;

      setSensitive({
        ...emptySensitive(operation.owner, operation.epoch),
        setup: result,
      });
    } catch (e) {
      if (operationCurrent(operation)) {
        setError(
          e instanceof Error ? e.message : 'Cannot start 2FA.',
        );
      }
    } finally {
      finishOperation();
    }
  }

  async function enable() {
    if (mfaStatus !== 'disabled' || !setup) return;

    const otp = code.trim();

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Enter a valid 6-digit code.');
      return;
    }

    const operation = startOperation();

    if (!operation) return;

    try {
      const token = await getToken();

      if (!operationCurrent(operation)) return;

      if (!token) throw new Error('Sign in again.');

      const result = await authApi.mfaEnable(token, otp);

      if (operation.epoch !== sessionGeneration()) return;

      if (viewCurrent(operation)) {
        setSensitive(null);
      }

      const newEpoch = await replaceSession(result);

      if (
        !viewCurrent(operation) ||
        newEpoch !== sessionGeneration()
      ) return;

      setSensitive({
        ...emptySensitive(operation.owner, newEpoch),
        recoveryCodes: result.recoveryCodes,
      });

      setRemaining(result.recoveryCodes.length);
      setMfaStatus('enabled');
    } catch (e) {
      if (operationCurrent(operation)) {
        setError(
          e instanceof Error ? e.message : 'Cannot enable 2FA.',
        );
      }
    } finally {
      finishOperation();
    }
  }

  async function regenerateRecoveryCodes() {
    if (
      mfaStatus !== 'enabled' ||
      recoveryCodes.length > 0
    ) return;

    const otp = recoveryTotp.trim();

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Enter the current 6-digit code.');
      return;
    }

    const operation = startOperation();

    if (!operation) return;

    try {
      const token = await getToken();

      if (!operationCurrent(operation)) return;

      if (!token) throw new Error('Sign in again.');

      const result =
        await authApi.mfaRegenerateRecoveryCodes(token, otp);

      if (!operationCurrent(operation)) return;

      setSensitive({
        ...emptySensitive(operation.owner, operation.epoch),
        recoveryCodes: result.recoveryCodes,
      });

      setRemaining(result.recoveryCodesRemaining);
    } catch (e) {
      if (operationCurrent(operation)) {
        setError(
          e instanceof Error
            ? e.message
            : 'Could not confirm recovery code rotation.',
        );
      }
    } finally {
      finishOperation();
    }
  }

  async function disable() {
    if (
      mfaStatus !== 'enabled' ||
      recoveryCodes.length > 0
    ) return;

    const otp = code.trim();

    if (
      !/^[0-9]{6}$/.test(otp) &&
      !/^[0-9a-f]{8}-[0-9a-f]{8}$/i.test(otp)
    ) {
      setError('Enter a valid verification code.');
      return;
    }

    const operation = startOperation();

    if (!operation) return;

    try {
      const token = await getToken();

      if (!operationCurrent(operation)) return;

      if (!token) throw new Error('Sign in again.');

      const result = await authApi.mfaDisable(token, otp);

      if (operation.epoch !== sessionGeneration()) return;

      if (viewCurrent(operation)) {
        setSensitive(null);
      }

      const newEpoch = await replaceSession(result);

      if (
        !viewCurrent(operation) ||
        newEpoch !== sessionGeneration()
      ) return;

      setMfaStatus('disabled');
      setRemaining(0);

      if (AppState.currentState === 'active') {
        Alert.alert(
          tr10("Two-factor authentication disabled"),
          t12("Your account no longer requires an authenticator code."),
        );
      }
    } catch (e) {
      if (operationCurrent(operation)) {
        setError(
          e instanceof Error ? e.message : 'Cannot disable 2FA.',
        );
      }
    } finally {
      finishOperation();
    }
  }



  if (!user) return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.text}>{tr10("Sign in to manage account security.")}</Text>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')}><Text style={styles.link}>{tr10("Sign in")}</Text></Pressable>
    </SafeAreaView>
  );
  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>

        {focused && foreground ? (
          <>
        <Text style={styles.title}>{tr10("Two-factor authentication")}</Text>
        <Text style={styles.text}>{tr10("Status:")} {mfaStatus === 'enabled'
            ? tr10("Enabled")
            : mfaStatus === 'disabled'
              ? tr10("Not enabled")
              : mfaStatus === 'loading'
                ? tr10("Checking...")
                : tr10("Unavailable")}
        </Text>

        {mfaStatus === 'loading' ? (
          <ActivityIndicator
            accessibilityLabel={t12("Checking two-factor authentication status")}
          />
        ) : null}

        {mfaStatus === 'error' ? (
          <View style={styles.card}>
            <Text style={styles.error}>{tr10("Could not verify 2FA status.")} {statusError}
            </Text>

            <Text style={styles.text}>{t12("Enable and disable controls are unavailable until the server responds.")}</Text>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={[
                styles.button,
                { opacity: busy ? 0.6 : 1 }
              ]}
              onPress={() => {
                setMfaStatus('loading');
                setStatusError('');
                setStatusReload(value => value + 1);
              }}
            >
              <Text style={styles.buttonText}>{tr10("Retry security status")} </Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.text}>{t12("Use Google Authenticator, Microsoft Authenticator, or another TOTP-compatible app.")}</Text>
        {recoveryCodes.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.heading}>{tr10("Save your recovery codes now")}</Text>
            <Text style={styles.text}>{t12("Each code works only once. They will not be shown again. Keep them outside TED in a safe place. Leaving this page will hide these codes permanently. If needed, generate a new set using your Authenticator.")}</Text>
            {recoveryCodes.map(c => <Text selectable key={c} style={styles.recovery}>{c}</Text>)}
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => setRecoveryCodes([])}><Text style={styles.buttonText}>{tr10("I saved these codes")}</Text></Pressable>
          </View>
        ) : null}
        {mfaStatus === 'disabled' && !setup && (
          <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}} style={styles.button} disabled={busy} onPress={() => { void beginSetup(); }}>
            <Text style={styles.buttonText}>{busy ? tr10("Loading...") : tr10("Enable two-factor authentication")}</Text>
          </Pressable>
        )}
        {mfaStatus === 'disabled' && setup && (
          <View style={styles.card}>
            <Text style={styles.heading}>{t12("1. Add TED to your Authenticator")}</Text>
            <View style={styles.qr}><QRCode value={setup.uri} size={205} /></View>
            <Text style={styles.text}>{t12("Scan this QR code on another device, or manually add the key below if Authenticator is on this phone.")}</Text>
            <Text selectable style={styles.secret}>{setup.secret}</Text>
            <Text style={styles.heading}>{t12("2. Enter the current 6-digit code")}</Text>
            <AccessibleInput labelKey="6-digit authenticator code" style={styles.input} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" />
            <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}} disabled={busy} style={styles.button} onPress={() => { void enable(); }}><Text style={styles.buttonText}>{tr10("Confirm & enable")}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}} disabled={busy} onPress={() => { setSetup(null); setCode(''); }}><Text style={styles.link}>{tr10("Cancel setup")}</Text></Pressable>
          </View>
        )}
        {mfaStatus === 'enabled' && recoveryCodes.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.heading}>{tr10("Recovery codes")}</Text>
            <Text style={styles.text}>{tr10("Unused recovery codes:")} {remaining}
            </Text>
            <Text style={styles.text}>{t12("Lost your recovery codes? Generate 8 new ones. All previous codes will stop working immediately. Have a safe place ready to save the new codes.")}</Text>
            <TextInput
              style={styles.input}
              value={recoveryTotp}
              onChangeText={setRecoveryTotp}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="off"
              placeholder={t12("Current 6-digit Authenticator code")}
              accessibilityLabel={t12("Authenticator code for new recovery codes")}
            />
            <Pressable
              accessibilityRole="button"
              disabled={busy || !/^[0-9]{6}$/.test(recoveryTotp.trim())}
              style={[
                styles.button,
                { opacity: busy || !/^[0-9]{6}$/.test(recoveryTotp.trim()) ? 0.5 : 1 }
              ]}
              onPress={() => Alert.alert(
                tr10("Replace all recovery codes?"),
                t12("Every existing recovery code will become invalid. Continue only if you can save the new codes."),
                [
                  { text: tr10("Cancel"), style: 'cancel' },
                  {
                    text: tr10("Replace codes"),
                    style: 'destructive',
                    onPress: () => { void regenerateRecoveryCodes(); }
                  }
                ]
              )}
            >
              <Text style={styles.buttonText}>{tr10("Generate new recovery codes")} </Text>
            </Pressable>
          </View>
        )}
        {mfaStatus === 'enabled' && recoveryCodes.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.text}>{tr10("Unused recovery codes:")} {remaining}</Text>
            <Text style={styles.heading}>{tr10("Disable 2FA")}</Text>
            <Text style={styles.text}>{t12("Enter the current Authenticator code or a recovery code. Disabling 2FA reduces account security.")}</Text>
            <AccessibleInput labelKey="Authenticator or recovery code" style={styles.input} value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} placeholder={tr10("Authenticator or recovery code")} />
            <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}} disabled={busy} style={[styles.button, { backgroundColor: C.error }]} onPress={() => {
              Alert.alert(tr10("Disable two-factor authentication?"), tr10("Your next sign-in will no longer need an Authenticator code."), [
                { text: tr10("Cancel"), style: 'cancel' },
                { text: tr10("Disable"), style: 'destructive', onPress: () => { void disable(); } },
              ]);
            }}><Text style={styles.buttonText}>{tr10("Disable 2FA")}</Text></Pressable>
          </View>
        )}
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.text}>{t12("Authenticator information is temporarily hidden.")}</Text>
          </View>
        )}


        {error ? <Text style={styles.error}>{t12(error)}</Text> : null}
        {busy ? <ActivityIndicator style={{ marginTop: 14 }} /> : null}


      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.surface },
  content: { padding: 22, paddingBottom: 70 },
  title: { fontSize: 27, fontWeight: '700', color: C.primaryText, marginBottom: 15 },
  heading: { fontSize: 17, fontWeight: '700', color: C.primaryText, marginTop: 14, marginBottom: 12 },
  text: { fontSize: 14, lineHeight: 22, color: C.secondaryText, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 20 },
  qr: { alignItems: 'center', backgroundColor: '#fff', padding: 20, marginVertical: 12 },
  secret: { fontSize: 16, fontWeight: '700', color: C.darkBlue, letterSpacing: 1, marginBottom: 20 },
  recovery: { fontSize: 17, fontWeight: '700', marginBottom: 8, color: C.primaryText },
  input: { borderWidth: 1, borderRadius: 12, borderColor: C.border, padding: 14, fontSize: 16, color: C.primaryText },
  button: { backgroundColor: C.darkBlue, padding: 16, marginTop: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { textAlign: 'center', color: C.darkBlue, marginTop: 16 },
  error: { color: C.error, marginTop: 14 },
});
