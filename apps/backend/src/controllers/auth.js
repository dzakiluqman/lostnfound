const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Auth Controller
 */
const authController = {
  /**
   * POST /api/auth/register
   * Mendaftar pengguna baru via Supabase Auth dan menyimpan data ke tabel 'profiles'
   */
  register: async (req, res, next) => {
    try {
      const { email, password, full_name, phone_number } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, dan nama lengkap wajib diisi.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password minimal 6 karakter.',
        });
      }

      // 1. Sign up user via Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone_number: phone_number || '',
          },
        },
      });

      if (authError) {
        return res.status(400).json({
          success: false,
          message: authError.message,
        });
      }

      const user = authData.user;
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Gagal membuat user baru.',
        });
      }

      // 2. Ensure profile exists in 'profiles' table
      const profileData = {
        id: user.id,
        full_name,
        phone_number: phone_number || null,
        updated_at: new Date().toISOString(),
      };

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.warn('[Warn] Profile upsert warning:', profileError.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil. Silakan login atau cek email verifikasi jika diaktifkan.',
        user,
        profile: profile || profileData,
        session: authData.session,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   * Login dengan email & password
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi.',
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah.',
          error: error?.message,
        });
      }

      // Fetch profile
      let { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If profile not yet created, generate fallback from metadata
      if (!profile) {
        const fallbackProfile = {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || 'Civitas Akademika',
          phone_number: data.user.user_metadata?.phone_number || '',
        };
        const { data: createdProfile } = await supabaseAdmin
          .from('profiles')
          .upsert(fallbackProfile)
          .select()
          .single();
        profile = createdProfile || fallbackProfile;
      }

      return res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        token: data.session.access_token,
        session: data.session,
        user: data.user,
        profile,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   * Mengambil data profil pengguna yang sedang login
   */
  getProfile: async (req, res, next) => {
    try {
      return res.status(200).json({
        success: true,
        user: req.user,
        profile: req.profile,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
