import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { AppState, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import '../../auth/services/googleSignIn';

import { useSession } from '../../../contexts/SessionContext';
import { sessionGeneration } from '../../../services/sessionTokens';

import {
  googleActionApi,
  type GoogleActionChallenge,
  type GoogleActionProof,
  type GoogleSensitiveAction,
} from '../api/googleActionApi';

type StoredChallenge = GoogleActionChallenge & {
  action: GoogleSensitiveAction;
  epoch: number;
  revision: number;
  resendAfter: number;
};

let googleRequestInProgress = false;

export function useGoogleActionChallenge(
  action: GoogleSensitiveAction | null,
  epoch: number,
) {
  const { getToken } = useSession();

  const [challenge, setChallenge] =
    useState<StoredChallenge | null>(null);

  const [emailCode, setEmailCodeState] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );

  const mounted = useRef(false);
  const focused = useRef(false);
  const revision = useRef({ value: 0 });
  const [visibleRevision, setVisibleRevision] = useState(0);
  const locked = useRef(false);

  const challengeRef = useRef<StoredChallenge | null>(null);
  const codeRef = useRef('');

  const clearCode = useCallback(() => {
    codeRef.current = '';
    setEmailCodeState('');
  }, []);

  const reset = useCallback(() => {
    revision.current.value++;
    setVisibleRevision(revision.current.value);

    challengeRef.current = null;

    setChallenge(null);
    clearCode();
    setError('');
  }, [clearCode]);

  useEffect(() => {
    const cleanupCounter = revision.current;

    mounted.current = true;

    return () => {
      mounted.current = false;
      focused.current = false;
      cleanupCounter.value++;

      challengeRef.current = null;
      codeRef.current = '';
    };
  }, []);

  useFocusEffect(useCallback(() => {
    focused.current = action !== null && epoch === sessionGeneration();
    reset();

    return () => {
      focused.current = false;
      reset();
    };
  }, [action, epoch, reset]));

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      state => {
        setForeground(state === 'active');

        if (state !== 'active') {
          clearCode();
        } else {
          setNow(Date.now());
        }
      },
    );

    return () => subscription.remove();
  }, [clearCode]);

  useEffect(() => {
    if (!challenge || !foreground) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge, foreground]);

  function current(operationRevision: number) {
    return (
      mounted.current &&
      focused.current &&
      epoch === sessionGeneration() &&
      revision.current.value === operationRevision
    );
  }

  const ownedChallenge =
    challenge &&
    challenge.action === action &&
    challenge.epoch === epoch &&
    challenge.revision === visibleRevision
      ? challenge
      : null;

  const remainingSeconds = ownedChallenge
    ? Math.max(
        0,
        Math.ceil(
          (Date.parse(ownedChallenge.expiresAt) - now) / 1000
        ),
      )
    : 0;

  const resendSeconds = ownedChallenge
    ? Math.max(
        0,
        Math.ceil(
          (ownedChallenge.resendAfter - now) / 1000,
        ),
      )
    : 0;

  function setEmailCode(value: string) {
    if (
      !focused.current ||
      !foreground ||
      locked.current ||
      epoch !== sessionGeneration() ||
      !ownedChallenge ||
      remainingSeconds <= 0
    ) return;

    const clean = value.replace(/[^0-9]/g, '').slice(0, 8);

    codeRef.current = clean;
    setEmailCodeState(clean);
  }

  async function requestCode() {
    if (
      !action ||
      locked.current ||
      !focused.current ||
      AppState.currentState !== 'active' ||
      epoch !== sessionGeneration()
    ) return;

    if (googleRequestInProgress) {
      setError('Another Google verification is in progress.');
      return;
    }

    if (
      Platform.OS !== 'android' &&
      Platform.OS !== 'ios'
    ) {
      setError('Google verification requires the mobile app.');
      return;
    }

    if (
      challengeRef.current &&
      challengeRef.current.resendAfter > Date.now()
    ) {
      return;
    }

    reset();

    const operationRevision = revision.current.value;

    locked.current = true;
    googleRequestInProgress = true;

    setBusy(true);

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      if (!current(operationRevision)) return;

      await GoogleSignin.signOut();

      if (!current(operationRevision)) return;

      const response = await GoogleSignin.signIn();

      if (!current(operationRevision)) return;

      if (!isSuccessResponse(response)) {
        return;
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        throw new Error(
          'Google did not return an ID token.',
        );
      }

      const token = await getToken();

      if (!current(operationRevision)) return;

      if (!token) {
        throw new Error('Sign in again.');
      }

      const result = await googleActionApi.request(
        token,
        action,
        idToken,
      );

      if (!current(operationRevision)) return;

      const expiresAt = Date.parse(result.expiresAt);

      if (
        typeof result.requestId !== 'string' ||
        !result.requestId ||
        !Number.isFinite(expiresAt) ||
        expiresAt <= Date.now()
      ) {
        throw new Error(
          'Verification request is invalid or expired.',
        );
      }

      const next: StoredChallenge = {
        ...result,
        action,
        epoch,
        revision: operationRevision,
        resendAfter: Date.now() + 60_000,
      };

      challengeRef.current = next;

      setChallenge(next);
      setNow(Date.now());

    } catch (err) {
      if (current(operationRevision)) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to request verification.',
        );
      }
    } finally {
      locked.current = false;
      googleRequestInProgress = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  }

  function getProof(
    mfaCode?: string,
  ): GoogleActionProof {
    const record = challengeRef.current;

    if (
      !record ||
      !current(record.revision) ||
      record.epoch !== epoch ||
      record.action !== action ||
      locked.current ||
      AppState.currentState !== 'active' ||
      Date.parse(record.expiresAt) <= Date.now()
    ) {
      throw new Error(
        'Request a new verification code.',
      );
    }

    const code = codeRef.current;

    if (!/^[0-9]{8}$/.test(code)) {
      throw new Error(
        'Enter the 8-digit email verification code.',
      );
    }

    const otp = mfaCode?.trim();

    if (otp && !/^[0-9]{6}$/.test(otp)) {
      throw new Error(
        'Enter a valid authenticator code.',
      );
    }

    return {
      requestId: record.requestId,
      emailCode: code,
      ...(otp ? { mfaCode: otp } : {}),
    };
  }

  const ready = Boolean(
    foreground &&
    ownedChallenge &&
    remainingSeconds > 0 &&
    /^[0-9]{8}$/.test(emailCode) &&
    !busy
  );

  return {
    challenge: ownedChallenge,
    emailCode,
    setEmailCode,
    requestCode,
    getProof,
    clearCode,
    reset,
    remainingSeconds,
    resendSeconds,
    foreground,
    ready,
    busy,
    error,
  };
}
