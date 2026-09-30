import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[WARN] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in frontend environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/**
 * Upload an image to Supabase Storage bucket 'item-images'
 * @param {Object} options
 * @param {string} options.base64 - Base64 encoded image data from ImagePicker
 * @param {string} options.uri - Image local URI
 * @param {string} [options.mimeType='image/jpeg']
 * @returns {Promise<string>} Public URL of uploaded image
 */
export async function uploadImageToSupabase({ base64, uri, mimeType = 'image/jpeg' }) {
  try {
    const bucketName = 'item-images';
    const ext = uri ? uri.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    let fileBody;

    if (base64) {
      fileBody = decode(base64);
    } else if (Platform.OS === 'web' && uri.startsWith('data:')) {
      const b64Data = uri.split(',')[1];
      fileBody = decode(b64Data);
    } else {
      // Fetch as blob for React Native fallback
      const response = await fetch(uri);
      fileBody = await response.blob();
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBody, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[Upload Helper Error]:', err);
    throw err;
  }
}
