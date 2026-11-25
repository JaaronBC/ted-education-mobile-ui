import { AccessibleInput } from '@/components/ui/AccessibleInput';
import { useLanguage as useLocale12 , useLanguage as useLocale10 , useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Redirect,useRouter } from 'expo-router';
import { AppText as Text } from '../../components/ui/AppText';
import { SetupShell } from '../../components/SetupShell';
import { useSession } from '../../contexts/SessionContext';

export default function SetupProfile(){
  const { t: t12 } = useLocale12();

  const { tr: tr10 } = useLocale10();

  const router=useRouter();
  const {user,updateAccountProfile}=useSession();
  const {t}=useLanguage();

  const [name,setName]=useState(
    user?.fullName==='Google User'?'':user?.fullName??''
  );
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  if(!user)return <Redirect href="/(auth)/login"/>;

  const next=async()=>{
    if(name.trim().length<2){
      setError('Name must contain at least 2 characters.');
      return;
    }

    setBusy(true);
    setError('');

    try{
      await updateAccountProfile({
        fullName:name.trim(),
        onboardingStep:2
      });

      router.replace('/(setup)/preferences' as never);
    }catch(e){
      setError(e instanceof Error?e.message:'Unable to save');
    }finally{
      setBusy(false);
    }
  };

  return <SetupShell step={1}
    title={tr10("Your name")}
    subtitle="Tell us what to call you. Your name is the only required profile detail."
    busy={busy}
    onContinue={()=>{void next();}}
    onBack={()=>router.replace('/welcome')}>

    <Text style={s.label}>{t('Full name')} *</Text>

    <AccessibleInput labelKey="Full name"
      value={name}
      onChangeText={setName}
      autoCapitalize="words"
      autoComplete="name"
      maxLength={120}
      placeholder={t('Enter your full name')}
      style={s.input}
    />

    {error?<Text style={s.error}>{t12(error)}</Text>:null}
  </SetupShell>;
}

const s=StyleSheet.create({
  label:{
    fontSize:15,fontWeight:'700',
    color:'#1F2933',marginBottom:10
  },
  input:{
    borderWidth:1,borderColor:'#B7C5D0',
    borderRadius:12,minHeight:54,
    paddingHorizontal:14,backgroundColor:'#fff',
    fontSize:17
  },
  error:{color:'#C12B1D',marginTop:9}
});
