import { AppText } from "../../../components/ui/AppText";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyScreen() {
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
        <AppText className="text-[15px] leading-6 text-[#718096]">
          Information about privacy and the handling
          of your personal and health-related data.
        </AppText>

        <AppText className="mb-3 mt-7 text-[12px] font-semibold tracking-widest text-[#718096]">
          PRIVACY POLICY
        </AppText>

        <View className="rounded-2xl bg-white p-5">
          <AppText className="text-[17px] font-semibold text-[#263746]">
            Privacy Policy Pending
          </AppText>

          <AppText className="mt-3 text-[14px] leading-6 text-[#718096]">
            The complete privacy policy has not yet
            been published in this development build.

            Data collection, storage, sharing,
            retention, and deletion practices must
            be reviewed before public release.
          </AppText>
        </View>

        <AppText className="mb-3 mt-7 text-[12px] font-semibold tracking-widest text-[#718096]">
          DEVELOPMENT NOTICE
        </AppText>

        <View className="rounded-2xl border border-[#D8E2EA] bg-white p-5">
          <AppText className="text-[15px] font-semibold text-[#263746]">
            Protecting Patient Information
          </AppText>

          <AppText className="mt-3 text-[14px] leading-6 text-[#718096]">
            Do not enter real patient-identifying or
            sensitive health information into a
            development environment unless the
            project team has formally approved
            its security and data-handling controls.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}