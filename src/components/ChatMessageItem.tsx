import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ChatMessage } from '../store/chatSlice';
import SwipeableMessage from './SwipeableMessage';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ChatMessageItemProps {
  item: ChatMessage;
  replyMessage: ChatMessage | null | undefined;
  activeReactionMessageId: string | null;
  onSwipe: (item: ChatMessage) => void;
  onLongPress: (id: string) => void;
  onReactionPress: (id: string, emoji: string) => void;
  onClearReaction: () => void;
}

export default function ChatMessageItem({
  item,
  replyMessage,
  activeReactionMessageId,
  onSwipe,
  onLongPress,
  onReactionPress,
  onClearReaction,
}: ChatMessageItemProps) {
  if (item.sender === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{item.text}</Text>
      </View>
    );
  }

  const isUser = item.sender === 'user';
  const showReactionBox = activeReactionMessageId === item.id;

  return (
    <SwipeableMessage onSwipe={() => onSwipe(item)}>
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
              {EMOJIS.map((emoji) => {
                const isSelected = item.reaction === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => onReactionPress(item.id, emoji)}
                    style={[styles.emojiButton, isSelected && styles.selectedEmojiButton]}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => onLongPress(item.id)}
            onPress={() => {
              if (activeReactionMessageId) onClearReaction();
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
          </TouchableOpacity>

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
}

const styles = StyleSheet.create({
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
  emojiButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
  },
  selectedEmojiButton: {
    backgroundColor: '#E2E8F0',
  },
  reactionEmoji: {
    fontSize: 26,
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
