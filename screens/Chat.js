import { View, Text, StyleSheet } from "react-native";
//useLayoutEffect is used to reflect content before rendering
//useCallback for memoized functions to avoid re calculations
import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { authInstance, database } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../constants";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  const signOutHandler = () => {
    signOut(authInstance).catch((error) => console.log(error));
  };

  //display button on the top right of the screen for signOut
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
    });
  }, [navigation]);
  useLayoutEffect(() => {
    //this will run before the user can see it rendered
    const collectionRef = collection(database, "chats");
    //query chat collection in descending order
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    //onSnapshot will listen to changes in the collection
    //the structure of the messages data needs to match the format of the GiftedChat UI
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return unsubscribe;
  }, []);
  const onSendHandler = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    //get the first message in the array
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);
  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSendHandler(messages)}
        user={{
          _id: authInstance?.currentUser?.email,
          avatar: "https://i.pravatar.cc/250",
          name: authInstance?.currentUser?.email,
        }}
        messagesContainerStyle={{
          backgroundColor: "#fff",
        }}
        showUserAvatar={true}
        renderUsernameOnMessage={true}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
  },
});
export default Chat;
