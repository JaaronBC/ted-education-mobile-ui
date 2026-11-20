
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Image,
  Pressable, StyleSheet, View
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { AppText as Text } from '../ui/AppText';
import { useSession } from '../../contexts/SessionContext';
import { avatarApi } from '../../services/avatarApi';
import { theme } from '../../constants/theme';

const C = theme.colors;

export default function AvatarEditor() {
  const { user, getToken } = useSession();

  const [url, setUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;

    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const result = await avatarApi.get(token);
        if (active) setUrl(result.url);
      } catch {
        if (active) {
          setMessage('Photo unavailable. Check server storage configuration.');
        }
      }
    })();

    return () => { active = false; };
  }, [user?.id, getToken]));

  async function choose() {
    setMessage('');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (result.canceled || !result.assets[0]) return;

      const photo = result.assets[0];

      if (photo.fileSize && photo.fileSize > 3 * 1024 * 1024) {
        setMessage('Photo is too large (maximum 3 MB).');
        return;
      }

      setSelected(photo.uri);
    } catch {
      setMessage('Could not open image library.');
    }
  }

  async function save() {
    if (!selected || busy) return;

    setBusy(true);
    setMessage('');

    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again.');

      const result = await avatarApi.upload(token, selected);

      setUrl(result.url);
      setSelected(null);
      setMessage('Profile photo updated.');
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Upload failed. Original photo kept.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;

    setBusy(true);
    setMessage('');

    try {
      const token = await getToken();
      if (!token) throw Error('Sign in again.');

      await avatarApi.remove(token);

      setSelected(null);
      setUrl(null);
      setMessage('Profile photo removed.');
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Could not remove photo.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.avatar}>
        {selected || url ? (
          <Image
            source={{ uri: selected || url || undefined }}
            style={styles.photo}
            accessibilityLabel="Profile photo"
          />
        ) : (
          <Text style={styles.placeholder}>Profile photo</Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        style={styles.action}
        onPress={() => { void choose(); }}
      >
        <Text style={styles.actionText}>Choose photo</Text>
      </Pressable>

      {selected ? (
        <View style={styles.actions}>
          <Pressable
            disabled={busy}
            style={styles.action}
            onPress={() => { void save(); }}
          >
            <Text style={styles.actionText}>Save photo</Text>
          </Pressable>

          <Pressable
            disabled={busy}
            style={styles.action}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.actionText}>Cancel preview</Text>
          </Pressable>
        </View>
      ) : null}

      {!selected && url ? (
        <Pressable
          disabled={busy}
          style={styles.action}
          onPress={() => Alert.alert(
            'Remove profile photo?',
            'Your default avatar will be restored.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => { void remove(); }
              }
            ]
          )}
        >
          <Text style={styles.remove}>Remove photo</Text>
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
