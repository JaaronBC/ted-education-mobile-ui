import { AppText } from "../../../components/ui/AppText";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Download, Trash2 } from "lucide-react-native";

export default function DataManagementScreen() {
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
          Manage your account data and learn about
          available data controls.
        </AppText>

        <AppText className="mb-3 mt-7 text-[12px] font-semibold tracking-widest text-[#718096]">
          YOUR DATA
        </AppText>

        <View className="overflow-hidden rounded-2xl bg-white">
          <View className="flex-row items-center p-5">
            <Download size={25} color="#94A3B8" />

            <View className="ml-4 flex-1">
              <AppText className="text-[16px] font-semibold text-[#263746]">
                Export My Data
              </AppText>

              <AppText className="mt-1 text-[13px] leading-5 text-[#718096]">
                Download a copy of your information.
              </AppText>

              <AppText className="mt-2 text-[12px] font-medium text-[#94A3B8]">
                Not available yet
              </AppText>
            </View>
          </View>

          <View className="mx-5 h-px bg-[#E8EDF2]" />

          <View className="flex-row items-center p-5">
            <Trash2 size={25} color="#94A3B8" />

            <View className="ml-4 flex-1">
              <AppText className="text-[16px] font-semibold text-[#263746]">
                Delete My Data
              </AppText>

              <AppText className="mt-1 text-[13px] leading-5 text-[#718096]">
                Request removal of account information.
              </AppText>

              <AppText className="mt-2 text-[12px] font-medium text-[#94A3B8]">
                Not available yet
              </AppText>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-2xl border border-[#D8E2EA] bg-white p-5">
          <AppText className="text-[15px] font-semibold text-[#263746]">
            Development Status
          </AppText>

          <AppText className="mt-2 text-[13px] leading-5 text-[#718096]">
            Data export and deletion services have not
            been connected to this page.

            These options are informational placeholders
            and do not perform any data operations.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}