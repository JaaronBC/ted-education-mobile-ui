import { Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeFeatureCard from '../../components/HomeFeatureCard';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center">
        <View className="w-full max-w-[430px] flex-1 overflow-hidden bg-white">
          <SafeAreaView className="flex-1">
            <ScrollView>
              <View className="items-start px-7 pt-3">
                <Text className="mt-10 text-center text-[39px] leading-[50px] text-[#17395D]"
                  style={{
                    fontFamily: 'Georgia',
                    fontWeight: '500',
                  }}
                >
                  Welcome
                </Text>
                <Text className="text-left text-[18px] leading-[25px] text-[#618FA7]"
                  style={{
                    fontFamily: 'Georgia',
                    fontWeight: '200',
                  }}
                >
                  Learn. Track. Organize. Understand. {'\n'}Take control of your eye health.
                </Text>
                <HomeFeatureCard
                  iconname="book"
                  name="Learn"
                  accessibilityLabel="Learn"
                  description="Helpful education & resources to guide you in understanding TED."
                  link="/(tabs)/learn"
                />
                <HomeFeatureCard
                  iconname="chart-bar"
                  name="Track"
                  accessibilityLabel="Track"
                  description="Track symptoms, CAS assessments and photos."
                  link="/(tabs)/track"
                />
                <HomeFeatureCard
                  iconname="clipboard-plus"
                  name="My Health"
                  accessibilityLabel="My Health"
                  description="Organize labs, medications, imaging, treatment history, and health records."
                  link="/(tabs)/health"
                />
                <HomeFeatureCard
                  iconname="pill"
                  name="Treatment"
                  accessibilityLabel="Treatment"
                  description="Find available TED treatment options."
                  link="/treatment"
                />
                <HomeFeatureCard
                  iconname="share-variant"
                  name="Share With My Doctor"
                  accessibilityLabel="Share With My Doctor"
                  description="Prepare health information to share with your doctor."
                  link="/share"
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}