import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getHealth } from '@/services/api';
import type { HealthResponse } from '@/services/api';

export default function HomeScreen() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkApi() {
      try {
        const result = await getHealth();
        setHealth(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to connect to API',
        );
      } finally {
        setLoading(false);
      }
    }

    checkApi();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TED Education App</Text>

        <Text style={styles.subtitle}>
          Thyroid Eye Disease Patient Education
        </Text>

        {loading && (
          <View style={styles.card}>
            <ActivityIndicator size="large" />
            <Text style={styles.message}>Connecting to API...</Text>
          </View>
        )}

        {health && (
          <View style={styles.card}>
            <Text style={styles.connected}>API Connected</Text>

            <Text style={styles.label}>
              Status:
              <Text style={styles.value}> {health.status}</Text>
            </Text>

            <Text style={styles.label}>
              Service:
              <Text style={styles.value}> {health.service}</Text>
            </Text>

            <Text style={styles.label}>
              Timestamp:
              <Text style={styles.value}> {health.timestamp}</Text>
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.card}>
            <Text style={styles.error}>API Connection Failed</Text>
            <Text style={styles.message}>{error}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    color: '#6B7280',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F6F6F4',
  },

  connected: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2E7D32',
  },

  error: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#B91C1C',
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },

  value: {
    fontWeight: '400',
  },

  message: {
    fontSize: 16,
    marginTop: 12,
    color: '#4B5563',
  },
});