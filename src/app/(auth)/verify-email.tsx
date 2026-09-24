import { StyleSheet, Text, View } from 'react-native';

export default function VerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});