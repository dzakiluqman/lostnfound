import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ItemCard } from '../../components/ItemCard';
import { useAuth } from '../../services/authContext';

const CATEGORIES = ['Semua', 'Elektronik', 'Dokumen / KTM', 'Kunci', 'Pakaian & Tas', 'Lainnya'];

export default function FeedScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [activeType, setActiveType] = useState('lost');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getItems({
        type: activeType,
        category: selectedCategory,
        search: searchQuery,
        status: 'active',
      });
      setItems(data);
    } catch (err) {
      console.warn('Error fetching feed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeType, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Top Filter Container */}
      <View style={styles.filterSection}>
        {/* Type Switcher Tab */}
        <View style={styles.switcherContainer}>
          <TouchableOpacity
            style={[styles.switcherTab, activeType === 'lost' && styles.lostTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveType('lost')}
          >
            <Ionicons
              name="search"
              size={16}
              color={activeType === 'lost' ? '#DC2626' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.switcherText, activeType === 'lost' && styles.lostTextActive]}>
              Barang Hilang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherTab, activeType === 'found' && styles.foundTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveType('found')}
          >
            <Ionicons
              name="cube"
              size={16}
              color={activeType === 'found' ? '#16A34A' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.switcherText, activeType === 'found' && styles.foundTextActive]}>
              Ditemukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar with Input Icon */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Cari ${activeType === 'lost' ? 'barang hilang' : 'barang temuan'}...`}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Item List with Skeleton Loader */}
      {loading && !refreshing ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <View style={styles.skeletonThumb} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonBadge} />
                <View style={styles.skeletonLineLong} />
                <View style={styles.skeletonLineShort} />
              </View>
            </View>
          ))}
          <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 8 }} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => router.push(`/item/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={activeType === 'lost' ? 'search-outline' : 'cube-outline'}
                  size={36}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeType === 'lost'
                  ? 'Belum ada laporan barang hilang'
                  : 'Belum ada laporan barang ditemukan'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategory !== 'Semua'
                  ? 'Coba ganti kata kunci pencarian atau kategori filter.'
                  : 'Gunakan tab "Laporkan" untuk mendaftarkan barang baru ke komunitas kampus.'}
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLogo: {
    width: 170,
    height: 40,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  lostTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  foundTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  lostTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  foundTextActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    padding: 0,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontWeight: '500',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    flexDirection: 'row',
    height: 110,
  },
  skeletonThumb: {
    width: 100,
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  skeletonContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-around',
  },
  skeletonBadge: {
    width: 70,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  skeletonLineLong: {
    width: '90%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  skeletonLineShort: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
