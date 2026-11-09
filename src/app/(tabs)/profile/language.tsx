import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, ScrollView, View } from "react-native";
import { AppText as Text } from "../../../components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, CircleCheck } from "lucide-react-native";

type LanguageCode = "en" | "zh" | "ja";

const LANGUAGES: {
  code: LanguageCode;
  name: string;
  description: string;
}[] = [
  {
    code: "en",
    name: "English",
    description: "English",
  },
  {
    code: "zh",
    name: "简体中文",
    description: "Simplified Chinese",
  },
  {
    code: "ja",
    name: "日本語",
    description: "Japanese",
  },
];

export default function LanguageSettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>("en");

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("@ted/language/v1")
      .then((value) => {
        if (active && (value === "en" || value === "zh" || value === "ja")) setSelectedLanguage(value);
      })
      .catch((error: unknown) => console.warn("Language preference load failed", error));
    return () => { active = false; };
  }, []);

  const selectLanguage = (value: LanguageCode) => {
    setSelectedLanguage(value);
    AsyncStorage.setItem("@ted/language/v1", value)
      .catch((error: unknown) => console.warn("Language preference save failed", error));
  };

  const selected = LANGUAGES.find(
    (language) => language.code === selectedLanguage
  );

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="flex-1 bg-[#F7FAFC]"
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <Text className="text-[15px] leading-6 text-[#718096]">
          Choose your preferred language for the app.
        </Text>

        <Text className="mb-3 mt-7 text-[12px] font-semibold tracking-widest text-[#718096]">
          AVAILABLE LANGUAGES
        </Text>

        <View className="overflow-hidden rounded-2xl bg-white">
          {LANGUAGES.map((language, index) => {
            const isSelected =
              selectedLanguage === language.code;

            return (
              <View key={language.code}>
                <Pressable
                  onPress={() =>
                    selectLanguage(language.code)
                  }
                  accessibilityRole="radio"
                  accessibilityLabel={language.name}
                  accessibilityState={{
                    checked: isSelected,
                  }}
                  className="flex-row items-center px-5 py-5"
                >
                  <View className="flex-1">
                    <Text className="text-[16px] font-semibold text-[#263746]">
                      {language.name}
                    </Text>

                    <Text className="mt-1 text-[13px] text-[#718096]">
                      {language.description}
                    </Text>
                  </View>

                  {isSelected ? (
                    <CircleCheck size={25} color="#618FA7" />
                  ) : (
                    <Circle size={25} color="#94A3B8" />
                  )}
                </Pressable>

                {index < LANGUAGES.length - 1 ? (
                  <View className="mx-5 h-px bg-[#E8EDF2]" />
                ) : null}
              </View>
            );
          })}
        </View>

        <Text className="mt-6 text-[13px] leading-5 text-[#718096]">
          Saved preference: {selected?.name ?? "English"}. Interface translations will be enabled after the localization system is connected.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
