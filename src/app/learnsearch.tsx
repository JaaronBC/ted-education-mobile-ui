import '../../global.css';
import { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearnCard from '@/features/learn/learncard';
import { router } from 'expo-router';
import AppIcon from '@/components/ui/app-icon';
import { Articles } from '@/features/learn/data/Articles';

export default function LearnSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const words = submittedQuery.toLowerCase().split(" ").filter(Boolean);
  const matching = Articles.filter((article) => words.every((word) => [article.name, article.description].join(' ').toLowerCase().split(" ").some((wordbeg) => wordbeg.startsWith(word))));
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center">
        <View className="w-full max-w-[430px] flex-1 overflow-hidden bg-white">
          <SafeAreaView className="flex-1">
            <ScrollView>
              <View className="items-center px-7 pt-3">
                <View className="w-full flex-row items-center">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    onPress={() => router.back()}
                    className="h-10 w-8 items-center justify-center"
                  >
                    <AppIcon
                      icon='back'
                      color='#1F2933'
                      size={30}
                      strokeWidth={2}
                    />
                  </Pressable>
                  <TextInput
                    placeholder="Press Enter To Search"
                    placeholderTextColor='#1F2933'
                    clearButtonMode="always"
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      if (text === '') {
                        setSubmittedQuery("");
                      }
                    }}
                    onSubmitEditing={() => setSubmittedQuery(searchQuery.toLowerCase())}
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: 'black',
                    }}
                  />
                </View>
                <View className="w-full flex-row">
                  <View className="w-11" />
                  <View className="flex-1">
                    {submittedQuery.length > 0 && (
                      words.length > 0 && matching.length > 0
                        ? matching.map((article) => (
                          <LearnCard
                            key={article.key}
                            thumbnail={article.thumbnail}
                            name={article.name}
                            accessibilityLabel={article.accessibilityLabel}
                            description={article.description}
                            link={article.link}
                          />
                        )) : (
                          <View className="mt-2 items-center justify-center">
                            <Text
                              className="text-center text-[25px] font-medium"
                              style={{
                                color: 'red'
                              }}
                            >
                              No Results Found
                            </Text>
                          </View>
                        ))}
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}