import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../services/supabase';
import { ItemCard } from '../components/ItemCard';

const SAMPLE_ITEMS = [
  {
    id: 'sample-1',
    title: 'KTM Mahasiswa Teknik Informatika',
    type: 'lost',
    description: 'Hilang di sekitar Gedung Perkuliahan Bersama lantai 3.',
    location: 'Gedung Kuliah Bersama Lt. 3',
    status: 'open',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Kunci Motor Honda Vario (Gantungan Biru)',
    type: 'found',
    description: 'Ditemukan di meja kantin pusat dekat kasir.',
    location: 'Kantin Pusat',
    status: 'open',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Tumbler Hydro Flask Hitam',
    type: 'lost',
    description: 'Ketinggalan setelah kelas praktikum jaringan komputer.',
    location: 'Lab Komputer 2',
    status: 'open',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function HomeScreen() {
  const [filter, setFilter] = useState('all'); // 'all', 'lost', 'found'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Attempt fetching from Supabase table 'items'
      let query = supabase.from('items').select('*').order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        setItems(data);
        setSupabaseConnected(true);
      } else {
        // Fallback to sample items if database table not yet populated or env not set
        const filteredSample =
          filter === 'all' ? SAMPLE_ITEMS : SAMPLE_ITEMS.filter((item) => item.type === filter);
        setItems(filteredSample);
        if (!error && data) {
          setSupabaseConnected(true);
        }
      }
    } catch (err) {
      console.log('Using local preview data:', err.message);
      const filteredSample =
        filter === 'all' ? SAMPLE_ITEMS : SAMPLE_ITEMS.filter((item) => item.type === filter);
      setItems(filteredSample);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Lost & Found Campus</Text>
        <Text style={styles.brandSubtitle}>
          Temukan dan laporkan barang hilang di lingkungan kampus
        </Text>

        <View style={styles.statusIndicatorContainer}>
          <View
            style={[
              styles.statusDot,
              supabaseConnected ? styles.statusDotOnline : styles.statusDotOffline,
            ]}
          />
          <Text style={styles.statusText}>
            {supabaseConnected ? 'Supabase Connected' : 'Supabase Demo / Standby'}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'lost', 'found'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              filter === tab && styles.filterTabActive,
            ]}
            onPress={() => setFilter(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab === 'all' ? 'Semua' : tab === 'lost' ? 'Barang Hilang' : 'Ditemukan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Memuat barang...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemCard item={item} onPress={() => {}} />}
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
              <Text style={styles.emptyText}>Belum ada laporan barang.</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 20,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#22C55E',
  },
  statusDotOffline: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTabActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
});
