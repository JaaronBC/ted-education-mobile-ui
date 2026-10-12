import { Text, View, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearnCard from '../../components/LearnCard';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LearnScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center">
        <View className="w-full max-w-[430px] flex-1 overflow-hidden bg-white">
          <SafeAreaView className="flex-1">
            <ScrollView>
              <View className="items-start px-7 pt-3">
                <View className="w-full flex-row items-center justify-between px-4">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    onPress={() => router.back()}
                    className="mt-3 self-start"
                >
                    <Text
                        className="text-left flex-1 text-[30px] leading-[25px]"
                        style={{
                            fontFamily: 'Georgia',
                            fontWeight: '500',
                            color: '#1F2933',
                        }}
                    >
                     ˂
                    </Text>
                </Pressable>
                <Text
                    className="flex-1 text-center text-[30px]"
                    style={{
                        fontFamily: 'Georgia',
                        fontWeight: '500',
                        color: '#1F2933',
                    }}
                >
                 Learn
                </Text>
                <MaterialCommunityIcons
                    name= "magnify"
                    size= {30}
                    color= '#1F2933'
                />
                </View>
                <LearnCard
                    thumbnail={require('../../../assets/images/what-is-ted-image.jpg')}
                    name="What is TED?"
                    accessibilityLabel="What is TED?"
                    description="Helpful information about TED."
                    link="/(tabs)/learn"
                />
                <LearnCard
                    thumbnail={require('../../../assets/images/common-symptoms-image.jpg')}
                    name="Common Symptoms of TED"
                    accessibilityLabel="Common Symptoms of TED"
                    description="Learn about the common symptoms of TED."
                    link="/(tabs)/learn"
                />
                <LearnCard
                    thumbnail={require('../../../assets/images/active-vs-inactive-image.jpg')}
                    name="Active vs. Inactive TED"
                    accessibilityLabel="Active vs. Inactive TED"
                    description="Learn about the difference between active and inactive TED."
                    link="/(tabs)/learn"
                />
                <LearnCard
                    thumbnail={require('../../../assets/images/risk-factors-image.jpg')}
                    name="TED Risk Factors"
                    accessibilityLabel="TED Risk Factors"
                    description="Learn about the risk factors associated with TED."
                    link="/(tabs)/learn"
                />
                <LearnCard
                    thumbnail={require('../../../assets/images/lifestyle-considerations-image.jpg')}
                    name="TED Lifestyle Considerations"
                    accessibilityLabel="TED Lifestyle Considerations"
                    description="Learn about the lifestyle factors that may influence TED."
                    link="/(tabs)/learn"
                />
                <LearnCard
                    thumbnail={require('../../../assets/images/patient-resources-image.jpg')}
                    name="TED Patient Resources"
                    accessibilityLabel="TED Patient Resources"
                    description="Look at resources available for TED patients."
                    link="/(tabs)/learn"
                />
                <LearnCard
                    thumbnail={require('../../../assets/images/support-groups-image.jpg')}
                    name="TED Support Groups"
                    accessibilityLabel="TED Support Groups"
                    description="Find support groups for TED patients."
                    link="/(tabs)/learn"
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}