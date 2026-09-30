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

  // 2. Real-time Subscription via Supabase
  useEffect(() => {
    if (!roomId) return;

    // Listen for new messages inserted in this room
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

          // If message already exists in state (e.g. from local optimistic insert), avoid duplicate
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });

          // Scroll to latest message
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
      // Append if not yet present
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
      // Revert text if failed
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const otherUser = roomInfo?.other_user || {};
  const relatedItem = roomInfo?.item || {};

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Room Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        {relatedItem.image_url ? (
          <Image source={{ uri: relatedItem.image_url }} style={styles.itemThumb} />
        ) : (
          <View style={styles.itemThumbPlaceholder}>
            <Text style={{ fontSize: 16 }}>{relatedItem.type === 'lost' ? '🔍' : '📦'}</Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.otherUserName} numberOfLines={1}>
            {otherUser.full_name || 'Lawan Bicara'}
          </Text>
          <Text style={styles.headerItemTitle} numberOfLines={1}>
            {relatedItem.title || 'Barang Kampus'}
          </Text>
        </View>

        {relatedItem.id ? (
          <TouchableOpacity
            style={styles.viewItemBtn}
            onPress={() => router.push(`/item/${relatedItem.id}`)}
          >
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
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Memuat percakapan...</Text>
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
                <Text style={styles.emptyEmoji}>👋</Text>
                <Text style={styles.emptyTitle}>Mulai Percakapan</Text>
                <Text style={styles.emptySubtitle}>
                  Tanyakan detail atau atur janji temu untuk serah terima barang di lingkungan kampus.
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ketik pesan..."
            placeholderTextColor="#64748B"
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
              <Text style={styles.sendButtonText}>➤</Text>
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
    backgroundColor: '#0F172A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  backBtnText: {
    color: '#38BDF8',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  itemThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 10,
  },
  itemThumbPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerInfo: {
    flex: 1,
  },
  otherUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerItemTitle: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 1,
  },
  viewItemBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  viewItemText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  myBubble: {
    backgroundColor: '#0284C7',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#F8FAFC',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#64748B',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#F8FAFC',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1E293B',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
