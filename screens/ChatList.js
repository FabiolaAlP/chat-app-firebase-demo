// screens/ChatList.js
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
} from "react-native";
import { database, authInstance } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { colors } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";

const ChatList = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [newChatUser, setNewChatUser] = useState("");

  const signOutHandler = () => {
    signOut(authInstance).catch((error) => console.log(error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AntDesign
          name="logout"
          size={24}
          color={colors.primary}
          onPress={signOutHandler}
          style={{ marginRight: 15 }}
        />
      ),
      headerLeft: () => (
        <View style={styles.headerIcon}>
          <Text style={styles.iconText}>
            {getUserInitials(authInstance.currentUser.email)}
          </Text>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!authInstance.currentUser) return;

    const collectionRef = collection(database, "chats");
    const q = query(
      collectionRef,
      where("users", "array-contains", authInstance.currentUser.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [authInstance.currentUser]);

  const createChat = async () => {
    if (!newChatUser) return;

    const currentUser = authInstance.currentUser.email;
    const newChat = {
      users: [currentUser, newChatUser],
      createdAt: new Date(),
      lastMessage: {
        text: "Chat created",
        createdAt: new Date(),
        user: {
          _id: currentUser,
          name: currentUser,
        },
      },
      userNames: {
        [currentUser]: currentUser,
        [newChatUser]: newChatUser,
      },
    };

    await addDoc(collection(database, "chats"), newChat);
    setNewChatUser("");
  };

  const getUserInitials = (name) => {
    if (!name) return "";
    const initials = name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
    return initials;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat List</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser = item.users.find(
            (user) => user !== authInstance.currentUser.email
          );
          const otherUserName = item.userNames
            ? item.userNames[otherUser]
            : `Chat with ${otherUser}`;

          return (
            <View style={styles.chatItem}>
              <View style={styles.icon}>
                <Text style={styles.iconText}>
                  {getUserInitials(otherUser)}
                </Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{otherUserName}</Text>
                <TouchableOpacity
                  style={styles.openChatButton}
                  onPress={() =>
                    navigation.navigate("ChatScreen", { chatId: item.id })
                  }
                >
                  <Text>Open Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyMessage}>No chats available</Text>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter user email to chat"
        value={newChatUser}
        onChangeText={setNewChatUser}
      />
      <TouchableOpacity style={styles.chatButton} onPress={createChat}>
        <Text style={styles.chatButtonText}>Create Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  iconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chatButton: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  openChatButton: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});

export default ChatList;
