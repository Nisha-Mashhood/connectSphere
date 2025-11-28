import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

import { Contact, formatContact } from "../../../Interface/User/Icontact";
import { getUserContacts } from "../../../Service/Contact.Service";
import { getUnreadMessages } from "../../../Service/Chat.Service";
import { socketService } from "../../../Service/SocketService";

import { useDispatch } from "react-redux";
import {
  setActiveChatKey,
} from "../../../redux/Slice/notificationSlice";
import { setSelectedContact as setSelectedContactRedux } from "../../../redux/Slice/userSlice";

import { useNavigate, useParams } from "react-router-dom";

export const useChatContacts = (currentUserId?: string, getChatKey?: (c: Contact) => string) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type, id } = useParams<{ type?: string; id?: string }>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // FETCH CONTACTS
  const fetchContacts = useCallback(async () => {
    try {
      const data = await getUserContacts();
      const formatted = data.map(formatContact);
      setContacts(formatted);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  }, []);

  // FETCH UNREAD COUNTS (DEBOUNCED)

  const refetchUnreadCounts = useMemo(() => {
    return debounce(async () => {
      if (!currentUserId) return;
      try {
        const data = await getUnreadMessages(currentUserId);
        console.log("unread Messages : ",data);
        setUnreadCounts(data);
      } catch (err) {
        console.error("Error fetching unread counts:", err);
      }
    }, 400);
  }, [currentUserId]);

  // SORT CONTACTS

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const tA = a.lastMessageTimestamp
        ? new Date(a.lastMessageTimestamp).getTime()
        : 0;
      const tB = b.lastMessageTimestamp
        ? new Date(b.lastMessageTimestamp).getTime()
        : 0;

      return tB - tA;
    });
  }, [contacts]);

  // SET INITIAL CONTACT
  const setInitialContact = useCallback(
    (list: Contact[]) => {
      if (!list.length || !getChatKey) return;

      // URL contact
      if (type && id) {
        const contact = list.find(
          (c) => c.type === type && c.id === id
        );
        if (contact) {
          setSelectedContact(contact);
          console.log("Contact selected →", selectedContact);
          const chatKey = getChatKey(contact); 
          dispatch(setActiveChatKey(chatKey));
          dispatch(setSelectedContactRedux(contact));
          socketService.emitActiveChat(currentUserId!, chatKey);
          socketService.markAsRead(chatKey, currentUserId!, contact.type );
          return;
        }
      }

      //Default first contact
      const first = list[0];
      setSelectedContact(first);
      console.log("Contact selected →", selectedContact);
      const chatKey = getChatKey(first);
      dispatch(setActiveChatKey(chatKey));
      dispatch(setSelectedContactRedux(first));
      socketService.emitActiveChat(currentUserId!, chatKey);
      socketService.markAsRead(chatKey, currentUserId!, first.type );
    },
    [type, id, getChatKey, currentUserId, dispatch, selectedContact ]
  );


  // HANDLE CONTACT SELECT
  const handleContactSelect = useCallback(
  (contact: Contact) => {
    if (!getChatKey) return;
    console.log("Contact selected →", contact);
    setSelectedContact(contact);
    const chatKey = getChatKey(contact);
    dispatch(setActiveChatKey(chatKey));
    dispatch(setSelectedContactRedux(contact));
    socketService.emitActiveChat(currentUserId!, chatKey);
    socketService.markAsRead(chatKey, currentUserId!, contact.type);

    setUnreadCounts((prev) => ({
      ...prev,
      [chatKey]: 0,
    }));

    refetchUnreadCounts();
    navigate(`/chat/${contact.type}/${contact.id}`);
  },
  [getChatKey, currentUserId, dispatch, navigate, refetchUnreadCounts]);


  // SOCKET

  useEffect(() => {
    if (!currentUserId) return;

    fetchContacts();
    refetchUnreadCounts();

    const handleContactsUpdated = () => {
      fetchContacts();
      refetchUnreadCounts();
    };

    socketService.onContactsUpdated(handleContactsUpdated);

    return () => {
      socketService.offContactsUpdated(handleContactsUpdated);
      refetchUnreadCounts.cancel();
    };
  }, [currentUserId, fetchContacts, refetchUnreadCounts]);

  return {
    contacts,
    sortedContacts,
    selectedContact,
    setInitialContact,
    handleContactSelect,
    unreadCounts,
    refetchUnreadCounts,
  };
};
