import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LanguageScreen() {
  return (
<View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 items-center">
        <View className="w-full max-w-[430px] flex-1 overflow-hidden bg-white">
          <SafeAreaView className="flex-1">
            <View className="items-center px-7 pt-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={() => router.back()}
                className="mt-3 self-start"
              >
              <Text
                className="text-left text-[25px] leading-[25px] text-[#17395D]"
                style={{
                  fontFamily: 'Georgia',
                  fontWeight: '400',
                  color: '#2e6a90',
                }}>
                ˂ Back
              </Text>
              </Pressable>
              <Text
                className="mt-10 text-center text-[39px] leading-[50px] text-[#17395D]"
                style={{
                  fontFamily: 'Georgia',
                  fontWeight: '500',
                }}>
                Choose Your Language
              </Text>

              <Text className="mt-5 text-center text-[17px] leading-7 text-[#617994]"
                  style={{
                  fontFamily: 'Georgia',
                  fontWeight: '300',
                }}>
                You can change this later {'\n'} in Settings.
              </Text>

        <Pressable
                accessibilityRole="button"
                accessibilityLabel="Get Started"
                className="mt-8 h-[60px] w-[82%] flex-row items-center justify-center rounded-xl bg-[#176EA5] active:opacity-80"
                style={{
                }}>

                <Text className="text-[30px] font-light text-white"                  
                  style={{
                    fontFamily: 'Georgia',
                    fontWeight: '300',
                  }}>
                  English
                </Text>
          </Pressable>      

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow h-[60px] w-[82%] rounded-full"
            style={{
            }}>
          </Pressable>

        </View>
      </SafeAreaView>
    </View>
  </View>
</View>
  );
}