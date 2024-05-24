import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import MainNavigator from "./Navigation/Navigator";
import { AuthUserProvider } from "./Navigation/Navigator";

export default function App() {
  return (
    <AuthUserProvider>
      <MainNavigator />
    </AuthUserProvider>
  );
}
