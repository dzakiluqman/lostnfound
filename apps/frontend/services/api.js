import { supabase } from './supabase';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'https://lostnfound-api.vercel.app/api';

/**
 * Generic fetch wrapper with auth header
 */
async function request(endpoint, options = {}, token = null) {
  const url = `${BACKEND_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    // If backend is unreachable, throw or handle
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: (token) => request('/auth/me', { method: 'GET' }, token),

  // Items
  getItems: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.category && params.category !== 'Semua') queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.user_id) queryParams.append('user_id', params.user_id);

      const qs = queryParams.toString();
      const res = await request(`/items${qs ? `?${qs}` : ''}`);
      return res.data || [];
    } catch (err) {
      // Fallback direct to Supabase
      console.warn('[API Fallback] Fetching items directly from Supabase:', err.message);
      let query = supabase
        .from('items')
        .select(`
          id,
          user_id,
          title,
          description,
          category,
          type,
          location,
          image_url,
          status,
          created_at,
          profiles:user_id(id, full_name, phone_number, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (params.type) query = query.eq('type', params.type);
      if (params.category && params.category !== 'Semua') query = query.eq('category', params.category);
      if (params.status && params.status !== 'all') query = query.eq('status', params.status);
      if (params.user_id) query = query.eq('user_id', params.user_id);
      if (params.search) {
        query = query.or(
          `title.ilike.%${params.search}%,description.ilike.%${params.search}%,location.ilike.%${params.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((item) => ({
        ...item,
        contact_info: item.profiles?.phone_number || '',
      }));
    }
  },

  getItemById: async (id) => {
    try {
      const res = await request(`/items/${id}`);
      return res.data;
    } catch (err) {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          user_id,
          title,
          description,
          category,
          type,
          location,
          image_url,
          status,
          created_at,
          profiles:user_id(id, full_name, phone_number, avatar_url)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        contact_info: data?.profiles?.phone_number || '',
      };
    }
  },

  createItem: async (payload, token) => {
    try {
      const res = await request(
        '/items',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        token
      );
      return res.data;
    } catch (err) {
      console.warn('[API Fallback] Inserting item directly to Supabase:', err.message);
      const { data: { user } } = await supabase.auth.getUser();
      const { contact_info, ...cleanPayload } = payload;
      const { data, error } = await supabase
        .from('items')
        .insert([{ ...cleanPayload, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      if (contact_info) {
        await supabase.from('profiles').update({ phone_number: contact_info }).eq('id', user.id);
      }
      return {
        ...data,
        contact_info: contact_info || '',
      };
    }
  },

  updateItemStatus: async (id, status, token) => {
    try {
      const res = await request(
        `/items/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        token
      );
      return res.data;
    } catch (err) {
      const { data, error } = await supabase
        .from('items')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteItem: async (id, token) => {
    try {
      return await request(`/items/${id}`, { method: 'DELETE' }, token);
    } catch (err) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // Chat
  getChatRooms: async (token) => {
    try {
      const res = await request('/chat/rooms', { method: 'GET' }, token);
      return res.data || [];
    } catch (err) {
      console.warn('[API Fallback] Fetching rooms directly:', err.message);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          item_id,
          inquirer_id,
          owner_id,
          created_at,
          items:item_id(id, title, image_url, type, status, location),
          inquirer:inquirer_id(id, full_name, phone_number, avatar_url),
          owner:owner_id(id, full_name, phone_number, avatar_url)
        `)
        .or(`inquirer_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((room) => ({
        ...room,
        user1_id: room.inquirer_id,
        user2_id: room.owner_id,
        other_user: room.inquirer_id === user.id ? room.owner : room.inquirer,
        item: room.items,
      }));
    }
  },

  findOrCreateRoom: async (itemId, targetUserId, token) => {
    try {
      const res = await request(
        '/chat/room',
        {
          method: 'POST',
          body: JSON.stringify({ item_id: itemId, target_user_id: targetUserId }),
        },
        token
      );
      return res.room;
    } catch (err) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Harap login terlebih dahulu');

      // Check existing rooms for this item
      const { data: existingList } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          item_id,
          inquirer_id,
          owner_id,
          created_at,
          items:item_id(id, title, image_url, type, status),
          inquirer:inquirer_id(id, full_name, avatar_url),
          owner:owner_id(id, full_name, avatar_url)
        `)
        .eq('item_id', itemId);

      if (existingList && existingList.length > 0) {
        const found = existingList.find(
          (r) =>
            (r.inquirer_id === user.id && r.owner_id === targetUserId) ||
            (r.inquirer_id === targetUserId && r.owner_id === user.id)
        );
        if (found) {
          const otherUser = found.inquirer_id === user.id ? found.owner : found.inquirer;
          return {
            ...found,
            user1_id: found.inquirer_id,
            user2_id: found.owner_id,
            other_user: otherUser,
          };
        }
      }

      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert([{ item_id: itemId, inquirer_id: user.id, owner_id: targetUserId, created_at: new Date().toISOString() }])
        .select(`
          id,
          item_id,
          inquirer_id,
          owner_id,
          created_at,
          items:item_id(id, title, image_url, type, status),
          inquirer:inquirer_id(id, full_name, avatar_url),
          owner:owner_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      const otherUser = newRoom.inquirer_id === user.id ? newRoom.owner : newRoom.inquirer;
      return {
        ...newRoom,
        user1_id: newRoom.inquirer_id,
        user2_id: newRoom.owner_id,
        other_user: otherUser,
      };
    }
  },

  getRoomMessages: async (roomId, token) => {
    try {
      const res = await request(`/chat/rooms/${roomId}/messages`, { method: 'GET' }, token);
      return res;
    } catch (err) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          room_id,
          sender_id,
          message,
          created_at,
          profiles:sender_id(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [] };
    }
  },

  sendMessage: async (roomId, message, token) => {
    try {
      const res = await request(
        `/chat/rooms/${roomId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ message }),
        },
        token
      );
      return res.data;
    } catch (err) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{ room_id: roomId, sender_id: user.id, message }])
        .select(`
          id,
          room_id,
          sender_id,
          message,
          created_at,
          profiles:sender_id(id, full_name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return data;
    }
  },
};
