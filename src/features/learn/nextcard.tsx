import { Pressable, Text, View, Image, ImageSourcePropType } from 'react-native';
import { router, Href } from 'expo-router';
import AppIcon from '@/components/ui/app-icon';
import { Articles } from '@/features/learn/data/Articles';

type NextCardProps = {
    thumbnail: ImageSourcePropType;
    accessibilityLabel: string;
    name: string;
    link: Href;
};

const NextCard = (props: NextCardProps) => {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.accessibilityLabel}
            className="-mt-4 min-h-[80px] w-[67%] flex-row items-center justify-center rounded-2xl active:opacity-80 border-[#D8E0E4] border-[1px] self-end"
            style={{
                backgroundColor: '#FFFFFF'
            }}
            onPress={() => router.push(props.link)}
        >
            <View className="w-full flex-row items-center justify-between px-2">
                <Image
                    style={{ width: 70, height: 70, borderRadius: 10 }}
                    source={props.thumbnail}
                />
                <View className="flex-col justify-center ml-5 flex-1">
                    <Text
                        numberOfLines={3}
                        adjustsFontSizeToFit
                        className="text-[15px] font-light"
                        style={{
                            fontFamily: 'Georgia',
                            fontWeight: '300',
                            color: '#1F2933',
                        }}
                    >
                        {props.name}
                    </Text>
                </View>
                <AppIcon
                    icon="arrow"
                    size={25}
                    color={'#17395D'}
                    strokeWidth={2}
                />
            </View>
        </Pressable>
    );
}

export default NextCard;
