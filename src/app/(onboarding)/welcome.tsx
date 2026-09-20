import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/language');
  };

  return (
    <View className="flex-1 bg-[#DDEBF3]">
      <StatusBar style="dark" />

      <View className="flex-1 items-center">
        <View className="w-full max-w-[430px] flex-1 overflow-hidden bg-[#EAF3F8]">
          <SafeAreaView className="flex-1">
            <View className="items-center px-7 pt-3">
              <Image
                source={require('../../../assets/images/sponsor-logo.jpg')}
                resizeMode="contain"
                className="h-[155px] w-[280px]"
                accessibilityLabel="Oculofacial Plastic Surgery of Hawaii"
              />

              <Text className="mt-3 text-center text-[13px] font-medium tracking-[5px] text-[#58708C]">
                YOUR GUIDE TO
              </Text>

              <Text
                className="mt-3 text-center text-[47px] leading-[50px] text-[#17395D]"
                style={{
                  fontFamily: 'Georgia',
                  fontWeight: '600',
                }}
              >
                Thyroid Eye{'\n'}Disease
              </Text>

              <Text className="mt-5 text-center text-[17px] leading-7 text-[#617994]">
                Learn about TED, track changes,{'\n'}
                and prepare information for{'\n'}
                your care team.
              </Text>

              <Pressable
                onPress={handleGetStarted}
                accessibilityRole="button"
                accessibilityLabel="Get Started"
                className="mt-8 h-[60px] w-[82%] flex-row items-center justify-center rounded-full bg-[#176EA5] active:opacity-80"
              >
                <Text className="text-[20px] font-semibold text-white">
                  Get Started
                </Text>

                <Text className="ml-5 text-[30px] font-light text-white">
                  →
                </Text>
              </Pressable>
            </View>

            <View className="flex-1 justify-end">
              <ImageBackground
                source={require('../../../assets/images/welcome-hawaii.jpg')}
                resizeMode="cover"
                className="h-[270px] w-full"
              >
                <View className="absolute left-0 right-0 top-0 h-20 bg-[#EAF3F8]/40" />

                <View className="absolute bottom-0 left-0 right-0 h-32 bg-white/75" />

                <View className="flex-1 justify-end px-7 pb-5">
                  <View className="items-center">
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel="Privacy and Data"
                      hitSlop={12}
                    >
                      <Text className="text-[15px] font-semibold text-[#176EA5]">
                        Privacy &amp; Data
                      </Text>
                    </Pressable>

                    <Text className="mt-4 max-w-[340px] text-center text-[11px] leading-[17px] text-[#718399]">
                      This app is for educational purposes only.{'\n'}
                      It is not a substitute for professional medical advice,
                      diagnosis, or treatment.
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}