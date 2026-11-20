
import { useCallback, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { UserRound } from 'lucide-react-native';

import { useSession } from '../../contexts/SessionContext';
import { avatarApi } from '../../services/avatarApi';
import { theme } from '../../constants/theme';

const C = theme.colors;

export default function ProfileAvatarThumb({ userId }: { userId?: string }) {
  const { getToken } = useSession();
  const [url, setUrl] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let alive = true;
    setUrl(null);

    if (userId) {
      void (async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const result = await avatarApi.get(token);
          if (alive) setUrl(result.url);
        } catch {
          if (alive) setUrl(null);
        }
      })();
    }

    return () => { alive = false; };
  }, [userId, getToken]));

  return (
    <View style={styles.avatar}>
      {url ? (
        <Image
          source={{ uri: url }}
          style={styles.photo}
          onError={() => setUrl(null)}
        />
      ) : (
        <UserRound size={34} color={C.darkBlue} strokeWidth={1.8} />
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
    overflow: 'hidden'
  },
  photo: {
    width: '100%',
    height: '100%'
  }
});
