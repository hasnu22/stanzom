import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import {
  getSettings,
  updateSettings,
  NotificationSettings,
} from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import BebasText from '../../components/ui/BebasText';
import Constants from 'expo-constants';

interface ProfileForm {
  name: string;
  username: string;
  city: string;
  state: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState<ProfileForm>({
    name: user?.name ?? '',
    username: user?.username ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
  });

  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    predictionAlerts: true,
    eventAlerts: true,
    prizeAlerts: true,
    socialAlerts: true,
  });

  // Sync profile form when user data loads
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? '',
        username: user.username ?? '',
        city: user.city ?? '',
        state: user.state ?? '',
      });
    }
  }, [user]);

  const notifSettingsQuery = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data } = await getSettings();
      return data as any;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  });

  useEffect(() => {
    if (notifSettingsQuery.data) {
      setNotifications({
        pushEnabled: notifSettingsQuery.data.pushEnabled ?? true,
        predictionAlerts: notifSettingsQuery.data.predictionReminders ?? true,
        eventAlerts: notifSettingsQuery.data.matchAlerts ?? true,
        prizeAlerts: notifSettingsQuery.data.promotions ?? true,
        socialAlerts: notifSettingsQuery.data.socialUpdates ?? true,
      });
    }
  }, [notifSettingsQuery.data]);

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await api.put('/api/users/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      Alert.alert('Saved', 'Profile updated successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });

  const notifMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      const response = await updateSettings(settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await notifSettingsQuery.refetch();
    setRefreshing(false);
  }, [notifSettingsQuery]);

  const updateProfileField = (field: keyof ProfileForm, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotifToggle = (
    key: string,
    value: boolean,
    settingsKey: keyof NotificationSettings,
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    notifMutation.mutate({ [settingsKey]: value });
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.text}>
          SETTINGS
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.gold}>
            Profile
          </BebasText>

          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(v) => updateProfileField('name', v)}
              placeholder="Your name"
              placeholderTextColor={Colors.muted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={profile.username}
              onChangeText={(v) => updateProfileField('username', v)}
              placeholder="@username"
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={profile.city}
                onChangeText={(v) => updateProfileField('city', v)}
                placeholder="City"
                placeholderTextColor={Colors.muted}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={profile.state}
                onChangeText={(v) => updateProfileField('state', v)}
                placeholder="State"
                placeholderTextColor={Colors.muted}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => profileMutation.mutate(profile)}
            disabled={profileMutation.isPending}
            activeOpacity={0.7}
          >
            {profileMutation.isPending ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <BebasText size={18} color={Colors.bg}>
                Save Profile
              </BebasText>
            )}
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.gold}>
            Notifications
          </BebasText>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Text style={styles.toggleDesc}>Enable all push notifications</Text>
            </View>
            <Switch
              value={notifications.pushEnabled}
              onValueChange={(v) =>
                handleNotifToggle('pushEnabled', v, 'matchAlerts')
              }
              trackColor={{ false: Colors.cardBorder, true: Colors.gold }}
              thumbColor={notifications.pushEnabled ? Colors.bg : Colors.muted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Prediction Alerts</Text>
              <Text style={styles.toggleDesc}>
                Reminders before prediction deadlines
              </Text>
            </View>
            <Switch
              value={notifications.predictionAlerts}
              onValueChange={(v) =>
                handleNotifToggle('predictionAlerts', v, 'predictionReminders')
              }
              trackColor={{ false: Colors.cardBorder, true: Colors.gold }}
              thumbColor={
                notifications.predictionAlerts ? Colors.bg : Colors.muted
              }
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Event Alerts</Text>
              <Text style={styles.toggleDesc}>
                Match start, live score updates
              </Text>
            </View>
            <Switch
              value={notifications.eventAlerts}
              onValueChange={(v) =>
                handleNotifToggle('eventAlerts', v, 'matchAlerts')
              }
              trackColor={{ false: Colors.cardBorder, true: Colors.gold }}
              thumbColor={
                notifications.eventAlerts ? Colors.bg : Colors.muted
              }
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Prize Alerts</Text>
              <Text style={styles.toggleDesc}>
                Daily prize winners, reward milestones
              </Text>
            </View>
            <Switch
              value={notifications.prizeAlerts}
              onValueChange={(v) =>
                handleNotifToggle('prizeAlerts', v, 'promotions')
              }
              trackColor={{ false: Colors.cardBorder, true: Colors.gold }}
              thumbColor={
                notifications.prizeAlerts ? Colors.bg : Colors.muted
              }
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Social Alerts</Text>
              <Text style={styles.toggleDesc}>
                Follows, likes, fan room activity
              </Text>
            </View>
            <Switch
              value={notifications.socialAlerts}
              onValueChange={(v) =>
                handleNotifToggle('socialAlerts', v, 'socialUpdates')
              }
              trackColor={{ false: Colors.cardBorder, true: Colors.gold }}
              thumbColor={
                notifications.socialAlerts ? Colors.bg : Colors.muted
              }
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>App Version</Text>
            <Text style={styles.appInfoValue}>{appVersion}</Text>
          </View>
        </View>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteLink}
          onPress={() =>
            Alert.alert(
              'Delete Account',
              'Please contact support@stanzom.com to delete your account.',
            )
          }
          activeOpacity={0.7}
        >
          <Text style={styles.deleteLinkText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 28,
  },
  field: {
    marginBottom: 14,
    marginTop: 6,
  },
  label: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  toggleDesc: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  appInfoLabel: {
    color: Colors.text,
    fontSize: 15,
  },
  appInfoValue: {
    color: Colors.muted,
    fontSize: 15,
  },
  deleteLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  deleteLinkText: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: '600',
  },
});
