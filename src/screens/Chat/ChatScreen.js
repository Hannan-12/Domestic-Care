// src/screens/Chat/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TextInput, StyleSheet, 
  KeyboardAvoidingView, Platform, TouchableOpacity 
} from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore'; 
import { firestoreDB } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = ({ route, navigation }) => {
  // NEW: providerId is required to distinguish chat rooms
  const { requestId, chatTitle, providerId } = route.params; 
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 1. Real-time listener for specific provider's chat room
  useEffect(() => {
    if (!providerId) {
        console.error("ChatScreen: Missing providerId");
        return;
    }

    const messagesRef = collection(firestoreDB, 'serviceRequests', requestId, 'chats', providerId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
    });

    navigation.setOptions({ title: chatTitle || 'Chat' });

    return () => unsubscribe();
  }, [requestId, providerId]);

  // 2. Send Message to the specific provider's room
  const onSend = async () => {
    if (inputText.trim().length === 0) return;

    const messageData = {
      text: inputText,
      senderId: user.uid,
      senderEmail: user.email,
    };

    const targetColl = collection(firestoreDB, 'serviceRequests', requestId, 'chats', providerId, 'messages');

    try {
      await addDoc(targetColl, {
          ...messageData,
          createdAt: Timestamp.fromDate(new Date())
      });
      setInputText('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === user.uid;
    return (
      <View style={[styles.msgContainer, isMe ? styles.myMsg : styles.theirMsg]}>
        <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        inverted
        contentContainerStyle={styles.list}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
            <Ionicons name="send" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
  list: { padding: 16 },
  msgContainer: { maxWidth: '80%', padding: 12, borderRadius: 12, marginVertical: 4 },
  myMsg: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 2 },
  theirMsg: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  msgText: { fontSize: 16 },
  myMsgText: { color: '#fff' },
  theirMsgText: { color: '#000' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, fontSize: 16 },
});

export default ChatScreen;