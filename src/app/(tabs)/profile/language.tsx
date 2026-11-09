import { useState } from 'react';
import {
  Alert,Pressable,ScrollView,StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../../../components/ui/AppText';
import { LANGUAGES,useLanguage } from '../../../i18n/LanguageContext';

export default function LanguageSettingsScreen(){
  const {language,setLanguage,t}=useLanguage();
  const [busy,setBusy]=useState(false);

  return <SafeAreaView edges={['bottom']} style={s.page}>
    <ScrollView contentContainerStyle={s.body}>
      <Text style={s.desc}>
        {t('You can change this later in Settings.')}
      </Text>

      {LANGUAGES.map(l=>
        <Pressable key={l.code}
          accessibilityRole="radio"
          accessibilityState={{
            checked:language===l.code
          }}
          style={[
            s.option,
            language===l.code&&s.selected
          ]}
          disabled={busy}
          onPress={async()=>{
            setBusy(true);
            try{
              await setLanguage(l.code);
            }catch{
              Alert.alert(
                'Error',
                'Could not sync language to your account.'
              );
            }finally{
              setBusy(false);
            }
          }}>
          <Text style={s.label}>{l.name}</Text>
          <Text style={s.tick}>
            {language===l.code?'✓':''}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#F7FAFC'},
  body:{padding:22,paddingBottom:50},
  desc:{
    fontSize:14,color:'#718096',marginBottom:22
  },
  option:{
    padding:18,borderWidth:1,borderColor:'#C7D4DC',
    borderRadius:14,backgroundColor:'#fff',
    marginBottom:12,flexDirection:'row',
    alignItems:'center',justifyContent:'space-between'
  },
  selected:{
    backgroundColor:'#EAF2F5',
    borderColor:'#3F6F86'
  },
  label:{fontSize:19,color:'#263746'},
  tick:{fontSize:20,color:'#3F6F86'}
});
