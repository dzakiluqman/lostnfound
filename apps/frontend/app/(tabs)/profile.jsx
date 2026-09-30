import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../services/authContext';
import { api } from '../../services/api';
import { ItemCard } from '../../components/ItemCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, token, isAuthenticated, logout } = useAuth();

  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoadingItems(true);
      const data = await api.getItems({
        user_id: user.id,
        status: 'all',
      });
      setMyItems(data);
    } catch (err) {
      console.warn('Error fetching my items:', err.message);
    } finally {
      setLoadingItems(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyItems();
    }
  }, [isAuthenticated, fetchMyItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyItems();
  };

  const handleToggleStatus = (item) => {
    const nextStatus = item.status === 'active' ? 'resolved' : 'active';
    const actionLabel = nextStatus === 'resolved' ? 'Tandai Selesai' : 'Aktifkan Kembali';

    Alert.alert(
      actionLabel,
      `Ubah status "${item.title}" menjadi ${nextStatus.toUpperCase()}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ubah',
          onPress: async () => {
            try {
              await api.updateItemStatus(item.id, nextStatus, token);
              fetchMyItems();
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Gagal mengubah status');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Hapus Postingan',
      `Apakah Anda yakin ingin menghapus "${item.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteItem(item.id, token);
              fetchMyItems();
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Gagal menghapus postingan');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPromptContainer}>
          <Text style={styles.promptEmoji}>👤</Text>
          <Text style={styles.promptTitle}>Profil Akun</Text>
          <Text style={styles.promptSubtitle}>
            Masuk untuk mengelola laporan barang Anda dan berpartisipasi dalam komunitas kampus.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginBtnText}>Masuk ke Akun</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeCount = myItems.filter((i) => i.status === 'active').length;
  const resolvedCount = myItems.filter((i) => i.status === 'resolved').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#38BDF8"
          />
        }
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🎓</Text>
          </View>
          <Text style={styles.userName}>{profile?.full_name || 'Civitas Akademika'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {profile?.phone_number ? (
            <Text style={styles.userPhone}>📞 {profile.phone_number}</Text>
          ) : null}

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{myItems.length}</Text>
              <Text style={styles.statLabel}>Total Laporan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#38BDF8' }]}>{activeCount}</Text>
              <Text style={styles.statLabel}>Aktif</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#22C55E' }]}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* Section: My Posts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Laporan Saya ({myItems.length})</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refreshAction}>Perbarui ↻</Text>
          </TouchableOpacity>
        </View>

        {loadingItems && !refreshing ? (
          <ActivityIndicator color="#38BDF8" style={{ marginVertical: 20 }} />
        ) : myItems.length === 0 ? (
          <View style={styles.emptyPostsBox}>
            <Text style={styles.emptyPostsText}>Anda belum membuat laporan barang.</Text>
            <TouchableOpacity
              style={styles.addPostBtn}
              onPress={() => router.push('/(tabs)/add-item')}
            >
              <Text style={styles.addPostBtnText}>+ Buat Laporan Pertama</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myItems.map((item) => (
            <View key={item.id} style={styles.myPostWrapper}>
              <ItemCard item={item} onPress={() => router.push(`/item/${item.id}`)} />
              <View style={styles.postActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    item.status === 'active' ? styles.resolveBtn : styles.reactivateBtn,
                  ]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Text style={styles.actionBtnText}>
                    {item.status === 'active' ? '✓ Tandai Selesai' : '↺ Aktifkan Lagi'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteItem(item)}
                >
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>🗑️ Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  promptEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  promptSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#38BDF8',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  refreshAction: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyPostsBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  emptyPostsText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 12,
  },
  addPostBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPostBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  myPostWrapper: {
    marginBottom: 12,
  },
  postActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -2,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolveBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  reactivateBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  deleteBtn: {
    flex: 0.6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  deleteBtnText: {
    color: '#EF4444',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
