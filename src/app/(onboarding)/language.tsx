import { router } from 'expo-router';
import { Pressable,ScrollView,StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../../components/ui/AppText';
import { LANGUAGES,useLanguage } from '../../i18n/LanguageContext';

export default function LanguageScreen(){
  const {language,setLanguage,t}=useLanguage();

  return <SafeAreaView style={s.page}>
    <ScrollView contentContainerStyle={s.content}>
      <Pressable onPress={()=>router.back()} style={s.back}>
        <Text style={s.link}>‹ {t('Back')}</Text>
      </Pressable>

      <Text style={s.title}>{t('Choose Your Language')}</Text>
      <Text style={s.subtitle}>
        {t('You can change this later in Settings.')}
      </Text>

      {LANGUAGES.map(l=>
        <Pressable key={l.code}
          accessibilityRole="radio"
          accessibilityState={{checked:l.code===language}}
          onPress={()=>{void setLanguage(l.code);}}
          style={[s.choice,l.code===language&&s.selected]}>
          <Text style={s.choiceText}>{l.name}</Text>
          {l.code===language?<Text style={s.check}>✓</Text>:null}
        </Pressable>
      )}

      <Pressable style={s.button}
        onPress={()=>router.replace('/welcome')}>
        <Text style={s.buttonText}>{t('Continue')}</Text>
      </Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#fff'},
  content:{padding:26,paddingBottom:50},
  back:{marginVertical:15},
  link:{fontSize:19,color:'#3F6F86'},
  title:{
    fontFamily:'Georgia',fontSize:35,lineHeight:46,
    color:'#24466B',textAlign:'center',marginTop:22
  },
  subtitle:{
    fontSize:16,lineHeight:24,color:'#657D99',
    textAlign:'center',marginVertical:24
  },
  choice:{
    minHeight:64,borderWidth:1.5,borderColor:'#96A5B4',
    marginBottom:12,borderRadius:14,paddingHorizontal:20,
    flexDirection:'row',alignItems:'center',
    justifyContent:'space-between'
  },
  selected:{backgroundColor:'#EAF2F5',borderColor:'#3F6F86'},
  choiceText:{fontSize:25,color:'#1F2933'},
  check:{color:'#3F6F86',fontSize:23},
  button:{
    backgroundColor:'#3F6F86',minHeight:56,
    borderRadius:28,justifyContent:'center',
    alignItems:'center',marginTop:22
  },
  buttonText:{color:'#fff',fontSize:18,fontWeight:'700'}
});
