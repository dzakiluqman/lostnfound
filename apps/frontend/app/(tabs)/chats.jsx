import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../services/authContext';
import { api } from '../../services/api';

export default function ChatsListScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getChatRooms(token);
      setRooms(data);
    } catch (err) {
      console.warn('Error fetching chat rooms:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Masuk untuk Melihat Chat</Text>
          <Text style={styles.emptySubtitle}>
            Riwayat obrolan dengan pemilik barang atau penemu akan tampil di sini setelah Anda login.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Masuk ke Akun</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Memuat percakapan...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38BDF8"
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item: room }) => {
            const otherUser = room.other_user || {};
            const relatedItem = room.item || {};
            const lastMessage = room.last_message;

            return (
              <TouchableOpacity
                style={styles.roomCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/chat/${room.id}`)}
              >
                {/* Related item thumbnail */}
                {relatedItem.image_url ? (
                  <Image source={{ uri: relatedItem.image_url }} style={styles.itemThumb} />
                ) : (
                  <View style={styles.itemThumbPlaceholder}>
                    <Text style={styles.thumbEmoji}>
                      {relatedItem.type === 'lost' ? '🔍' : '📦'}
                    </Text>
                  </View>
                )}

                <View style={styles.roomContent}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {otherUser.full_name || 'Civitas Kampus'}
                    </Text>
                    <Text style={styles.timestamp}>
                      {room.updated_at
                        ? new Date(room.updated_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>

                  <Text style={styles.itemTitle} numberOfLines={1}>
                    Barang: {relatedItem.title || 'Barang Terkait'}
                  </Text>

                  <Text style={styles.lastMsgText} numberOfLines={1}>
                    {lastMessage ? lastMessage.message : 'Ketuk untuk membuka percakapan...'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📬</Text>
              <Text style={styles.emptyTitle}>Belum Ada Percakapan</Text>
              <Text style={styles.emptySubtitle}>
                Buka salah satu postingan barang dan ketuk tombol "Hubungi Pelapor" untuk memulai chat.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 13,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  itemThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  itemThumbPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  thumbEmoji: {
    fontSize: 22,
  },
  roomContent: {
    flex: 1,
    marginLeft: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
  },
  itemTitle: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMsgText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
