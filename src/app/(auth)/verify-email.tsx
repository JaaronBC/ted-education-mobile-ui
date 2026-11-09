import { AppText } from "../../components/ui/AppText";
import { StyleSheet, Text, View } from 'react-native';

export default function VerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Verify Email</AppText>
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