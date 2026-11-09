import { AppText } from "../../components/ui/AppText";
import { StyleSheet, Text, View } from 'react-native';

export default function ResetPasswordScreen() {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Reset Password</AppText>
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