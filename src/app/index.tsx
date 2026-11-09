import { Redirect } from 'expo-router';
import { ActivityIndicator,View } from 'react-native';
import { useSession } from '../contexts/SessionContext';

export default function Index(){
  const {user,loading}=useSession();

  if(loading) return <View style={{
    flex:1,alignItems:'center',justifyContent:'center'
  }}><ActivityIndicator/></View>;

  if(!user) return <Redirect href="/welcome"/>;

  return <Redirect href={(user.onboardingCompletedAt
    ? '/(tabs)/home'
    : user.onboardingStep>=3
      ? '/(setup)/security'
      : user.onboardingStep===2
        ? '/(setup)/preferences'
        : '/(setup)/your-name') as never}/>;
}
