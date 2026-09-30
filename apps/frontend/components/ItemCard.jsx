import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export const ItemCard = ({ item, onPress }) => {
  const isLost = item.type === 'lost';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.badge,
            isLost ? styles.lostBadge : styles.foundBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isLost ? styles.lostBadgeText : styles.foundBadgeText,
            ]}
          >
            {isLost ? 'LOST' : 'FOUND'}
          </Text>
        </View>
        <Text style={styles.date}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
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
          📍 {item.location || 'Campus Area'}
        </Text>
        <Text style={styles.status}>
          {item.status || 'open'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lostBadgeText: {
    color: '#EF4444',
  },
  foundBadgeText: {
    color: '#22C55E',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 10,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  location: {
    fontSize: 13,
    color: '#CBD5E1',
    flex: 1,
  },
  status: {
    fontSize: 12,
    color: '#38BDF8',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
});
