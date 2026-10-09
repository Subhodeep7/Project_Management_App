import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Text, View } from 'react-native'

import { AuthProvider, useAuth } from './src/context/AuthContext'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import ProjectsScreen from './src/screens/ProjectsScreen'
import ProjectDetailScreen from './src/screens/ProjectDetailScreen'
import TasksScreen from './src/screens/TasksScreen'
import { colors } from './src/utils/helpers'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function TabIcon({ name, focused }) {
  const icons = {
    Dashboard: focused ? '▣' : '□',
    Projects:  focused ? '▦' : '▢',
    Tasks:     focused ? '☑' : '☐',
  }
  return (
    <Text style={{ fontSize: 18, color: focused ? colors.primary : colors.textMuted }}>
      {icons[name] || '●'}
    </Text>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600', fontSize: 15 },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Projects" component={ProjectsStack} options={{ headerShown: false, title: 'Projects' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
    </Tab.Navigator>
  )
}

function ProjectsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600', fontSize: 15 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} options={{ title: 'Projects' }} />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={({ route }) => ({ title: route.params?.projectName || 'Project' })}
      />
    </Stack.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function RootNavigator() {
  const { user, loading, tokenExpired } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>P</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
