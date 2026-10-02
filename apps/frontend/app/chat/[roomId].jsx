import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef(null);

  // 1. Fetch initial room info and history
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getRoomMessages(roomId, token);
      setMessages(res.data || []);
      if (res.room) {
        setRoomInfo(res.room);
      }
    } catch (err) {
      console.warn('Error loading room messages:', err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, token]);

  useEffect(() => {
    if (roomId) {
      loadMessages();
    }
  }, [roomId, loadMessages]);

  // 2. Real-time Subscription via Supabase Channel
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat_room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new;

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. Send Message
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText('');
    setSending(true);

    try {
      const sentMsg = await api.sendMessage(roomId, text, token);
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === sentMsg?.id);
        if (exists) return prev;
        return [...prev, sentMsg];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const otherUser = roomInfo?.other_user || {};
  const relatedItem = roomInfo?.item || {};

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {relatedItem.image_url ? (
          <Image source={{ uri: relatedItem.image_url }} style={styles.itemThumb} />
        ) : (
          <View style={styles.itemThumbPlaceholder}>
            <Ionicons
              name={relatedItem.type === 'lost' ? 'search-outline' : 'cube-outline'}
              size={18}
              color="#2563EB"
            />
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.otherUserName} numberOfLines={1}>
            {otherUser.full_name || 'Lawan Bicara'}
          </Text>
          <Text style={styles.headerItemTitle} numberOfLines={1}>
            {relatedItem.title || 'Barang Terkait'}
          </Text>
        </View>

        {relatedItem.id ? (
          <TouchableOpacity
            style={styles.viewItemBtn}
            onPress={() => router.push(`/item/${relatedItem.id}`)}
          >
            <Ionicons name="open-outline" size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.viewItemText}>Lihat</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Memuat pesan...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || `msg-${index}`}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item: msg }) => {
              const isMine = msg.sender_id === user?.id;

              return (
                <View
                  style={[
                    styles.messageRow,
                    isMine ? styles.myMessageRow : styles.otherMessageRow,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.myBubble : styles.otherBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMine ? styles.myMessageText : styles.otherMessageText,
                      ]}
                    >
                      {msg.message}
                    </Text>
                    <Text
                      style={[
                        styles.timeText,
                        isMine ? styles.myTimeText : styles.otherTimeText,
                      ]}
                    >
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Mulai Percakapan</Text>
                <Text style={styles.emptySubtitle}>
                  Kirim pesan untuk berkoordinasi mengenai lokasi dan waktu serah terima barang.
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Tulis pesan..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
    borderRadius: 8,
  },
  itemThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  itemThumbPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerInfo: {
    flex: 1,
  },
  otherUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerItemTitle: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 1,
    fontWeight: '500',
  },
  viewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewItemText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 6,
  },
  myBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#0F172A',
  },
  timeText: {
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimeText: {
    color: '#94A3B8',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 9,
    color: '#0F172A',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
