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
import { Ionicons } from '@expo/vector-icons';
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
        Alert.alert('Gagal Memuat', 'Data barang tidak ditemukan atau telah dihapus.');
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
        'Silakan masuk ke akun Anda terlebih dahulu untuk memulai percakapan.',
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
        Alert.alert('Gagal', 'Tidak dapat membuka ruang percakapan.');
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
      Alert.alert(
        'Status Berhasil Diubah',
        `Status barang sekarang adalah ${nextStatus === 'resolved' ? 'SELESAI' : 'AKTIF'}.`
      );
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
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
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ width: 36 }} />
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
            <Ionicons
              name={isLost ? 'search-outline' : 'cube-outline'}
              size={54}
              color={isLost ? '#EF4444' : '#10B981'}
            />
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
                {isResolved ? 'Selesai' : 'Aktif'}
              </Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category || 'Lainnya'}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
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
          </View>

          {/* Location Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="location-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.infoLabel}>Lokasi Kejadian / Temuan</Text>
            </View>
            <Text style={styles.infoValue}>{item.location}</Text>
          </View>

          {/* Description Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="document-text-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.infoLabel}>Deskripsi & Ciri-Ciri</Text>
            </View>
            <Text style={styles.descriptionValue}>
              {item.description || 'Tidak ada deskripsi tambahan yang dicantumkan.'}
            </Text>
          </View>

          {/* Reporter Profile Card */}
          <View style={styles.reporterCard}>
            <Text style={styles.reporterCardTitle}>Identitas Pelapor</Text>
            <View style={styles.reporterRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color="#2563EB" />
              </View>
              <View style={styles.reporterDetails}>
                <Text style={styles.reporterName}>
                  {reporter.full_name || 'Civitas Kampus'}
                </Text>
                <Text style={styles.reporterPhone}>
                  {item.contact_info || reporter.phone_number || 'Kontak melalui Pesan Aplikasi'}
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
            <Ionicons
              name={isResolved ? 'refresh-outline' : 'checkmark-circle-outline'}
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnText}>
              {isResolved ? 'Aktifkan Kembali Laporan' : 'Tandai Selesai / Ditemukan'}
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
              <View style={styles.btnContent}>
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.chatBtnText}>Hubungi Pelapor</Text>
              </View>
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
    backgroundColor: '#F8FAFC',
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  navTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
  },
  heroPlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lostPlaceholder: {
    backgroundColor: '#FEF2F2',
  },
  foundPlaceholder: {
    backgroundColor: '#ECFDF5',
  },
  heroPlaceholderText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  mainInfo: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  lostBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  foundBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  lostBadgeText: {
    color: '#DC2626',
  },
  foundBadgeText: {
    color: '#16A34A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  activeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  resolvedBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  resolvedText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBadgeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  descriptionValue: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  reporterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  reporterCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginRight: 12,
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reporterPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chatBtn: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resolveBtn: {
    backgroundColor: '#16A34A',
  },
  reactivateBtn: {
    backgroundColor: '#2563EB',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
