import { Tabs } from "expo-router";
import React from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Layout() {
  return (
    <React.Fragment>
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#618FA7" }} >
            <Tabs.Screen 
              name="home" 
              options={{
                title: "Home",
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
                title: "Learn",
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
                title: "Track",
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
                title: "My Health",
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
                title: "Profile",
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons 
                    name="account"
                    size={24}
                    color={color}
                  />
                )
              }}
            />
            <Tabs.Screen 
              name="HomeFeatureCard" 
              options={{
                tabBarStyle: { display: 'none' },
              }}
            />
        </Tabs>    
    </React.Fragment>
  );
}