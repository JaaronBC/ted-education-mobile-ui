import { Pressable, Text, View, Image, ImageSourcePropType } from 'react-native';
import { router, Href } from 'expo-router';

type LearnCardProps ={
    thumbnail: ImageSourcePropType;
    accessibilityLabel: string;
    name: string;
    description: string;
    link: Href;
};

const LearnCard = (props: LearnCardProps) => {
    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.accessibilityLabel}
            className=" mt-2 min-h-[100px] w-[100%] py-2 flex-row items-center justify-center rounded-2xl active:opacity-80 border-[#D8E0E4] border-[2px]"
            style={{
                backgroundColor: '#FFFFFF' 
                  }}
                  onPress={() => router.push(props.link)}
                >
                  <View className="w-full flex-row items-center justify-between px-2">
                    <Image 
                      style={{ width: 100, height: 100, borderRadius: 10 }}
                      source = {props.thumbnail}
                    />
                    <View className="flex-col justify-center ml-5 flex-1">
                      <Text
                        className="text-[25px] font-light"
                        style={{ 
                          fontFamily: 'Georgia',
                          fontWeight: '300',
                          color: '#1F2933',
                        }}
                      >
                        {props.name}
                      </Text>
                      <Text
                        className="text-[16px] justify-center"
                        style={{
                          fontFamily: 'Georgia',
                          fontWeight: '200',
                          color: '#618FA7',
                        }}
                      >
                        {props.description}
                      </Text>
                    </View>
                    <Text className="text-[25px] text-[#17395D]">→</Text>
                  </View>
                </Pressable>
    );
}

export default LearnCard;