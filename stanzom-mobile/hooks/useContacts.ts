import { useCallback, useState } from 'react';
import * as Contacts from 'expo-contacts';
import api from '../services/api';

interface ContactResult {
  onStanzom: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    avatarUrl?: string;
    userId?: string;
  }>;
  notYet: Array<{
    name: string;
    phoneNumber: string;
  }>;
}

export const useContacts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContactsForRoom = useCallback(async (roomId: string): Promise<ContactResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Contacts permission denied');
        return { onStanzom: [], notYet: [] };
      }

      const { data: contacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      const phoneNumbers: string[] = [];
      const phoneToName: Record<string, string> = {};

      contacts.forEach((contact) => {
        if (contact.phoneNumbers) {
          contact.phoneNumbers.forEach((pn) => {
            if (pn.number) {
              const cleaned = pn.number.replace(/[\s\-()]/g, '');
              phoneNumbers.push(cleaned);
              phoneToName[cleaned] = contact.name || 'Unknown';
            }
          });
        }
      });

      if (phoneNumbers.length === 0) {
        return { onStanzom: [], notYet: [] };
      }

      const res = await api.post(`/api/fanrooms/${roomId}/contacts/check`, {
        phoneNumbers,
      });
      const data = res.data.data ?? res.data;

      const onStanzom = (data.onStanzom || []).map((entry: any) => ({
        ...entry,
        name: entry.name || phoneToName[entry.phoneNumber] || 'Unknown',
      }));

      const matchedNumbers = new Set(onStanzom.map((e: any) => e.phoneNumber));
      const notYet = phoneNumbers
        .filter((pn) => !matchedNumbers.has(pn))
        .map((pn) => ({
          name: phoneToName[pn] || 'Unknown',
          phoneNumber: pn,
        }));

      return { onStanzom, notYet };
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      return { onStanzom: [], notYet: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getContactsForRoom, isLoading, error };
};
