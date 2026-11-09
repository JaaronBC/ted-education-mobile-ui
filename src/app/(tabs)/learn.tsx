import { Text, View, ScrollView } from 'react-native';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearnCard from '@/features/learn/learncard';
import MainCard from '@/features/learn/maincard';
import AppIcon from '@/components/ui/app-icon';
import { Articles } from '@/features/learn/data/Articles';

export default function LearnScreen() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="flex-1 items-center">
                <View className="w-full max-w-[430px] flex-1 overflow-hidden bg-white">
                    <SafeAreaView className="flex-1">
                        <ScrollView>
                            <View className="items-center px-7 pt-3">
                                <View className="w-full flex-row items-center justify-between">
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Back"
                                        onPress={() => router.back()}
                                        className="h-10 w-10 items-center justify-center"
                                    >
                                        <AppIcon
                                            icon='back'
                                            color='#17395D'
                                            size={30}
                                            strokeWidth={2}
                                        />
                                    </Pressable>
                                    <Text
                                        className="flex-1 text-center text-[25px]"
                                        style={{
                                            fontFamily: 'Georgia',
                                            fontWeight: '400',
                                            color: '#17395D',
                                        }}
                                    >
                                        Learn
                                    </Text>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Search"
                                        onPress={() => router.push('/learnsearch')}
                                        className="h-10 w-10 items-center justify-center"
                                    >
                                        <AppIcon
                                            icon='search'
                                            size={25}
                                            color='#17395D'
                                            strokeWidth={2}
                                        />
                                    </Pressable>
                                </View>
                                <MainCard
                                    background={require('../../../assets/images/maincard-image.jpg')}
                                    name={"Understanding\nThyroid Eye Disease"}
                                    accessibilityLabel="Understanding Thyroid Eye Disease"
                                    link="/whatisted"
                                />
                                {Articles.map((article) => (
                                    <LearnCard
                                        key={article.key}
                                        thumbnail={article.thumbnail}
                                        name={article.name}
                                        accessibilityLabel={article.accessibilityLabel}
                                        description={article.description}
                                        link={article.link}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </View>
        </View>
    );
}