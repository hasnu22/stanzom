import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Linking,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface StanzomContact {
  userId: string;
  name: string;
  username: string;
  accuracy: number;
}

interface ExternalContact {
  name: string;
  phoneNumber: string;
}

interface ContactsListProps {
  onStanzom: StanzomContact[];
  notYet: ExternalContact[];
  onAdd: (userId: string) => void;
  onInvite: (phoneNumber: string) => void;
}

type SectionItem = StanzomContact | ExternalContact;

const isStanzomContact = (item: SectionItem): item is StanzomContact =>
  'userId' in item;

const ContactsList: React.FC<ContactsListProps> = ({
  onStanzom,
  notYet,
  onAdd,
  onInvite,
}) => {
  const sections = [
    {
      title: 'Already on Stanzom',
      data: onStanzom as SectionItem[],
      type: 'stanzom' as const,
    },
    {
      title: 'Not on Stanzom yet',
      data: notYet as SectionItem[],
      type: 'external' as const,
    },
  ];

  const renderItem = ({
    item,
    section,
  }: {
    item: SectionItem;
    section: (typeof sections)[number];
  }) => {
    if (section.type === 'stanzom' && isStanzomContact(item)) {
      const initial = item.name?.charAt(0)?.toUpperCase() || '?';
      return (
        <View style={styles.row}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{initial}</Text>
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.checkMark}>{'\u2705'}</Text>
            </View>
            <Text style={styles.username}>
              @{item.username} {'\u00B7'} {item.accuracy}% accuracy
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAdd(item.userId)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ ADD</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!isStanzomContact(item)) {
      const initial = item.name?.charAt(0)?.toUpperCase() || '?';
      return (
        <View style={styles.row}>
          <View style={[styles.avatarSmall, styles.avatarExternal]}>
            <Text style={styles.avatarSmallText}>{initial}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.phone}>{item.phoneNumber}</Text>
          </View>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => onInvite(item.phoneNumber)}
            activeOpacity={0.7}
          >
            <Text style={styles.inviteButtonText}>
              {'\uD83D\uDCAC'} INVITE
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: (typeof sections)[number];
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) =>
        isStanzomContact(item) ? item.userId : `ext-${index}`
      }
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 10,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    color: Colors.muted,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarExternal: {
    backgroundColor: Colors.muted,
  },
  avatarSmallText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 12,
  },
  username: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  phone: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.green,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '700',
  },
  inviteButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inviteButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ContactsList;
