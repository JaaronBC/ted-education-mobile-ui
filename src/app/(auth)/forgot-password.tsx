import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, KeyRound } from 'lucide-react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { theme } from '../../constants/theme';
const C=theme.colors;
export default function ForgotPasswordScreen() {
  const router=useRouter();
  const {fontScale}=useAccessibility();
  const [email,setEmail]=useState('');
  const [error,setError]=useState('');
  const submit=()=>{
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {setError('Enter a valid email address.');return;}
    setError('');
    Alert.alert('Password reset unavailable','The backend password reset service is not available. No email has been sent.');
  };
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable style={styles.back} accessibilityRole="button" accessibilityLabel="Back" onPress={()=>router.back()}><ArrowLeft size={24} color={C.darkBlue}/></Pressable>
    <View style={styles.symbol}><KeyRound size={30} color={C.darkBlue}/></View>
    <Text style={styles.title}>Reset password</Text><Text style={styles.subtitle}>Enter the email address for your TED account.</Text>
    <View style={styles.card}><Text style={styles.label}>Email address</Text><TextInput style={[styles.input,{fontSize:15*fontScale}]} value={email} onChangeText={(v)=>{setEmail(v);setError('');}} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="name@example.com" placeholderTextColor="#80909E" accessibilityLabel="Email address"/>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" style={styles.button} onPress={submit}><Text style={styles.buttonText}>Send reset instructions</Text></Pressable></View>
    <Text style={styles.note}>Password reset is not yet connected. No emails or account changes will occur.</Text>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:C.surface},content:{padding:24,paddingBottom:48},back:{width:48,height:48,justifyContent:'center'},symbol:{marginTop:25,width:70,height:70,borderRadius:20,backgroundColor:C.lightBlue,justifyContent:'center',alignItems:'center'},title:{fontFamily:'Georgia',fontSize:30,color:C.primaryText,marginTop:22,fontWeight:'600'},subtitle:{fontSize:14,lineHeight:22,color:C.secondaryText,marginTop:8,marginBottom:22},card:{padding:20,borderWidth:1,borderColor:C.border,borderRadius:18,backgroundColor:'#FFFFFF'},label:{fontSize:14,color:C.primaryText,fontWeight:'700',marginBottom:10},input:{minHeight:52,borderRadius:12,borderWidth:1,borderColor:C.border,paddingHorizontal:14,color:C.primaryText},error:{color:C.error,marginTop:10,fontSize:12},button:{backgroundColor:C.darkBlue,minHeight:52,borderRadius:12,justifyContent:'center',alignItems:'center',marginTop:22},buttonText:{color:'#FFFFFF',fontSize:15,fontWeight:'700'},note:{marginTop:22,textAlign:'center',color:C.secondaryText,fontSize:12,lineHeight:19}});
