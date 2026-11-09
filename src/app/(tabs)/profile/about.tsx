import { AppText } from "../../../components/ui/AppText";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye } from "lucide-react-native";

export default function AboutScreen() {
  return (
    <SafeAreaView
      edges={["bottom"]}
      className="flex-1 bg-[#F7FAFC]"
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        <View className="items-center py-6">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-[#EEF4F7]">
            <Eye size={44} color="#618FA7" />
          </View>

          <AppText className="mt-5 text-center text-[22px] font-bold text-[#263746]">
            TED Education App
          </AppText>

          <AppText className="mt-2 text-center text-[14px] text-[#718096]">
            Thyroid Eye Disease Education
          </AppText>

          <View className="mt-4 rounded-full bg-[#EEF4F7] px-4 py-2">
            <AppText className="text-[12px] font-semibold text-[#618FA7]">
              TED EDUCATION
            </AppText>
          </View>
        </View>

        <AppText className="mb-3 mt-5 text-[12px] font-semibold tracking-widest text-[#718096]">
          ABOUT THIS APP
        </AppText>

        <View className="rounded-2xl bg-white p-5">
          <AppText className="text-[15px] leading-6 text-[#526478]">
            TED Education App is a patient-focused
            application being developed to support
            education about Thyroid Eye Disease.

            The project also aims to help patients
            organize information about symptoms,
            treatments, and their health history.
          </AppText>
        </View>

        <AppText className="mb-3 mt-7 text-[12px] font-semibold tracking-widest text-[#718096]">
          MEDICAL DISCLAIMER
        </AppText>

        <View className="rounded-2xl bg-white p-5">
          <AppText className="text-[14px] leading-6 text-[#526478]">
            This application is intended for
            educational purposes and does not
            replace professional medical advice,
            diagnosis, or treatment.

            Always consult a qualified healthcare
            professional regarding medical concerns.
          </AppText>
        </View>

        <AppText className="mt-7 text-center text-[12px] text-[#94A3B8]">
          For education, not clinical diagnosis
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}