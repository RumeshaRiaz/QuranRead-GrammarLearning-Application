import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  Platform, Switch, ScrollView, TextInput, Modal, Share, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import LogoSVG from '../components/LogoSVG';

const NAME_KEY = '@user_name';

const MENU_ITEMS = [
  { id: 'theme', icon: 'moon', label: 'Dark Mode', labelU: 'ڈارک موڈ', type: 'toggle' },
  { id: 'history', icon: 'clock', label: 'Reading History', labelU: 'تاریخ پڑھائی', type: 'nav' },
  { id: 'font', icon: 'type', label: 'Font Size', labelU: 'فونٹ سائز', type: 'nav' },
  { id: 'share', icon: 'share-2', label: 'Share App', labelU: 'ایپ شیئر کریں', type: 'share' },
];

export default function ProfileScreen({ navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const C = colors;

  const [userName, setUserName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  /* Load saved name */
  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY).then(val => {
      if (val) setUserName(val);
    });
  }, []);

  const openEdit = () => {
    setDraftName(userName);
    setEditModalVisible(true);
  };

  const saveName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      Alert.alert('', 'Please enter your name.');
      return;
    }
    await AsyncStorage.setItem(NAME_KEY, trimmed);
    setUserName(trimmed);
    setEditModalVisible(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Learn the Quran with Noor ul Bayan — a beautiful app for Quran reading & Arabic grammar! 📖✨',
      });
    } catch (_) { }
  };

  return (
    <View style={[s.root, { backgroundColor: C.BG }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.BG} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: C.BG }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: C.CARD, borderColor: C.BORDER }]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={C.TEXT_S} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.TEXT }]}>Profile</Text>
        <Text style={[s.headerTitleU, { color: C.TEXT_S }]}>پروفائل</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar / Name card */}
        <View style={[s.avatarCard, { backgroundColor: C.CARD, borderColor: C.BORDER }]}>
          <View style={[s.avatarGlow, { backgroundColor: C.GOLD + '15' }]} />
          <View style={[s.avatarCircle, { borderColor: C.GOLD + '40' }]}>
            <LogoSVG size={64} isDark={isDark} />
          </View>

          {userName ? (
            /* Name is set */
            <View style={s.nameRow}>
              <Text style={[s.userName, { color: C.TEXT }]}>{userName}</Text>
              <TouchableOpacity onPress={openEdit} style={[s.editBtn, { backgroundColor: C.GOLD + '18', borderColor: C.GOLD + '40' }]}>
                <Feather name="edit-2" size={14} color={C.GOLD} />
                <Text style={[s.editBtnTxt, { color: C.GOLD }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* First time — no name */
            <View style={s.noNameWrap}>
              <Text style={[s.noNameHint, { color: C.TEXT_S }]}>اپنا نام یہاں شامل کریں</Text>
              <TouchableOpacity
                style={[s.addNameBtn, { backgroundColor: C.GOLD, }]}
                onPress={openEdit}
              >
                <Feather name="user-plus" size={15} color={C.BG} />
                <Text style={[s.addNameTxt, { color: C.BG }]}>Add Your Name</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[s.userGreet, { color: C.TEXT_S }]}>السلام علیکم  |  Assalamu Alaikum</Text>
        </View>

        {/* Menu items — each as its own card */}
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.menuCard, { backgroundColor: C.CARD, borderColor: C.BORDER }]}
            activeOpacity={0.75}
            onPress={() => {
              if (item.id === 'theme') toggleTheme();
              else setComingSoonVisible(true);
            }}
          >
            <View style={[s.menuIconBox, { backgroundColor: C.GOLD + '15' }]}>
              <Feather
                name={item.id === 'theme' ? (isDark ? 'moon' : 'sun') : item.icon}
                size={18}
                color={C.GOLD}
              />
            </View>
            <Text style={[s.menuLabel, { color: C.TEXT }]}>{item.label}</Text>
            <Text style={[s.menuLabelU, { color: C.TEXT_S }]}>{item.labelU}</Text>
            <View style={{ flex: 1 }} />
            {item.type === 'toggle' ? (
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: C.GOLD + '50' }}
                thumbColor={isDark ? C.GOLD : '#F3F4F6'}
              />
            ) : (
              <Feather name="chevron-right" size={18} color={C.TEXT_S} />
            )}
          </TouchableOpacity>
        ))}

        <Text style={[s.version, { color: C.TEXT_S }]}>Noor ul Bayan  v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Coming Soon Modal */}
      <Modal
        visible={comingSoonVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setComingSoonVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalBox, { backgroundColor: C.CARD, borderColor: C.BORDER }]}>
            <View style={[s.comingSoonIcon, { backgroundColor: C.GOLD + '18' }]}>
              <Feather name="clock" size={32} color={C.GOLD} />
            </View>
            <Text style={[s.modalTitle, { color: C.TEXT, marginTop: 14 }]}>Coming Soon</Text>
            <Text style={[s.comingSoonDesc, { color: C.TEXT_S }]}>
              We're working on this feature and will bring it to you soon. 🌙
            </Text>
            <TouchableOpacity
              style={[s.modalBtn, s.modalBtnSave, { backgroundColor: C.GOLD, marginTop: 20, flex: undefined, width: '100%' }]}
              onPress={() => setComingSoonVisible(false)}
            >
              <Text style={[s.modalBtnTxt, { color: C.BG, fontWeight: '700' }]}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalBox, { backgroundColor: C.CARD, borderColor: C.BORDER }]}>
            <Text style={[s.modalTitle, { color: C.TEXT }]}>اپنا نام درج کریں</Text>
            <Text style={[s.modalSubtitle, { color: C.TEXT_S }]}>Enter Your Name</Text>

            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your Name"
              placeholderTextColor={C.TEXT_S}
              style={[s.nameInput, { color: C.TEXT, borderColor: C.BORDER, backgroundColor: C.BG }]}
              autoFocus
              maxLength={30}
            />

            <View style={s.modalButtons}>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: C.BG, borderColor: C.BORDER }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[s.modalBtnTxt, { color: C.TEXT_S }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSave, { backgroundColor: C.GOLD }]}
                onPress={saveName}
              >
                <Text style={[s.modalBtnTxt, { color: C.BG, fontWeight: '700' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14, gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  headerTitleU: { fontSize: 16 },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  /* Avatar card */
  avatarCard: {
    borderRadius: 24, borderWidth: 1,
    padding: 24, alignItems: 'center',
    marginBottom: 20, overflow: 'hidden',
  },
  avatarGlow: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  userName: { fontSize: 22, fontWeight: '700' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  editBtnTxt: { fontSize: 13, fontWeight: '600' },

  noNameWrap: { alignItems: 'center', marginBottom: 8, gap: 8 },
  noNameHint: { fontSize: 14 },
  addNameBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9,
  },
  addNameTxt: { fontSize: 14, fontWeight: '700' },

  userGreet: { fontSize: 13, marginTop: 6 },

  /* Sections */
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 10, paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionTitleU: { fontSize: 14 },

  menuCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 16,
    gap: 12, marginBottom: 12,
  },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  menuLabelU: { fontSize: 15 },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    width: '100%', borderRadius: 24, borderWidth: 1,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
  nameInput: {
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnSave: { borderWidth: 0 },
  modalBtnTxt: { fontSize: 15 },

  comingSoonIcon: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  comingSoonDesc: {
    fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 4,
  },

  version: { textAlign: 'center', fontSize: 13, marginTop: 8, opacity: 0.6 },
});
