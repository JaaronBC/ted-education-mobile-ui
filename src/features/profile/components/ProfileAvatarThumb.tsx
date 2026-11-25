import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useCallback, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { UserRound } from 'lucide-react-native';

import { useSession } from '../../../contexts/SessionContext';
import { avatarApi } from '../api/avatarApi';
import { sessionGeneration } from '../../../services/sessionTokens';
import { theme } from '../../../constants/theme';

const C = theme.colors;

export default function ProfileAvatarThumb({
  userId,
}: {
  userId?: string;
}) {
  const { user } = useSession();

  const epoch = sessionGeneration();

  return (
    <SessionAvatar
      key={(user?.id ?? 'anonymous') + ':' + epoch}
      enabled={Boolean(userId && user?.id === userId)}
      epoch={epoch}
    />
  );
}

function SessionAvatar({
  enabled,
  epoch,
}: {
  enabled: boolean;
  epoch: number;
}) {
  const { tr: tr10 } = useLocale10();

  const { getToken } = useSession();

  const [url, setUrl] =
    useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    let reading = false;

    function current() {
      return (
        active &&
        enabled &&
        epoch === sessionGeneration()
      );
    }

    async function loadAvatar() {
      if (!current() || reading) return;

      reading = true;

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
  }, [enabled, epoch, getToken]));

  return (
    <View style={styles.avatar}>
      {enabled && url ? (
        <Image
          source={{ uri: url }}
          style={styles.photo}
          cachePolicy="none"
          onError={() => {
            setUrl(current =>
              current === url ? null : current
            );
          }}
          accessibilityLabel={tr10("Profile photo")}
        />
      ) : (
        <UserRound
          size={34}
          color={C.darkBlue}
          strokeWidth={1.8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
