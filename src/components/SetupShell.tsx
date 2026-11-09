import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,View,Pressable,StyleSheet
} from 'react-native';
import { AppText as Text } from './ui/AppText';
import { useLanguage } from '../i18n/LanguageContext';

export function SetupShell({
  step,title,subtitle,children,onBack,
  onContinue,onSkip,busy=false,action='Continue'
}:{
  step:1|2|3;
  title:string;
  subtitle:string;
  children:ReactNode;
  onBack?:()=>void;
  onContinue:()=>void;
  onSkip?:()=>void;
  busy?:boolean;
  action?:string;
}){
  const {t}=useLanguage();

  return <SafeAreaView style={s.page}>
    <ScrollView keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.content}>

      <Text style={s.count}>{t('Step '+step+' of 3')}</Text>

      <View style={s.progress}>
        {[1,2,3].map(i=>
          <View key={i} style={[s.bar,i<=step&&s.active]}/>
        )}
      </View>

      <Text style={s.title}>{t(title)}</Text>
      <Text style={s.subtitle}>{t(subtitle)}</Text>

      {children}

      <Pressable disabled={busy} onPress={onContinue}
        style={s.button}>
        <Text style={s.buttonText}>
          {busy?'...':t(action)}
        </Text>
      </Pressable>

      <View style={s.footer}>
        {onBack?
          <Pressable onPress={onBack}>
            <Text style={s.secondary}>{t('Back')}</Text>
          </Pressable>:<View/>}

        {onSkip?
          <Pressable onPress={onSkip}>
            <Text style={s.secondary}>{t('Skip for now')}</Text>
          </Pressable>:<View/>}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#F7F9FB'},
  content:{flexGrow:1,padding:24,paddingTop:36},
  count:{fontSize:13,color:'#617994'},
  progress:{
    flexDirection:'row',gap:7,
    marginTop:15,marginBottom:36
  },
  bar:{
    flex:1,height:5,backgroundColor:'#D9E1E7',borderRadius:5
  },
  active:{backgroundColor:'#3F6F86'},
  title:{
    fontFamily:'Georgia',fontWeight:'600',
    fontSize:30,color:'#24466b'
  },
  subtitle:{
    fontSize:15,color:'#5F6B73',
    lineHeight:23,marginTop:12,marginBottom:25
  },
  button:{
    minHeight:55,backgroundColor:'#3F6F86',
    borderRadius:16,alignItems:'center',
    justifyContent:'center',marginTop:30
  },
  buttonText:{color:'#fff',fontSize:17,fontWeight:'700'},
  footer:{
    flexDirection:'row',justifyContent:'space-between',
    alignItems:'center',minHeight:55
  },
  secondary:{color:'#3F6F86',fontSize:15,fontWeight:'600'}
});
