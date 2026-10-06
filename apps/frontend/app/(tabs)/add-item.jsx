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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/authContext';
import { uploadImageToSupabase } from '../../services/supabase';
import { api } from '../../services/api';

const CATEGORIES = ['Elektronik', 'Dokumen / KTM', 'Kunci', 'Pakaian & Tas', 'Lainnya'];

export default function AddItemScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [type, setType] = useState('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const pickImage = async (fromCamera = false) => {
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Kamera', 'Izin kamera diperlukan untuk mengambil foto barang.');
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
          Alert.alert('Izin Galeri', 'Izin galeri diperlukan untuk memilih foto barang.');
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
        'Anda harus masuk terlebih dahulu untuk membuat laporan barang.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Masuk', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (!title.trim() || !location.trim()) {
      Alert.alert('Data Belum Lengkap', 'Judul barang dan lokasi wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage('Mengunggah data...');

      let uploadedImageUrl = null;

      if (imageUri) {
        setStatusMessage('Mengunggah foto...');
        try {
          uploadedImageUrl = await uploadImageToSupabase({
            uri: imageUri,
            base64: imageBase64,
          });
        } catch (uploadError) {
          console.warn('Upload image note:', uploadError.message);
        }
      }

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
        'Laporan Berhasil Diterbitkan',
        `Laporan barang ${type === 'lost' ? 'hilang' : 'temuan'} Anda telah terdaftar.`,
        [
          {
            text: 'Lihat Detail',
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
      Alert.alert('Gagal Menerbitkan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
      setStatusMessage('');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequiredContainer}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed-outline" size={36} color="#2563EB" />
          </View>
          <Text style={styles.authTitle}>Login Diperlukan</Text>
          <Text style={styles.authSubtitle}>
            Untuk membuat laporan barang hilang atau temuan, silakan masuk ke akun kampus Anda.
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
        {/* Type Selector */}
        <Text style={styles.sectionLabel}>Pilih Jenis Laporan</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'lost' && styles.typeBtnLostActive]}
            activeOpacity={0.8}
            onPress={() => setType('lost')}
          >
            <Ionicons
              name="search"
              size={18}
              color={type === 'lost' ? '#DC2626' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.typeBtnText, type === 'lost' && styles.typeBtnTextLostActive]}>
              Kehilangan Barang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === 'found' && styles.typeBtnFoundActive]}
            activeOpacity={0.8}
            onPress={() => setType('found')}
          >
            <Ionicons
              name="cube"
              size={18}
              color={type === 'found' ? '#16A34A' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.typeBtnText, type === 'found' && styles.typeBtnTextFoundActive]}>
              Menemukan Barang
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Photo Section */}
          <Text style={styles.cardHeaderTitle}>Foto Barang (Opsional)</Text>
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
                <Ionicons name="trash-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.removeImageText}>Hapus Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageActionRow}>
              <TouchableOpacity
                style={styles.imagePickerBtn}
                onPress={() => pickImage(false)}
              >
                <Ionicons name="images-outline" size={24} color="#2563EB" style={{ marginBottom: 6 }} />
                <Text style={styles.pickerLabel}>Pilih dari Galeri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerBtn}
                onPress={() => pickImage(true)}
              >
                <Ionicons name="camera-outline" size={24} color="#2563EB" style={{ marginBottom: 6 }} />
                <Text style={styles.pickerLabel}>Buka Kamera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama / Judul Barang *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="pricetag-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="misal: Kunci Motor Honda Vario / KTM"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
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
            <Text style={styles.label}>Lokasi Kejadian / Temuan *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="misal: Gedung Kuliah Bersama Lt. 3 / Kantin"
                placeholderTextColor="#94A3B8"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deskripsi & Ciri-Ciri Khusus</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Sebutkan warna, stiker khusus, gantungan kunci, atau detail penting lainnya..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Contact */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kontak yang Dapat Dihubungi</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nomor WhatsApp / ID Telegram"
                placeholderTextColor="#94A3B8"
                value={contactInfo}
                onChangeText={setContactInfo}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <View style={styles.submittingContent}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submittingText}>{statusMessage || 'Menyimpan...'}</Text>
              </View>
            ) : (
              <View style={styles.submittingContent}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Terbitkan Laporan {type === 'lost' ? 'Kehilangan' : 'Temuan'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnLostActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  typeBtnFoundActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeBtnTextLostActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  typeBtnTextFoundActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  imagePickerBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginBottom: 18,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  removeImageBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submittingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  lockIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
