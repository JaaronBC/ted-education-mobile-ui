import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] =
  useState<'en' | 'zh' | 'jp' | 'kr' | 'es' | null>(null);
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
                  accessibilityLabel="English"
                  onPress={() => setSelectedLanguage('en')}
                  className="mt-8 h-[60px] w-[100%] flex-row items-center justify-center rounded-xl bg-[white] active:opacity-80 border-2 border-gray-400"
                  style={{
                    backgroundColor: selectedLanguage === 'en' ? '#618FA7' : 'white',
                  }}>
                      
                  <Text className="text-[30px] font-light text-white"                  
                    style={{
                      fontFamily: 'Georgia',
                      fontWeight: '300',
                      color: '#0d0e0e',
                    }}>
                    English
                  </Text>
            </Pressable>      

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={() => setSelectedLanguage('zh')}
                className="mt-2 h-[60px] w-[100%] flex-row items-center justify-center rounded-xl bg-[white] active:opacity-80 border-2 border-gray-400"
                  style={{
                    backgroundColor: selectedLanguage === 'zh' ? '#618FA7' : 'white',
                  }}>
                  <Text className="text-[30px] font-light text-white"                  
                    style={{
                      fontFamily: 'Georgia',
                      fontWeight: '300',
                      color: '#0d0e0e',
                    }}>
                    中文
                  </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={() => setSelectedLanguage('jp')}
                className="mt-2 h-[60px] w-[100%] flex-row items-center justify-center rounded-xl bg-[white] active:opacity-80 border-2 border-gray-400"
                  style={{
                    backgroundColor: selectedLanguage === 'jp' ? '#618FA7' : 'white',
                  }}>
                  <Text className="text-[30px] font-light text-white"                  
                    style={{
                      fontFamily: 'Georgia',
                      fontWeight: '300',
                      color: '#0d0e0e',
                    }}>
                    日本語
                  </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={() => setSelectedLanguage('kr')}
                className="mt-2 h-[60px] w-[100%] flex-row items-center justify-center rounded-xl bg-[white] active:opacity-80 border-2 border-gray-400"
                  style={{
                    backgroundColor: selectedLanguage === 'kr' ? '#618FA7' : 'white',
                  }}>
                  <Text className="text-[30px] font-light text-white"                  
                    style={{
                      fontFamily: 'Georgia',
                      fontWeight: '300',
                      color: '#0d0e0e',
                    }}>
                    한국어
                  </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={() => setSelectedLanguage('es')}
                className="mt-2 h-[60px] w-[100%] flex-row items-center justify-center rounded-xl bg-[white] active:opacity-80 border-2 border-gray-400"
                  style={{
                    backgroundColor: selectedLanguage === 'es' ? '#618FA7' : 'white',
                  }}>
                  <Text className="text-[30px] font-light text-white"                  
                    style={{
                      fontFamily: 'Georgia',
                      fontWeight: '300',
                      color: '#0d0e0e',
                    }}>
                    Español
                  </Text>
            </Pressable>
            <Pressable
                  onPress={() => router.push('/home')}
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                  className="mt-12 h-[60px] w-[100%] flex-row items-center justify-center rounded-full bg-[#d5ba8c] active:opacity-80"
                >
                  <Text className="text-[20px] font-semibold text-white">
                    Continue
                  </Text>
              </Pressable>
            </View>
        </SafeAreaView>
        </View>
      </View>
    </View>
  );
}