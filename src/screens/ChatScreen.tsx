import React, { useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage, toggleReaction, setFeedback, ChatMessage } from '../store/chatSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatMessageItem from '../components/ChatMessageItem';
import ChatInput from '../components/ChatInput';

export default function ChatScreen() {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: Date.now(),
      type: 'text',
      ...(replyingTo ? { replyTo: replyingTo.id } : {}),
    };

    dispatch(addMessage(newMessage));
    setReplyingTo(null);
    setActiveReactionMessageId(null);
  };

  const handleReact = (id: string, emoji: string) => {
    dispatch(toggleReaction({ id, emoji }));
    setActiveReactionMessageId(null);
  };

  const handleFeedback = (id: string, type: 'liked' | 'disliked') => {
    dispatch(setFeedback({ id, type }));
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const replyMessage = item.replyTo ? messages.find((m) => m.id === item.replyTo) : null;

    return (
      <ChatMessageItem
        item={item}
        replyMessage={replyMessage}
        activeReactionMessageId={activeReactionMessageId}
        onSwipe={(msg) => setReplyingTo(msg)}
        onLongPress={(id) => setActiveReactionMessageId(id)}
        onReactionPress={handleReact}
        onClearReaction={() => setActiveReactionMessageId(null)}
        onFeedbackPress={handleFeedback}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Astrologer Vikram</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onScrollBeginDrag={() => {
          if (activeReactionMessageId) setActiveReactionMessageId(null);
        }}
      />

      <ChatInput
        replyingTo={replyingTo}
        onSend={handleSend}
        onCancelReply={() => setReplyingTo(null)}
        onFocus={() => {
          if (activeReactionMessageId) setActiveReactionMessageId(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
});
