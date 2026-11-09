import { Tabs } from "expo-router";
import React from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Layout() {
  const {t}=useLanguage();
  return (
    <React.Fragment>
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#618FA7" }} >
            <Tabs.Screen 
              name="home" 
              options={{
                title: t('Home'),
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons 
                    name="home"
                    size={24}
                    color={color}
                  />
                )
              }}
            />
            <Tabs.Screen 
              name="learn" 
              options={{
                title: t('Learn'),
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons 
                    name="book-open"
                    size={24}
                    color={color}
                  />
                )
              }}
            />
            <Tabs.Screen 
              name="track"
              options={{
                title: t('Track'),
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons 
                    name="chart-bar"
                    size={24}
                    color={color}
                  />
                )
              }}
            />
            <Tabs.Screen 
              name="health" 
              options={{
                title: t('My Health'),
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons 
                    name="heart"
                    size={24}
                    color={color}
                  />
                )
              }}
            />
            <Tabs.Screen 
              name="profile" 
              options={{
                title: t('Profile'),
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons 
                    name="account"
                    size={24}
                    color={color}
                  />
                )
              }}
            />
        </Tabs>    
    </React.Fragment>
  );
}
