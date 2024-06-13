// screens/Chat.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { database, authInstance } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const ChatScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const collectionRef = collection(database, "chats", chatId, "messages");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesFirestore = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt.toDate(),
          user: data.user,
        };
      });
      setMessages(messagesFirestore);
    });

    return unsubscribe;
  }, [chatId]);

  const onSend = useCallback(
    async (messages = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      //get first message of the array
      const { _id, createdAt, text, user } = messages[0];
      const newMessage = {
        _id,
        text,
        createdAt,
        user,
      };
      await addDoc(
        collection(database, "chats", chatId, "messages"),
        newMessage
      );
    },
    [chatId]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            // _id: authInstance.currentUser.uid,
            _id: authInstance.currentUser.email,
            name: authInstance?.currentUser?.email || "Anonymous",
          }}
          messagesContainerStyle={{
            backgroundColor: "#fff",
          }}
          showUserAvatar={true}
        />
        {Platform.OS === "android" && (
          <KeyboardAvoidingView behavior="padding" />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
