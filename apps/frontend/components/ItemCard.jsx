import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

export const ItemCard = ({ item, onPress }) => {
  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved';

  return (
    <TouchableOpacity
      style={[styles.card, isResolved && styles.cardResolved]}
      activeOpacity={0.75}
      onPress={onPress}
    >
      {/* Thumbnail Image if available */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnailPlaceholder, isLost ? styles.lostPlaceholder : styles.foundPlaceholder]}>
          <Text style={styles.placeholderEmoji}>{isLost ? '🔍' : '📦'}</Text>
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
                <Text style={styles.resolvedBadgeText}>SELESAI</Text>
              </View>
            )}
          </View>

          <Text style={styles.date}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : 'Hari ini'}
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
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location || 'Area Kampus'}
          </Text>
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
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardResolved: {
    opacity: 0.75,
    borderColor: '#1E293B',
  },
  thumbnail: {
    width: 105,
    height: '100%',
    minHeight: 115,
    backgroundColor: '#0F172A',
  },
  thumbnailPlaceholder: {
    width: 105,
    minHeight: 115,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  lostPlaceholder: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  foundPlaceholder: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  placeholderEmoji: {
    fontSize: 32,
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
  },
  lostBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  foundBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lostBadgeText: {
    color: '#EF4444',
  },
  foundBadgeText: {
    color: '#22C55E',
  },
  resolvedBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resolvedBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
    marginRight: 6,
  },
  categoryPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '600',
  },
});
