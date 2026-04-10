import React, { useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage, toggleReaction, setFeedback, ChatMessage } from '../store/chatSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatMessageItem from '../components/ChatMessageItem';
import ChatInput from '../components/ChatInput';
import Animated, { SlideInDown, LinearTransition, Easing } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';

export default function ChatScreen() {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

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

  const submitRating = () => {
    Alert.alert("Thank You", "Rating data captured successfully!");
    setShowRating(false);
    setRating(0);
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
        <TouchableOpacity style={styles.endChatButton} onPress={() => setShowRating(true)}>
          <Text style={styles.endChatText}>End Chat</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef as any}
        data={messages}
        itemLayoutAnimation={LinearTransition.duration(300).easing(Easing.inOut(Easing.ease))}
        keyExtractor={(item: ChatMessage) => item.id}
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

      <Modal
        visible={showRating}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowRating(false);
          setRating(0);
        }}
      >
        <View style={styles.overlayContainer}>
          <Animated.View
            entering={SlideInDown.duration(400).springify()}
            style={styles.ratingCard}
          >
            <Text style={styles.ratingTitle}>Rate your session</Text>
            <Text style={styles.ratingSubtitle}>Thank you for choosing Astrologer Vikram!</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Star
                    size={38}
                    color={rating >= star ? '#F59E0B' : '#E2E8F0'}
                    fill={rating >= star ? '#F59E0B' : 'transparent'}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.ratingActions}>
               <TouchableOpacity 
                  style={styles.cancelRatingButton} 
                  onPress={() => {
                     setShowRating(false);
                     setRating(0);
                  }}
               >
                  <Text style={styles.cancelRatingText}>Cancel</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                  style={[styles.submitRatingButton, rating === 0 && styles.submitRatingButtonDisabled]} 
                  disabled={rating === 0}
                  onPress={submitRating}
               >
                  <Text style={styles.submitRatingText}>Submit</Text>
               </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 10,
  },
  endChatButton: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  },
  endChatText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  star: {
    fontSize: 38,
  },
  starSelected: {
    color: '#F59E0B',
  },
  starUnselected: {
    color: '#E2E8F0',
  },
  ratingActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelRatingButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelRatingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  submitRatingButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitRatingButtonDisabled: {
    backgroundColor: '#BFDBFE',
  },
  submitRatingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
