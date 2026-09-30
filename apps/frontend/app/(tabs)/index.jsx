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
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { ItemCard } from '../../components/ItemCard';
import { useAuth } from '../../services/authContext';

const CATEGORIES = ['Semua', 'Elektronik', 'Dokumen / KTM', 'Kunci', 'Pakaian & Tas', 'Lainnya'];

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Active Type: 'lost' or 'found'
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
      {/* Top Banner & Type Switcher */}
      <View style={styles.topContainer}>
        {/* Switcher Tab: Lost vs Found */}
        <View style={styles.switcherContainer}>
          <TouchableOpacity
            style={[styles.switcherTab, activeType === 'lost' && styles.lostTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveType('lost')}
          >
            <Text style={[styles.switcherText, activeType === 'lost' && styles.switcherTextActive]}>
              🔍 Barang Hilang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherTab, activeType === 'found' && styles.foundTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveType('found')}
          >
            <Text style={[styles.switcherText, activeType === 'found' && styles.switcherTextActive]}>
              📦 Ditemukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Cari ${activeType === 'lost' ? 'barang hilang' : 'barang temuan'}...`}
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
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

      {/* Item List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Memuat barang...</Text>
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
              tintColor="#38BDF8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>
                {activeType === 'lost' ? '🎉' : '🔎'}
              </Text>
              <Text style={styles.emptyTitle}>
                {activeType === 'lost'
                  ? 'Belum ada laporan barang hilang'
                  : 'Belum ada laporan barang ditemukan'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategory !== 'Semua'
                  ? 'Coba ubah kata kunci pencarian atau kategori'
                  : 'Ketuk tombol Laporkan di bawah jika Anda kehilangan atau menemukan sesuatu'}
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
  topContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  lostTabActive: {
    backgroundColor: '#DC2626',
  },
  foundTabActive: {
    backgroundColor: '#16A34A',
  },
  switcherText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  switcherTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  clearSearch: {
    color: '#94A3B8',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
