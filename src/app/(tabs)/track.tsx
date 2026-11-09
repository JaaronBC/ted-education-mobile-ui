import { AppText } from "../../components/ui/AppText";
import { Text, View } from 'react-native';

export default function TrackScreen() {
    return(
        <View className="flex-1 bg-white items-center justify-center">
            <AppText className="mt-3 text-center text-[13px] font-medium tracking-[5px] text-[#58708C]">
                track
            </AppText>
        </View>
    );
}