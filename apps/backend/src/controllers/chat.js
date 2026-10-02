const { supabaseAdmin } = require('../config/supabase');

/**
 * Chat Controller
 */
const chatController = {
  /**
   * POST /api/chat/room
   * Mencari atau membuat chat_room baru untuk suatu item
   * Body: { item_id, target_user_id }
   */
  findOrCreateRoom: async (req, res, next) => {
    try {
      const { item_id, target_user_id } = req.body;
      const current_user_id = req.user.id;

      if (!item_id) {
        return res.status(400).json({
          success: false,
          message: 'item_id wajib diberikan.',
        });
      }

      // Check item
      const { data: item, error: itemError } = await supabaseAdmin
        .from('items')
        .select('id, user_id, title, image_url')
        .eq('id', item_id)
        .single();

      if (itemError || !item) {
        return res.status(404).json({
          success: false,
          message: 'Barang tidak ditemukan.',
        });
      }

      const owner_id = target_user_id || item.user_id;

      if (current_user_id === owner_id) {
        return res.status(400).json({
          success: false,
          message: 'Anda tidak dapat memulai chat dengan diri Anda sendiri.',
        });
      }

      // Check if room already exists for this item
      const { data: existingRooms, error: searchError } = await supabaseAdmin
        .from('chat_rooms')
        .select(`
          id,
          item_id,
          user1_id,
          user2_id,
          created_at,
          items:item_id (id, title, image_url, type, status),
          user1:user1_id (id, full_name, avatar_url),
          user2:user2_id (id, full_name, avatar_url)
        `)
        .eq('item_id', item_id);

      if (searchError) {
        console.error('[Chat Room Search Error]:', searchError.message);
      }

      if (existingRooms && existingRooms.length > 0) {
        const found = existingRooms.find(
          (r) =>
            (r.user1_id === current_user_id && r.user2_id === owner_id) ||
            (r.user1_id === owner_id && r.user2_id === current_user_id)
        );

        if (found) {
          const otherUser = found.user1_id === current_user_id ? found.user2 : found.user1;
          return res.status(200).json({
            success: true,
            message: 'Ruang chat ditemukan.',
            room: {
              ...found,
              other_user: otherUser,
            },
          });
        }
      }

      // Create new chat room
      const { data: newRoom, error: insertError } = await supabaseAdmin
        .from('chat_rooms')
        .insert([
          {
            item_id,
            user1_id: current_user_id,
            user2_id: owner_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select(`
          id,
          item_id,
          user1_id,
          user2_id,
          created_at,
          items:item_id (id, title, image_url, type, status),
          user1:user1_id (id, full_name, avatar_url),
          user2:user2_id (id, full_name, avatar_url)
        `)
        .single();

      if (insertError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal membuat ruang chat.',
          error: insertError.message,
        });
      }

      const otherUser = newRoom.user1_id === current_user_id ? newRoom.user2 : newRoom.user1;

      return res.status(201).json({
        success: true,
        message: 'Ruang chat baru berhasil dibuat.',
        room: {
          ...newRoom,
          other_user: otherUser,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/chat/rooms
   * Mengambil daftar ruang chat milik user yang sedang login
   */
  getUserRooms: async (req, res, next) => {
    try {
      const current_user_id = req.user.id;

      const { data: rooms, error } = await supabaseAdmin
        .from('chat_rooms')
        .select(`
          id,
          item_id,
          user1_id,
          user2_id,
          created_at,
          updated_at,
          items:item_id (
            id,
            title,
            image_url,
            type,
            status,
            location
          ),
          user1:user1_id (
            id,
            full_name,
            phone_number,
            avatar_url
          ),
          user2:user2_id (
            id,
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${current_user_id},user2_id.eq.${current_user_id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengambil daftar ruang chat.',
          error: error.message,
        });
      }

      // Transform format so other_user and latest message are cleanly accessible
      const formattedRooms = await Promise.all(
        (rooms || []).map(async (room) => {
          const otherUser = room.user1_id === current_user_id ? room.user2 : room.user1;

          // Fetch last message for each room
          const { data: lastMsg } = await supabaseAdmin
            .from('chat_messages')
            .select('id, sender_id, message, created_at')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: room.id,
            item_id: room.item_id,
            item: room.items,
            other_user: otherUser,
            last_message: lastMsg || null,
            created_at: room.created_at,
            updated_at: room.updated_at,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: formattedRooms.length,
        data: formattedRooms,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/chat/rooms/:roomId/messages
   * Mengambil histori pesan di ruang chat tertentu
   */
  getRoomMessages: async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const current_user_id = req.user.id;

      // Verify room participation
      const { data: room, error: roomError } = await supabaseAdmin
        .from('chat_rooms')
        .select(`
          id,
          item_id,
          user1_id,
          user2_id,
          items:item_id (id, title, image_url, type, status),
          user1:user1_id (id, full_name, avatar_url),
          user2:user2_id (id, full_name, avatar_url)
        `)
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        return res.status(404).json({
          success: false,
          message: 'Ruang chat tidak ditemukan.',
        });
      }

      if (room.user1_id !== current_user_id && room.user2_id !== current_user_id) {
        return res.status(403).json({
          success: false,
          message: 'Anda bukan peserta dalam ruang chat ini.',
        });
      }

      // Fetch messages
      const { data: messages, error: msgError } = await supabaseAdmin
        .from('chat_messages')
        .select(`
          id,
          room_id,
          sender_id,
          message,
          created_at,
          profiles:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (msgError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengambil pesan chat.',
          error: msgError.message,
        });
      }

      const otherUser = room.user1_id === current_user_id ? room.user2 : room.user1;

      return res.status(200).json({
        success: true,
        room: {
          id: room.id,
          item: room.items,
          other_user: otherUser,
        },
        count: messages?.length || 0,
        data: messages || [],
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/chat/rooms/:roomId/messages
   * Mengirim pesan baru ke ruang chat
   */
  sendMessage: async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const { message } = req.body;
      const current_user_id = req.user.id;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Pesan tidak boleh kosong.',
        });
      }

      // Verify room participation
      const { data: room, error: roomError } = await supabaseAdmin
        .from('chat_rooms')
        .select('id, user1_id, user2_id')
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        return res.status(404).json({
          success: false,
          message: 'Ruang chat tidak ditemukan.',
        });
      }

      if (room.user1_id !== current_user_id && room.user2_id !== current_user_id) {
        return res.status(403).json({
          success: false,
          message: 'Anda bukan peserta dalam ruang chat ini.',
        });
      }

      // Insert message
      const { data: newMsg, error: sendError } = await supabaseAdmin
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            sender_id: current_user_id,
            message: message.trim(),
            created_at: new Date().toISOString(),
          },
        ])
        .select(`
          id,
          room_id,
          sender_id,
          message,
          created_at,
          profiles:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (sendError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengirim pesan.',
          error: sendError.message,
        });
      }

      // Update room updated_at
      await supabaseAdmin
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      return res.status(201).json({
        success: true,
        data: newMsg,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = chatController;
