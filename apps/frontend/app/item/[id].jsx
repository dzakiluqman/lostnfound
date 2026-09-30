import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../services/api';
import { useAuth } from '../../services/authContext';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const data = await api.getItemById(id);
        setItem(data);
      } catch (err) {
        Alert.alert('Error', 'Barang tidak ditemukan atau gagal dimuat.');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    if (id) loadItem();
  }, [id]);

  const handleContactReporter = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan masuk terlebih dahulu untuk memulai percakapan dengan pelapor.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Masuk', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (!item?.user_id) return;

    try {
      setStartingChat(true);
      const room = await api.findOrCreateRoom(item.id, item.user_id, token);
      if (room?.id) {
        router.push(`/chat/${room.id}`);
      } else {
        Alert.alert('Gagal', 'Tidak dapat membuat atau membuka ruang percakapan.');
      }
    } catch (err) {
      Alert.alert('Peringatan', err.message || 'Gagal memulai chat.');
    } finally {
      setStartingChat(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = item.status === 'active' ? 'resolved' : 'active';
    try {
      await api.updateItemStatus(item.id, nextStatus, token);
      setItem((prev) => ({ ...prev, status: nextStatus }));
      Alert.alert('Sukses', `Status barang berhasil diubah menjadi ${nextStatus}.`);
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Memuat detail barang...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) return null;

  const isOwner = user?.id === item.user_id;
  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved';
  const reporter = item.profiles || {};

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Hero */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              isLost ? styles.lostPlaceholder : styles.foundPlaceholder,
            ]}
          >
            <Text style={styles.heroEmoji}>{isLost ? '🔍' : '📦'}</Text>
            <Text style={styles.heroPlaceholderText}>Tidak ada foto terlampir</Text>
          </View>
        )}

        <View style={styles.mainInfo}>
          {/* Badge Row */}
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, isLost ? styles.lostBadge : styles.foundBadge]}>
              <Text
                style={[
                  styles.typeBadgeText,
                  isLost ? styles.lostBadgeText : styles.foundBadgeText,
                ]}
              >
                {isLost ? 'BARANG HILANG' : 'BARANG DITEMUKAN'}
              </Text>
            </View>

            <View style={[styles.statusBadge, isResolved ? styles.resolvedBadge : styles.activeBadge]}>
              <Text style={[styles.statusBadgeText, isResolved ? styles.resolvedText : styles.activeText]}>
                {isResolved ? '✓ SELESAI' : '● AKTIF'}
              </Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category || 'Lainnya'}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            Dilaporkan pada{' '}
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Hari ini'}
          </Text>

          {/* Location Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>📍 Lokasi Kejadian / Temuan</Text>
            <Text style={styles.infoValue}>{item.location}</Text>
          </View>

          {/* Description Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>📝 Deskripsi & Ciri-Ciri</Text>
            <Text style={styles.descriptionValue}>
              {item.description || 'Tidak ada keterangan tambahan.'}
            </Text>
          </View>

          {/* Reporter Profile Card */}
          <View style={styles.reporterCard}>
            <Text style={styles.reporterCardTitle}>Identitas Pelapor</Text>
            <View style={styles.reporterRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View style={styles.reporterDetails}>
                <Text style={styles.reporterName}>
                  {reporter.full_name || 'Civitas Kampus'}
                </Text>
                <Text style={styles.reporterPhone}>
                  {item.contact_info || reporter.phone_number || 'Kontak via Chat App'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {isOwner ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isResolved ? styles.reactivateBtn : styles.resolveBtn,
            ]}
            onPress={handleToggleStatus}
          >
            <Text style={styles.actionBtnText}>
              {isResolved ? '↺ Buka Kembali Laporan' : '✓ Tandai Sudah Selesai / Ditemukan'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.chatBtn, startingChat && { opacity: 0.7 }]}
            onPress={handleContactReporter}
            disabled={startingChat}
          >
            {startingChat ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.chatBtnText}>💬 Hubungi Pelapor</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  backText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
  },
  heroPlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lostPlaceholder: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  foundPlaceholder: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  heroEmoji: {
    fontSize: 54,
    marginBottom: 8,
  },
  heroPlaceholderText: {
    color: '#64748B',
    fontSize: 13,
  },
  mainInfo: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lostBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  foundBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  lostBadgeText: {
    color: '#EF4444',
  },
  foundBadgeText: {
    color: '#22C55E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  activeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  resolvedBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  resolvedText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryBadgeText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 28,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 18,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  descriptionValue: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  reporterCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reporterCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284C7',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  reporterPhone: {
    fontSize: 13,
    color: '#38BDF8',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  chatBtn: {
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  actionBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
});
