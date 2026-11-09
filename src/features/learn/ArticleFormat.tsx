import { Text, View, ScrollView } from 'react-native';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '@/components/ui/app-icon';
import { TextData } from '@/features/learn/data/ArticleText';
import NextCard from '@/features/learn/nextcard';
import { Articles } from './data/Articles';

type ArticleProps = {
    article: TextData;
};

export default function ArticleFormat({ article }: ArticleProps) {
    const nextkey = article.key + 1;
    const nextarticle = Articles.find((article) => article.key === nextkey);
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
                                </View>
                            </View>
                            <View className="w-full px-7 -mt-1">
                                <Text
                                    className="mb-5 text-center text-[25px]"
                                    style={{
                                        fontFamily: 'Georgia',
                                        fontWeight: '500',
                                        color: '#17395D',
                                        textDecorationLine: 'underline',
                                    }}
                                >
                                    {article.header}
                                </Text>
                                {article.paragraphs.map((paragraph, id) => (
                                    <Text
                                        key={id}
                                        className="flex-1 text-[18px] mb-5"
                                        style={{
                                            fontFamily: 'Georgia',
                                            fontWeight: '300',
                                            color: '#17395D',
                                        }}>
                                        {paragraph}
                                    </Text>
                                ))}
                                <View className="mb-5"></View>
                                {nextkey != 6 && nextarticle && (
                                    <NextCard
                                        key={nextarticle.key}
                                        thumbnail={nextarticle.thumbnail}
                                        name={nextarticle.name}
                                        accessibilityLabel={nextarticle.accessibilityLabel}
                                        link={nextarticle.link}
                                    />
                                )
                                }
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </View>
        </View>
    );
}