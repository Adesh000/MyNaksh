import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from '../store/chatSlice';

interface ChatInputProps {
  replyingTo: ChatMessage | null;
  onSend: (text: string) => void;
  onCancelReply: () => void;
  onFocus: () => void;
}

export default function ChatInput({ replyingTo, onSend, onCancelReply, onFocus }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSend(inputText.trim());
    setInputText('');
  };

  return (
    <>
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
          <TouchableOpacity onPress={onCancelReply} style={styles.cancelReplyButton}>
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
          onFocus={onFocus}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
