import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage, toggleReaction, ChatMessage } from '../store/chatSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const SwipeableMessage = ({
  children,
  onSwipe,
}: {
  children: React.ReactNode;
  onSwipe: () => void;
}) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Allow swiping to the right to reply
      if (event.translationX > 0 && event.translationX < 80) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > 50) {
        runOnJS(onSwipe)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(translateX.value, [20, 50], [0, 1], Extrapolation.CLAMP);
    const opacity = interpolate(translateX.value, [20, 50], [0, 1], Extrapolation.CLAMP);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={{ width: '100%', justifyContent: 'center' }}>
      <Animated.View style={[styles.replyIconContainer, iconStyle]}>
        <Text style={styles.replyIconText}>↩</Text>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

export default function ChatScreen() {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: Date.now(),
      type: 'text',
      ...(replyingTo ? { replyTo: replyingTo.id } : {}),
    };

    dispatch(addMessage(newMessage));
    setInputText('');
    setReplyingTo(null);
    setActiveReactionMessageId(null);
  };

  const handleReact = (id: string, emoji: string) => {
    dispatch(toggleReaction({ id, emoji }));
    setActiveReactionMessageId(null);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    const isUser = item.sender === 'user';
    const replyMessage = item.replyTo ? messages.find((m) => m.id === item.replyTo) : null;
    const showReactionBox = activeReactionMessageId === item.id;

    return (
      <SwipeableMessage onSwipe={() => setReplyingTo(item)}>
        <View
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowOther,
            item.reaction ? styles.messageBubbleWithReaction : null,
          ]}
        >
            {showReactionBox && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[
                  styles.reactionBar,
                  isUser ? styles.reactionBarUser : styles.reactionBarOther,
                ]}
              >
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity key={emoji} onPress={() => handleReact(item.id, emoji)}>
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}

            <Pressable
              onLongPress={() => setActiveReactionMessageId(item.id)}
              onPress={() => {
                if (activeReactionMessageId) setActiveReactionMessageId(null);
              }}
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.otherBubble,
              ]}
            >
              {!isUser && (
                <Text style={styles.senderName}>
                  {item.sender === 'ai_astrologer' ? 'AI Astrologer' : 'Astrologer'}
                </Text>
              )}

              {replyMessage && (
                <View
                  style={[
                    styles.repliedToBox,
                    isUser ? styles.repliedToBoxUser : styles.repliedToBoxOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.repliedToSender,
                      isUser ? styles.repliedToSenderUser : styles.repliedToSenderOther,
                    ]}
                  >
                    {replyMessage.sender === 'user' ? 'You' : 'Astrologer'}
                  </Text>
                  <Text
                    style={[
                      styles.repliedToText,
                      isUser ? styles.repliedToTextUser : styles.repliedToTextOther,
                    ]}
                    numberOfLines={1}
                  >
                    {replyMessage.text}
                  </Text>
                </View>
              )}

              <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                {item.text}
              </Text>
            </Pressable>

            {item.reaction && !!item.reaction && (
              <View
                style={[
                  styles.reactionBadge,
                  isUser ? styles.reactionBadgeUser : styles.reactionBadgeOther,
                ]}
              >
                <Text style={styles.reactionBadgeText}>{item.reaction}</Text>
              </View>
            )}
        </View>
      </SwipeableMessage>
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

      {replyingTo && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyPreviewBar} />
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewSender}>
              {replyingTo.sender === 'user'
                ? 'You'
                : replyingTo.sender === 'ai_astrologer'
                ? 'AI Astrologer'
                : 'Astrologer'}
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setReplyingTo(null)}
            style={styles.cancelReplyButton}
          >
            <Text style={styles.cancelReplyText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          multiline
          onFocus={() => {
            if (activeReactionMessageId) setActiveReactionMessageId(null);
          }}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 30
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    minWidth: 80,
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleWithReaction: {
    marginBottom: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  replyIconContainer: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyIconText: {
    fontSize: 18,
    color: '#475569',
  },
  repliedToBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  repliedToBoxUser: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderLeftColor: '#E0F2FE',
  },
  repliedToBoxOther: {
    backgroundColor: '#F1F5F9',
    borderLeftColor: '#3B82F6',
  },
  repliedToSender: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  repliedToSenderUser: {
    color: '#E0F2FE',
  },
  repliedToSenderOther: {
    color: '#1D4ED8',
  },
  repliedToText: {
    fontSize: 13,
  },
  repliedToTextUser: {
    color: '#F8FAFC',
  },
  repliedToTextOther: {
    color: '#475569',
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  replyPreviewBar: {
    width: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    height: '100%',
    marginRight: 10,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewSender: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 13,
    color: '#475569',
  },
  cancelReplyButton: {
    padding: 8,
  },
  cancelReplyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BFDBFE',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  reactionBar: {
    position: 'absolute',
    top: -46,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  reactionBarUser: {
    right: 0,
  },
  reactionBarOther: {
    left: 0,
  },
  reactionEmoji: {
    fontSize: 26,
    marginHorizontal: 6,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reactionBadgeUser: {
    right: 16,
  },
  reactionBadgeOther: {
    left: 16,
  },
  reactionBadgeText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
