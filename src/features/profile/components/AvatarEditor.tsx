import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, AppState,
  Pressable, StyleSheet, View
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { avatarApi } from '../api/avatarApi';
import { sessionGeneration } from '../../../services/sessionTokens';
import { theme } from '../../../constants/theme';

const C = theme.colors;

type SelectedPhoto = {
  uri: string;
  mimeType: string;
};

export default function AvatarEditor() {
  const { user } = useSession();

  if (!user) return null;

  const epoch = sessionGeneration();

  return (
    <AvatarEditorSession
      key={user.id + ':' + epoch}
      epoch={epoch}
    />
  );
}

function AvatarEditorSession({
  epoch,
}: {
  epoch: number;
}) {
  const { tr: tr10 } = useLocale10();

  const { getToken } = useSession();

  const [url, setUrl] =
    useState<string | null>(null);

  const [selected, setSelected] =
    useState<SelectedPhoto | null>(null);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const mounted = useRef(false);
  const locked = useRef(false);
  const revision = useRef({ value: 0 });

  useEffect(() => {
    const cleanupCounter = revision.current;

    mounted.current = true;

    return () => {
      mounted.current = false;
      cleanupCounter.value++;
    };
  }, []);

  function isCurrent() {
    return (
      mounted.current &&
      epoch === sessionGeneration()
    );
  }

  function assertCurrent() {
    if (!isCurrent()) {
      throw Error('Session changed.');
    }
  }

  function beginOperation() {
    if (!isCurrent() || locked.current) {
      return false;
    }

    locked.current = true;
    revision.current.value++;

    setBusy(true);
    setMessage('');

    return true;
  }

  function endOperation() {
    locked.current = false;

    if (isCurrent()) {
      setBusy(false);
    }
  }

  useFocusEffect(useCallback(() => {
    let active = true;
    let reading = false;

    async function loadAvatar() {
      if (
        !active ||
        reading ||
        locked.current ||
        epoch !== sessionGeneration()
      ) {
        return;
      }

      reading = true;
      const requestRevision = revision.current.value;

      function current() {
        return (
          active &&
          mounted.current &&
          epoch === sessionGeneration() &&
          requestRevision === revision.current.value
        );
      }

      try {
        const token = await getToken();

        if (!current() || !token) return;

        const result = await avatarApi.get(token);

        if (current()) {
          setUrl(result.url);
        }
      } catch {
        if (current()) {
          setUrl(null);
          setMessage('Profile photo unavailable.');
        }
      } finally {
        reading = false;
      }
    }

    void loadAvatar();

    const timer = setInterval(() => {
      void loadAvatar();
    }, 240000);

    const appStateSubscription =
      AppState.addEventListener(
        'change',
        state => {
          if (state === 'active') {
            void loadAvatar();
          }
        },
      );

    return () => {
      active = false;
      clearInterval(timer);
      appStateSubscription.remove();
    };
  }, [epoch, getToken]));

  async function choose() {
    if (!beginOperation()) return;

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      assertCurrent();

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const photo = result.assets[0];

      if (
        photo.fileSize !== undefined &&
        photo.fileSize > 3 * 1024 * 1024
      ) {
        setMessage('Photo exceeds 3 MB.');
        return;
      }

      const mimeType =
        photo.mimeType ?? 'image/jpeg';

      if (
        !['image/jpeg', 'image/png', 'image/webp']
          .includes(mimeType)
      ) {
        setMessage('Use JPEG, PNG or WebP.');
        return;
      }

      setSelected({
        uri: photo.uri,
        mimeType,
      });
    } catch {
      if (isCurrent()) {
        setMessage('Could not open image library.');
      }
    } finally {
      endOperation();
    }
  }

  async function save() {
    if (!selected || !beginOperation()) return;

    try {
      const token = await getToken();

      assertCurrent();

      if (!token) throw Error('Sign in again.');

      const result = await avatarApi.upload(
        token,
        selected.uri,
        selected.mimeType,
      );

      assertCurrent();

      setUrl(result.url);
      setSelected(null);
      setMessage('Profile photo updated.');
    } catch (error) {
      if (isCurrent()) {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Upload could not be confirmed.'
        );
      }
    } finally {
      endOperation();
    }
  }

  async function remove() {
    if (!beginOperation()) return;

    try {
      const token = await getToken();

      assertCurrent();

      if (!token) throw Error('Sign in again.');

      await avatarApi.remove(token);

      assertCurrent();

      setSelected(null);
      setUrl(null);
      setMessage('Profile photo removed.');
    } catch (error) {
      if (isCurrent()) {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Removal could not be confirmed.'
        );
      }
    } finally {
      endOperation();
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.avatar}>
        {selected || url ? (
          <Image
            source={{ uri: selected?.uri || url || undefined }}
            style={styles.photo}
            accessibilityLabel={tr10("Profile photo")}
            cachePolicy="none"
          />
        ) : (
          <Text style={styles.placeholder}>{tr10("Profile photo")}</Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        style={styles.action}
        onPress={() => { void choose(); }}
      >
        <Text style={styles.actionText}>{tr10("Choose photo")}</Text>
      </Pressable>

      {selected ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}}
            disabled={busy}
            style={styles.action}
            onPress={() => { void save(); }}
          >
            <Text style={styles.actionText}>{tr10("Save photo")}</Text>
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}}
            disabled={busy}
            style={styles.action}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.actionText}>{tr10("Cancel preview")}</Text>
          </Pressable>
        </View>
      ) : null}

      {!selected && url ? (
        <Pressable accessibilityRole="button" accessibilityState={{disabled: Boolean(busy)}}
          disabled={busy}
          style={styles.action}
          onPress={() => Alert.alert(
            tr10("Remove profile photo?"),
            'Your default avatar will be restored.',
            [
              { text: tr10("Cancel"), style: 'cancel' },
              {
                text: tr10("Remove"),
                style: 'destructive',
                onPress: () => { void remove(); }
              }
            ]
          )}
        >
          <Text style={styles.remove}>{tr10("Remove photo")}</Text>
        </Pressable>
      ) : null}

      {busy ? <ActivityIndicator /> : null}

      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 9,
    paddingVertical: 12
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    backgroundColor: C.lightBlue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    color: C.darkBlue,
    fontSize: 13
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  action: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: C.lightBlue
  },
  actionText: {
    color: C.darkBlue,
    fontWeight: '600'
  },
  remove: {
    color: C.error,
    fontWeight: '600'
  },
  message: {
    color: C.secondaryText,
    fontSize: 12,
    textAlign: 'center'
  }
});
