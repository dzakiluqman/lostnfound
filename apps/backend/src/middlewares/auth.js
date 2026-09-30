const { supabase, getAuthClient } = require('../config/supabase');

/**
 * Authentication Middleware
 * Validates Supabase JWT from 'Authorization: Bearer <token>' header
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token otorisasi kosong.',
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.',
        error: error?.message,
      });
    }

    // Fetch user profile from 'profiles' table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Attach user, profile, and scoped client to request
    req.user = user;
    req.profile = profile || {
      id: user.id,
      full_name: user.user_metadata?.full_name || 'Civitas Akademika',
      phone_number: user.user_metadata?.phone_number || '',
      avatar_url: user.user_metadata?.avatar_url || '',
    };
    req.token = token;
    req.supabaseUserClient = getAuthClient(token);

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi autentikasi.',
      error: err.message,
    });
  }
};

/**
 * Optional Auth Middleware
 * Sets req.user if valid token provided, but doesn't block unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          req.user = user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          req.profile = profile;
          req.token = token;
          req.supabaseUserClient = getAuthClient(token);
        }
      }
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};
