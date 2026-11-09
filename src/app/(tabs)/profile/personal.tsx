import { useState } from 'react';
import {
  Alert,Pressable,ScrollView,
  StyleSheet,TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { AppText as Text } from '../../../components/ui/AppText';
import { useSession } from '../../../contexts/SessionContext';
import { useLanguage } from '../../../i18n/LanguageContext';
import { theme } from '../../../constants/theme';

const C=theme.colors;

const genders=[
  {value:'MALE',label:'Male'},
  {value:'FEMALE',label:'Female'},
  {value:'PREFER_NOT_TO_SAY',label:'Prefer not to say'}
] as const;

export default function PersonalInformationScreen(){
  const {user}=useSession();
  if (!user) return <Redirect href="/(auth)/login"/>;
  return <PersonalInformationForm key={user.id} user={user}/>;
}

function PersonalInformationForm({user}: {
  user: NonNullable<ReturnType<typeof useSession>['user']>;
}) {
  const {updateAccountProfile}=useSession();
  const {t}=useLanguage();

  const [name,setName]=useState(user?.fullName||'');
  const [gender,setGender]=useState<
    'MALE'|'FEMALE'|'PREFER_NOT_TO_SAY'|null
  >(user?.gender??null);

  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);


  const save=async()=>{
    if(name.trim().length<2){
      setError('Full name is required.');
      return;
    }

    setBusy(true);
    setError('');

    try{
      await updateAccountProfile({
        fullName:name.trim(),
        ...(gender?{gender}:{})
      });

      Alert.alert(t('Save'),'Your profile has been updated.');
    }catch(e){
      setError(e instanceof Error?e.message:'Save failed');
    }finally{
      setBusy(false);
    }
  };

  return <SafeAreaView edges={['bottom']} style={s.page}>
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.heading}>
        {t('Personal Information')}
      </Text>

      <Text style={s.label}>{t('Full name')} *</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        autoComplete="name"
        autoCapitalize="words"
        maxLength={120}
        style={s.input}
      />

      <Text style={s.label}>
        {t('Gender')} ({t('Optional')})
      </Text>

      {genders.map(g=>
        <Pressable key={g.value}
          style={[
            s.option,
            gender===g.value&&s.active
          ]}
          onPress={()=>setGender(g.value)}>
          <Text style={s.optionText}>{t(g.label)}</Text>
          <Text>{gender===g.value?'✓':''}</Text>
        </Pressable>
      )}

      {error?<Text style={s.error}>{error}</Text>:null}

      <Pressable disabled={busy}
        onPress={()=>{void save();}}
        style={s.button}>
        <Text style={s.buttonText}>
          {busy?'...':t('Save changes')}
        </Text>
      </Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:C.surface},
  content:{padding:22,paddingBottom:55},
  heading:{
    fontSize:27,fontWeight:'700',
    color:C.primaryText,marginBottom:20
  },
  label:{
    fontSize:15,fontWeight:'700',
    color:C.primaryText,marginTop:18,marginBottom:9
  },
  input:{
    borderWidth:1,borderColor:C.border,
    backgroundColor:'#fff',borderRadius:12,
    minHeight:54,paddingHorizontal:14,fontSize:17
  },
  option:{
    minHeight:51,paddingHorizontal:15,
    borderWidth:1,borderColor:C.border,
    borderRadius:12,marginBottom:8,
    flexDirection:'row',alignItems:'center',
    justifyContent:'space-between',
    backgroundColor:'#fff'
  },
  active:{
    backgroundColor:C.lightBlue,borderColor:C.darkBlue
  },
  optionText:{color:C.primaryText,fontSize:15},
  button:{
    minHeight:53,backgroundColor:C.darkBlue,
    borderRadius:13,alignItems:'center',
    justifyContent:'center',marginTop:24
  },
  buttonText:{
    color:'#fff',fontSize:16,fontWeight:'700'
  },
  error:{color:C.error,marginTop:12}
});
