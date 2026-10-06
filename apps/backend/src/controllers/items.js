const { supabaseAdmin } = require('../config/supabase');

/**
 * Items Controller (Lost & Found Posts)
 */
const itemsController = {
  /**
   * GET /api/items
   * Mengambil daftar barang dengan filter
   */
  getItems: async (req, res, next) => {
    try {
      const { type, category, search, status = 'active', user_id, limit = 50, page = 1 } = req.query;

      let query = supabaseAdmin
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
          updated_at,
          profiles:user_id (
            id,
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Filters
      if (type && (type === 'lost' || type === 'found')) {
        query = query.eq('type', type);
      }

      if (category && category !== 'Semua') {
        query = query.eq('category', category);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (search && search.trim()) {
        const searchTerm = search.trim();
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
        );
      }

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      query = query.range(offset, offset + parseInt(limit, 10) - 1);

      const { data, error, count } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengambil data barang.',
          error: error.message,
        });
      }

      const formattedData = (data || []).map((item) => ({
        ...item,
        contact_info: item.profiles?.phone_number || '',
      }));

      return res.status(200).json({
        success: true,
        count: formattedData.length,
        page: parseInt(page, 10),
        data: formattedData,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/items/:id
   * Detail barang dengan informasi pelapor
   */
  getItemById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
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
          updated_at,
          profiles:user_id (
            id,
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: 'Barang tidak ditemukan.',
          error: error?.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...data,
          contact_info: data.profiles?.phone_number || '',
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/items
   * Membuat postingan barang baru (Auth Required)
   */
  createItem: async (req, res, next) => {
    try {
      const { title, description, category, type, location, image_url, contact_info } = req.body;

      if (!title || !type || !location) {
        return res.status(400).json({
          success: false,
          message: 'Judul, tipe (lost/found), dan lokasi wajib diisi.',
        });
      }

      if (!['lost', 'found'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Tipe harus bernilai 'lost' atau 'found'.",
        });
      }

      const newItem = {
        user_id: req.user.id,
        title: title.trim(),
        description: description?.trim() || '',
        category: category?.trim() || 'Lainnya',
        type,
        location: location.trim(),
        image_url: image_url || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (contact_info && contact_info.trim() && !req.profile?.phone_number) {
        try {
          await supabaseAdmin
            .from('profiles')
            .update({ phone_number: contact_info.trim() })
            .eq('id', req.user.id);
        } catch (profileErr) {
          console.warn('Update profile phone note:', profileErr.message);
        }
      }

      const { data, error } = await supabaseAdmin
        .from('items')
        .insert([newItem])
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
          profiles:user_id (
            id,
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Gagal membuat laporan barang.',
          error: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Laporan barang berhasil diterbitkan.',
        data: {
          ...data,
          contact_info: contact_info || data.profiles?.phone_number || '',
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/items/:id/status
   * Mengubah status barang menjadi 'resolved' atau 'active' (Hanya pemilik)
   */
  updateItemStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status = 'resolved' } = req.body;

      if (!['active', 'resolved'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status hanya boleh 'active' atau 'resolved'.",
        });
      }

      // Check item ownership
      const { data: item, error: fetchError } = await supabaseAdmin
        .from('items')
        .select('id, user_id, status')
        .eq('id', id)
        .single();

      if (fetchError || !item) {
        return res.status(404).json({
          success: false,
          message: 'Barang tidak ditemukan.',
        });
      }

      if (item.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Hanya pemilik postingan yang dapat mengubah status barang ini.',
        });
      }

      const { data, error } = await supabaseAdmin
        .from('items')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Gagal memperbarui status barang.',
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Status barang berhasil diubah menjadi '${status}'.`,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/items/:id
   * Hapus postingan barang milik sendiri
   */
  deleteItem: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check item ownership
      const { data: item, error: fetchError } = await supabaseAdmin
        .from('items')
        .select('id, user_id')
        .eq('id', id)
        .single();

      if (fetchError || !item) {
        return res.status(404).json({
          success: false,
          message: 'Barang tidak ditemukan.',
        });
      }

      if (item.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Hanya pemilik postingan yang dapat menghapus barang ini.',
        });
      }

      const { error: deleteError } = await supabaseAdmin
        .from('items')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus postingan barang.',
          error: deleteError.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Postingan barang berhasil dihapus.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = itemsController;
