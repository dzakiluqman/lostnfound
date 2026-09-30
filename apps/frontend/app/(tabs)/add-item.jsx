import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../services/authContext';
import { uploadImageToSupabase } from '../../services/supabase';
import { api } from '../../services/api';

const CATEGORIES = ['Elektronik', 'Dokumen / KTM', 'Kunci', 'Pakaian & Tas', 'Lainnya'];

export default function AddItemScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [type, setType] = useState('lost'); // 'lost' or 'found'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Image Picker (Camera or Gallery)
  const pickImage = async (fromCamera = false) => {
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Izin kamera diperlukan untuk mengambil foto barang.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
        });

        if (!result.canceled && result.assets?.[0]) {
          setImageUri(result.assets[0].uri);
          setImageBase64(result.assets[0].base64);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Izin galeri diperlukan untuk memilih foto barang.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
        });

        if (!result.canceled && result.assets?.[0]) {
          setImageUri(result.assets[0].uri);
          setImageBase64(result.assets[0].base64);
        }
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Diperlukan',
        'Anda harus login terlebih dahulu untuk membuat laporan barang.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (!title.trim() || !location.trim()) {
      Alert.alert('Peringatan', 'Judul barang dan lokasi wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage('Mengunggah data...');

      let uploadedImageUrl = null;

      // 1. Upload photo to Supabase Storage bucket 'item-images' if selected
      if (imageUri) {
        setStatusMessage('Mengunggah foto ke storage...');
        try {
          uploadedImageUrl = await uploadImageToSupabase({
            uri: imageUri,
            base64: imageBase64,
          });
        } catch (uploadError) {
          console.warn('Upload image failed, continuing without image:', uploadError.message);
        }
      }

      // 2. Submit post to backend API / Supabase
      setStatusMessage('Menyimpan laporan...');
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        location: location.trim(),
        image_url: uploadedImageUrl,
        contact_info: contactInfo.trim() || user?.email,
      };

      const created = await api.createItem(payload, token);

      Alert.alert(
        'Sukses',
        `Laporan barang ${type === 'lost' ? 'hilang' : 'temuan'} berhasil diterbitkan!`,
        [
          {
            text: 'Lihat Barang',
            onPress: () => {
              if (created?.id) {
                router.replace(`/item/${created.id}`);
              } else {
                router.replace('/(tabs)');
              }
            },
          },
        ]
      );

      // Reset form
      setTitle('');
      setLocation('');
      setDescription('');
      setContactInfo('');
      setImageUri(null);
      setImageBase64(null);
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Gagal', err.message || 'Gagal menerbitkan laporan barang.');
    } finally {
      setSubmitting(false);
      setStatusMessage('');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequiredContainer}>
          <Text style={styles.authEmoji}>🔒</Text>
          <Text style={styles.authTitle}>Login Diperlukan</Text>
          <Text style={styles.authSubtitle}>
            Untuk membuat laporan barang hilang atau barang temuan, silakan masuk ke akun Anda.
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Masuk ke Akun</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Type Selector (Lost vs Found) */}
        <Text style={styles.sectionLabel}>Tipe Laporan</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'lost' && styles.typeBtnLostActive]}
            activeOpacity={0.8}
            onPress={() => setType('lost')}
          >
            <Text style={[styles.typeBtnText, type === 'lost' && styles.typeBtnTextActive]}>
              🔍 Saya Kehilangan Barang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === 'found' && styles.typeBtnFoundActive]}
            activeOpacity={0.8}
            onPress={() => setType('found')}
          >
            <Text style={[styles.typeBtnText, type === 'found' && styles.typeBtnTextActive]}>
              📦 Saya Menemukan Barang
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Picker */}
        <Text style={styles.sectionLabel}>Foto Barang (Opsional)</Text>
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => {
                setImageUri(null);
                setImageBase64(null);
              }}
            >
              <Text style={styles.removeImageText}>✕ Hapus Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageActionRow}>
            <TouchableOpacity
              style={styles.imagePickerBtn}
              onPress={() => pickImage(false)}
            >
              <Text style={styles.pickerEmoji}>🖼️</Text>
              <Text style={styles.pickerLabel}>Pilih dari Galeri</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagePickerBtn}
              onPress={() => pickImage(true)}
            >
              <Text style={styles.pickerEmoji}>📷</Text>
              <Text style={styles.pickerLabel}>Buka Kamera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Item Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama / Judul Barang *</Text>
          <TextInput
            style={styles.input}
            placeholder="misal: Kunci Motor Vario / Dompet Cokelat"
            placeholderTextColor="#64748B"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori Barang</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.categoryOptionActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat && styles.categoryOptionTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lokasi Terakhir / Ditemukan *</Text>
          <TextInput
            style={styles.input}
            placeholder="misal: Kantin Utama meja 12 / Perpustakaan Lt. 2"
            placeholderTextColor="#64748B"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deskripsi & Ciri-Ciri Barang</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Jelaskan ciri khusus, warna, stiker, atau detail lain..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Contact Info */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kontak yang Dapat Dihubungi</Text>
          <TextInput
            style={styles.input}
            placeholder="Nomor WhatsApp / Line ID"
            placeholderTextColor="#64748B"
            value={contactInfo}
            onChangeText={setContactInfo}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <View style={styles.submittingContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submittingText}>{statusMessage || 'Memproses...'}</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              📢 Terbitkan Laporan {type === 'lost' ? 'Hilang' : 'Temuan'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  typeBtnLostActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  typeBtnFoundActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22C55E',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  typeBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  imagePickerBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#475569',
  },
  pickerEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  imagePreview: {
    width: '100%',
    height: 190,
  },
  removeImageBtn: {
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
  },
  textArea: {
    minHeight: 85,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryOptionActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  submittingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submittingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
