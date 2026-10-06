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
import { Ionicons } from '@expo/vector-icons';
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
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubbles-outline" size={36} color="#2563EB" />
          </View>
          <Text style={styles.emptyTitle}>Masuk untuk Melihat Percakapan</Text>
          <Text style={styles.emptySubtitle}>
            Riwayat chat dengan penemu atau pemilik barang akan muncul di sini setelah Anda masuk ke akun.
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
          <ActivityIndicator size="large" color="#2563EB" />
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
              tintColor="#2563EB"
              colors={['#2563EB']}
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
                    <Ionicons
                      name={relatedItem.type === 'lost' ? 'search-outline' : 'cube-outline'}
                      size={22}
                      color="#2563EB"
                    />
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

                  <View style={styles.itemBadgeRow}>
                    <Text style={styles.itemLabel}>Barang:</Text>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {relatedItem.title || 'Barang Terkait'}
                    </Text>
                  </View>

                  <Text style={styles.lastMsgText} numberOfLines={1}>
                    {lastMessage ? lastMessage.message : 'Ketuk untuk membuka percakapan...'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Belum Ada Percakapan</Text>
              <Text style={styles.emptySubtitle}>
                Buka postingan barang yang Anda cari dan ketuk "Hubungi Pelapor" untuk memulai koordinasi penyerahan barang.
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
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
  itemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 4,
  },
  itemTitle: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    flex: 1,
  },
  lastMsgText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
