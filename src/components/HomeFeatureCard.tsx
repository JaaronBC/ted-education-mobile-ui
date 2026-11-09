import { Pressable, Text, View } from 'react-native';
import { router, Href } from 'expo-router';
import AppIcon, { AppIconName } from './ui/app-icon';

type HomeFeatureCardProps ={
  icon: AppIconName;
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
                <AppIcon 
                  icon = {props.icon}
                  size={24}
                  color={'#3F6F86'}
                  strokeWidth={2}
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
                      numberOfLines={2}
                      adjustsFontSizeToFit
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

export default HomeFeatureCard;