import { Pressable, Text, View } from 'react-native';
import { router, Href } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type HomeFeatureCardProps ={
    iconname: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    accessibilityLabel: string;
    name: string;
    description: string;
    link: Href;
};

const HomeFeatureCard = (props: HomeFeatureCardProps) => {
    return(
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.accessibilityLabel}
            className=" mt-2 min-h-[100px] w-[100%] py-5 flex-row items-center justify-center rounded-2xl active:opacity-80"
            style={{
                backgroundColor: '#D8E0E4' 
                  }}
                  onPress={() => router.push(props.link)}
                >
                  <View className="w-full flex-row items-center justify-between px-4">
                    <MaterialCommunityIcons 
                      name={props.iconname}
                      size={24}
                      color={'#3F6F86'}
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

export default HomeFeatureCard;