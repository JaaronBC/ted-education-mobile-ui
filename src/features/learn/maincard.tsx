import { Pressable, Text, View, Image, ImageSourcePropType, ImageBackground, StyleSheet} from 'react-native';
import { router, Href } from 'expo-router';
import AppIcon from '@/components/ui/app-icon';

type MainCardProps ={
  background: ImageSourcePropType;
  accessibilityLabel: string;
  name: string;
  link: Href;
};

const MainCard = (props: MainCardProps) => {
  return(
      <Pressable
      
          accessibilityRole="button"
          accessibilityLabel={props.accessibilityLabel}
          className="relative overflow-hidden mt-2 min-h-[180px] w-[100%] flex-row items-center justify-center rounded-2xl active:opacity-80 border-[#D8E0E4] border-[1px]"
          
          style={{
              backgroundColor: '#FFFFFF' 
                }}
                onPress={() => router.push(props.link)}
              >
                <ImageBackground 
                    source={props.background}
                    resizeMode="stretch"
                    style={[StyleSheet.absoluteFill, {width: '100%', height: '100%', justifyContent: 'flex-end'}]}
                >
                <View className="absolute bottom-0 left-0 right-0 h-[100%] bg-[#3F6F86]/35" />
                <View className="w-full flex-row items-center justify-between px-2">
                  <View className="flex-col justify-center ml-5 flex-1"> 
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      className="text-[28px] mb-5"
                      style={{ 
                        fontFamily: 'Georgia',
                        fontWeight: '300',
                        color: '#F2FCFC',
                      }}
                    >
                      {props.name}
                    </Text>
                  </View>
                </View>
                <View className="absolute h-10 w-10 items-center justify-center rounded-full bg-white"
                    style={{right:15, bottom:15}}
                >
                    <AppIcon
                        icon="arrow"
                        size={25}
                        color={'#17395D'}
                        strokeWidth={2}
                    />
                </View>
                </ImageBackground>
              </Pressable>
  );
}

export default MainCard;

