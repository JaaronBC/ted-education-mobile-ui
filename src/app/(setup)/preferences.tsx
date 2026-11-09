import { useState } from 'react';
import { Redirect,useRouter } from 'expo-router';
import {
  Pressable,Switch,View,StyleSheet
} from 'react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { SetupShell } from '../../components/SetupShell';
import { useSession } from '../../contexts/SessionContext';
import { useLanguage,LANGUAGES } from '../../i18n/LanguageContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';

export default function SetupPreferences(){
  const router=useRouter();
  const {user,updateAccountProfile}=useSession();
  const {language,setLanguage,t}=useLanguage();
  const {
    fontScale,setFontScale,
    highContrast,setHighContrast
  }=useAccessibility();

  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  if(!user)return <Redirect href="/(auth)/login"/>;

  const next=async()=>{
    setBusy(true);

    try{
      await updateAccountProfile({
        preferredLanguage:language,
        fontScale,
        highContrast,
        onboardingStep:3
      });

      router.replace('/(setup)/security' as never);
    }catch(e){
      setError(e instanceof Error?e.message:'Unable to save');
    }finally{
      setBusy(false);
    }
  };

  return <SetupShell step={2}
    title="Make TED yours"
    subtitle="Choose your preferred language and reading settings."
    busy={busy}
    onContinue={()=>{void next();}}
    onSkip={()=>{void next();}}
    onBack={()=>router.replace('/(setup)/your-name' as never)}>

    <Text style={s.heading}>{t('Language')}</Text>

    <View style={s.languages}>
      {LANGUAGES.map(x=>
        <Pressable key={x.code}
          onPress={()=>{void setLanguage(x.code);}}
          style={[s.lang,x.code===language&&s.active]}
          accessibilityRole="radio"
          accessibilityState={{checked:x.code===language}}>
          <Text style={s.label}>{x.name}</Text>
          {x.code===language?
            <Text style={s.tick}>✓</Text>:null}
        </Pressable>
      )}
    </View>

    <Text style={s.heading}>{t('Text size')}</Text>

    <View style={s.row}>
      {[1,1.25,1.5].map(value=>
        <Pressable key={value}
          onPress={()=>setFontScale(value)}
          style={[
            s.scale,
            fontScale===value&&s.active
          ]}>
          <Text style={s.label}>
            {Math.round(value*100)}%
          </Text>
        </Pressable>
      )}
    </View>

    <View style={[s.row,{
      justifyContent:'space-between',marginTop:22
    }]}>
      <Text style={s.heading}>{t('High contrast')}</Text>
      <Switch value={highContrast}
        onValueChange={setHighContrast}/>
    </View>

    {error?<Text style={s.error}>{error}</Text>:null}
  </SetupShell>;
}

const s=StyleSheet.create({
  heading:{
    fontWeight:'700',color:'#24466b',
    fontSize:17,marginBottom:12
  },
  languages:{gap:8,marginBottom:25},
  lang:{
    borderColor:'#BDCAD4',borderWidth:1,
    borderRadius:12,padding:12,
    backgroundColor:'#fff',flexDirection:'row',
    justifyContent:'space-between'
  },
  active:{
    backgroundColor:'#EAF2F5',
    borderColor:'#3F6F86',borderWidth:2
  },
  label:{fontSize:16,color:'#1F2933'},
  tick:{color:'#3F6F86'},
  row:{
    flexDirection:'row',alignItems:'center',gap:9
  },
  scale:{
    padding:11,borderWidth:1,
    borderColor:'#BDCAD4',
    borderRadius:12,backgroundColor:'#fff'
  },
  error:{color:'#C12B1D'}
});
