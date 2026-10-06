import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ItemCard = ({ item, onPress }) => {
  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved';

  return (
    <TouchableOpacity
      style={[styles.card, isResolved && styles.cardResolved]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Thumbnail Image / Placeholder */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnailPlaceholder, isLost ? styles.lostPlaceholder : styles.foundPlaceholder]}>
          <Ionicons
            name={isLost ? 'search-outline' : 'cube-outline'}
            size={28}
            color={isLost ? '#EF4444' : '#10B981'}
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.badgeGroup}>
            <View style={[styles.badge, isLost ? styles.lostBadge : styles.foundBadge]}>
              <Text style={[styles.badgeText, isLost ? styles.lostBadgeText : styles.foundBadgeText]}>
                {isLost ? 'HILANG' : 'DITEMUKAN'}
              </Text>
            </View>

            {isResolved && (
              <View style={styles.resolvedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 2 }} />
                <Text style={styles.resolvedBadgeText}>Selesai</Text>
              </View>
            )}
          </View>

          <Text style={styles.date}>
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Hari ini'}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#64748B" style={styles.locationIcon} />
            <Text style={styles.location} numberOfLines={1}>
              {item.location || 'Area Kampus'}
            </Text>
          </View>

          {item.category ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardResolved: {
    opacity: 0.8,
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  thumbnail: {
    width: 100,
    height: '100%',
    minHeight: 110,
    backgroundColor: '#F1F5F9',
  },
  thumbnailPlaceholder: {
    width: 100,
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lostPlaceholder: {
    backgroundColor: '#FEF2F2',
  },
  foundPlaceholder: {
    backgroundColor: '#ECFDF5',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  lostBadgeText: {
    color: '#DC2626',
  },
  foundBadgeText: {
    color: '#16A34A',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resolvedBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },
  categoryPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  categoryText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
});
