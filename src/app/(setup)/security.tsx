import { useState } from 'react';
import { Redirect,useRouter } from 'expo-router';
import {
  Pressable,View,StyleSheet
} from 'react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { SetupShell } from '../../components/SetupShell';
import { useSession } from '../../contexts/SessionContext';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SetupSecurity(){
  const router=useRouter();
  const {user,updateAccountProfile}=useSession();
  const {t}=useLanguage();

  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  if(!user)return <Redirect href="/(auth)/login"/>;

  const finish=async()=>{
    setBusy(true);

    try{
      await updateAccountProfile({
        completeOnboarding:true
      });

      router.replace('/(tabs)/home');
    }catch(e){
      setError(e instanceof Error?e.message:'Unable to finish');
    }finally{
      setBusy(false);
    }
  };

  return <SetupShell step={3}
    title="Protect your account"
    subtitle="Authenticator 2FA is optional. You can enable it now or later."
    action="Finish"
    busy={busy}
    onContinue={()=>{void finish();}}
    onSkip={()=>{void finish();}}
    onBack={()=>router.replace('/(setup)/preferences' as never)}>

    <View style={s.card}>
      <Text style={s.label}>{t('Authenticator 2FA')}</Text>

      <Text style={s.note}>
        Use an authenticator app to generate
        a 6-digit code when signing in.
      </Text>

      <Pressable style={s.action}
        onPress={()=>router.push('/profile/security')}>
        <Text style={s.actionText}>
          {t('Set up Authenticator')}
        </Text>
      </Pressable>
    </View>

    <Text style={s.note}>
      Return to this step after binding Authenticator,
      then complete setup.
    </Text>

    {error?<Text style={s.error}>{error}</Text>:null}
  </SetupShell>;
}

const s=StyleSheet.create({
  card:{
    backgroundColor:'#fff',borderWidth:1,
    borderColor:'#CEDAE2',borderRadius:18,padding:20
  },
  label:{
    color:'#24466b',fontWeight:'700',fontSize:18
  },
  note:{
    color:'#5F6B73',lineHeight:23,
    fontSize:14,marginTop:12
  },
  action:{
    backgroundColor:'#EAF2F5',
    borderRadius:12,padding:14,marginTop:18
  },
  actionText:{
    textAlign:'center',color:'#3F6F86',
    fontWeight:'700'
  },
  error:{color:'#C12B1D'}
});
