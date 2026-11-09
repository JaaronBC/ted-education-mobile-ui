import { router } from 'expo-router';
import {
  Image, ImageBackground, Pressable,
  ScrollView, StyleSheet, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../../components/ui/AppText';
import { useLanguage,LANGUAGES } from '../../i18n/LanguageContext';

export default function WelcomeScreen(){
  const {language,t}=useLanguage();

  return <SafeAreaView style={s.page}>
    <ScrollView contentContainerStyle={s.wrap}>
      <Pressable style={s.lang} onPress={()=>router.push('/language')}>
        <Text style={s.langText}>
          {LANGUAGES.find(x=>x.code===language)?.name} ▾
        </Text>
      </Pressable>

      <Image
        source={require('../../../assets/images/sponsor-logo.jpg')}
        resizeMode="contain" style={s.logo}
      />

      <Text style={s.eyebrow}>YOUR GUIDE TO</Text>
      <Text style={s.heading}>Thyroid Eye Disease</Text>

      <Text style={s.description}>
        Learn about TED, track changes, and prepare
        information for your care team.
      </Text>

      <Pressable style={s.primary}
        onPress={()=>router.push('/(auth)/register')}>
        <Text style={s.primaryText}>{t('Create Account')}</Text>
      </Pressable>

      <Pressable style={s.secondary}
        onPress={()=>router.push('/(auth)/login')}>
        <Text style={s.secondaryText}>{t('Sign In')}</Text>
      </Pressable>

      <Pressable style={s.guest}
        onPress={()=>router.replace('/(tabs)/home')}>
        <Text style={s.guestText}>{t('Explore as Guest')}</Text>
      </Pressable>

      <ImageBackground
        source={require('../../../assets/images/welcome-hawaii.jpg')}
        style={s.photo} resizeMode="cover">
        <View style={s.tint}>
          <Text style={s.disclaimer}>
            This app is for educational purposes only.
          </Text>
        </View>
      </ImageBackground>
    </ScrollView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#EAF3F8'},
  wrap:{flexGrow:1,alignItems:'center',paddingTop:10},
  lang:{alignSelf:'flex-end',padding:15,marginRight:18},
  langText:{color:'#3F6F86',fontSize:16,fontWeight:'600'},
  logo:{height:145,width:285,marginTop:5},
  eyebrow:{color:'#58708C',letterSpacing:4,fontSize:12,marginTop:8},
  heading:{
    fontFamily:'Georgia',fontSize:40,lineHeight:48,
    color:'#24466B',textAlign:'center',
    paddingHorizontal:26,marginTop:12,fontWeight:'600'
  },
  description:{
    textAlign:'center',color:'#617994',fontSize:16,
    lineHeight:25,marginHorizontal:40,
    marginTop:16,marginBottom:18
  },
  primary:{
    minHeight:54,borderRadius:30,backgroundColor:'#176EA5',
    width:'80%',alignItems:'center',
    justifyContent:'center',marginTop:10
  },
  primaryText:{color:'#fff',fontSize:18,fontWeight:'700'},
  secondary:{
    minHeight:54,borderRadius:30,borderWidth:1.5,
    borderColor:'#3F6F86',width:'80%',
    alignItems:'center',justifyContent:'center',marginTop:12
  },
  secondaryText:{color:'#3F6F86',fontSize:18,fontWeight:'700'},
  guest:{padding:14,marginBottom:18},
  guestText:{
    color:'#3F6F86',textDecorationLine:'underline',fontSize:14
  },
  photo:{
    height:170,width:'100%',marginTop:'auto',
    justifyContent:'flex-end'
  },
  tint:{backgroundColor:'rgba(255,255,255,0.84)',padding:12},
  disclaimer:{fontSize:12,color:'#5F6B73',textAlign:'center'}
});
