import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { View, ScrollView } from 'react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeFeatureCard from '../../components/HomeFeatureCard';

export default function HomeScreen() {
  const { tr: tr10 } = useLocale10();

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
              >{tr10("Welcome")} </Text>
              <Text className="text-left text-[18px] leading-[25px] text-[#618FA7]"
                style={{
                  fontFamily: 'Georgia',
                  fontWeight: '200',
                }}
              >{tr10("Learn. Track. Organize. Understand.")} {'\n'}{tr10("Take control of your eye health.")} </Text>
              <HomeFeatureCard
                icon="HomeLearn"
                name="Learn"
                accessibilityLabel={tr10("Learn")}
                description="Helpful education & resources to guide you in understanding TED."
                link="/(tabs)/learn"
              />
              <HomeFeatureCard
                icon="HomeTrack"
                name="Track"
                accessibilityLabel={tr10("Track")}
                description="Track symptoms, CAS assessments and photos."
                link="/(tabs)/track"
              />
              <HomeFeatureCard
                icon="HomeHealth"
                name="My Health"
                accessibilityLabel={tr10("My Health")}
                description="Organize labs, medications, imaging, treatment history, and health records."
                link="/(tabs)/health"
              />
              <HomeFeatureCard
                icon="HomeShare"
                name="Share With My Doctor"
                accessibilityLabel={tr10("Share With My Doctor")}
                description="Prepare health information to share with your doctor."
                link="/share"
              />
              <HomeFeatureCard
                icon="Treatment"
                name="Treatment"
                accessibilityLabel={tr10("Treatment")}
                description="Find treatments and other guidance for TED."
                link="/treatment"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  </View>
);
}
