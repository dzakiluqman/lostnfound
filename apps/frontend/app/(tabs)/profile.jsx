import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      `Ubah status "${item.title}" menjadi ${nextStatus === 'resolved' ? 'SELESAI' : 'AKTIF'}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Konfirmasi',
          onPress: async () => {
            try {
              await api.updateItemStatus(item.id, nextStatus, token);
              fetchMyItems();
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Gagal mengubah status barang.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Hapus Laporan',
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
              Alert.alert('Gagal', err.message || 'Gagal menghapus postingan.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
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
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.unauthLogo}
            resizeMode="contain"
          />
          <View style={styles.authIconCircle}>
            <Ionicons name="person-outline" size={36} color="#2563EB" />
          </View>
          <Text style={styles.promptTitle}>Profil Pengguna</Text>
          <Text style={styles.promptSubtitle}>
            Masuk untuk memantau status laporan Anda, mengelola barang hilang, dan berkoordinasi via chat.
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
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.profileLogo}
            resizeMode="contain"
          />
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={34} color="#2563EB" />
          </View>
          <Text style={styles.userName}>{profile?.full_name || 'Civitas Akademika'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {profile?.phone_number ? (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.userPhone}>{profile.phone_number}</Text>
            </View>
          ) : null}

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{myItems.length}</Text>
              <Text style={styles.statLabel}>Total Laporan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#2563EB' }]}>{activeCount}</Text>
              <Text style={styles.statLabel}>Aktif</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* Section: My Posts Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Laporan Saya ({myItems.length})</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="sync-outline" size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.refreshAction}>Perbarui</Text>
          </TouchableOpacity>
        </View>

        {loadingItems && !refreshing ? (
          <ActivityIndicator color="#2563EB" style={{ marginVertical: 20 }} />
        ) : myItems.length === 0 ? (
          <View style={styles.emptyPostsBox}>
            <Ionicons name="document-text-outline" size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyPostsText}>Anda belum membuat laporan barang.</Text>
            <TouchableOpacity
              style={styles.addPostBtn}
              onPress={() => router.push('/(tabs)/add-item')}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.addPostBtnText}>Buat Laporan Pertama</Text>
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
                  <Ionicons
                    name={item.status === 'active' ? 'checkmark-circle-outline' : 'refresh-outline'}
                    size={14}
                    color={item.status === 'active' ? '#16A34A' : '#2563EB'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      item.status === 'active' ? styles.resolveBtnText : styles.reactivateBtnText,
                    ]}
                  >
                    {item.status === 'active' ? 'Tandai Selesai' : 'Buka Kembali'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteItem(item)}
                >
                  <Ionicons name="trash-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Hapus</Text>
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
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        {/* App Version Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appInfoText}>Lost & Found Campus v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Universitas & Jaringan Kampus</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  authIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  promptSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  unauthLogo: {
    width: 200,
    height: 48,
    marginBottom: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  profileLogo: {
    width: 210,
    height: 48,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshAction: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyPostsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  emptyPostsText: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 12,
  },
  addPostBtn: {
    backgroundColor: '#2563EB',
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
    marginBottom: 10,
  },
  postActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolveBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resolveBtnText: {
    color: '#065F46',
  },
  reactivateBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  reactivateBtnText: {
    color: '#1E40AF',
  },
  deleteBtn: {
    flex: 0.6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    color: '#DC2626',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  appInfoText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  appInfoSubtext: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
});
