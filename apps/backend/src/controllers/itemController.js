const { supabase } = require('../config/supabase');

/**
 * Controller for Lost & Found items
 */
const itemController = {
  // GET /api/items
  getAllItems: async (req, res, next) => {
    try {
      const { type, status, search } = req.query;

      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type); // 'lost' or 'found'
      }

      if (status) {
        query = query.eq('status', status); // 'open', 'claimed', 'resolved'
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching items from Supabase',
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        count: data?.length || 0,
        data: data || [],
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/items/:id
  getItemById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({
          success: false,
          message: `Item with id ${id} not found`,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/items
  createItem: async (req, res, next) => {
    try {
      const { title, description, category, type, location, image_url, contact_info } = req.body;

      if (!title || !type || !location) {
        return res.status(400).json({
          success: false,
          message: 'Title, type (lost/found), and location are required fields.',
        });
      }

      const { data, error } = await supabase
        .from('items')
        .insert([
          {
            title,
            description,
            category,
            type, // 'lost' | 'found'
            location,
            image_url,
            contact_info,
            status: 'open',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create item in Supabase',
          error: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Item registered successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = itemController;
