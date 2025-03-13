import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { formatDistanceToNow } from 'date-fns';
import { ChatUser, User } from '../types/user';
import { MessageSquare } from 'lucide-react';

interface ChatListProps {
  searchQuery: string;
}

interface FirebaseMessage {
  content: string;
  timestamp: number;
  read: boolean;
  sender_id: string;
}

const ChatList: React.FC<ChatListProps> = ({ searchQuery }) => {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Reference to all users
    const usersRef = ref(database, 'users');
    
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (!usersData) return;

      // Filter users of opposite gender
      const filteredUsers = Object.values(usersData)
        .filter((userData: unknown): userData is User => {
          const typedUser = userData as User;
          return typedUser.gender !== user.gender;
        })
        .map((userData) => ({
          ...userData,
          isOnline: false,
          lastMessage: undefined
        }));

      setChatUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
      // Set up listeners for online status and messages for each user
      filteredUsers.forEach((chatUser: ChatUser) => {
        // Listen for online status
        const statusRef = ref(database, `status/${chatUser.id}`);
        onValue(statusRef, (statusSnapshot) => {
          const statusData = statusSnapshot.val();
          const updateUserStatus = (u: ChatUser) => 
            u.id === chatUser.id 
              ? { ...u, isOnline: statusData?.isOnline || false }
              : u;
          
          setChatUsers(prev => prev.map(updateUserStatus));
          setFilteredUsers(prev => prev.map(updateUserStatus));
        });

        // Listen for last message
        const chatId = [user.id, chatUser.id].sort().join('_');
        const messagesRef = ref(database, `messages/${chatId}`);
        onValue(messagesRef, (messagesSnapshot) => {
          const messagesData = messagesSnapshot.val();
          if (messagesData) {
            const messages = Object.values(messagesData) as FirebaseMessage[];
            const lastMessage = messages.reduce((latest, current) => 
              !latest || current.timestamp > latest.timestamp ? current : latest
            );

            if (lastMessage) {
              const updateUserMessage = (u: ChatUser) => 
                u.id === chatUser.id 
                  ? {
                      ...u,
                      lastMessage: {
                        content: lastMessage.content,
                        timestamp: lastMessage.timestamp,
                        isRead: lastMessage.read || lastMessage.sender_id === user.id
                      }
                    }
                  : u;

              setChatUsers(prev => prev.map(updateUserMessage));
              setFilteredUsers(prev => prev.map(updateUserMessage));
            }
          }
        });
      });

      setIsLoading(false);
    });

    return () => {
      unsubscribeUsers();
    };
  }, [user]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(chatUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chatUsers.filter(user => 
      // Update search to prioritize username instead of full_name
      user.username.toLowerCase().includes(query) ||
      user.branch.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, chatUsers]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (chatUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={24} className="text-indigo-500" />
        </div>
        <p className="text-center font-medium">No users found</p>
        <p className="text-center text-sm mt-2">
          {user?.gender === 'Male' 
            ? 'There are no female users registered yet' 
            : 'There are no male users registered yet'}
        </p>
      </div>
    );
  }

  // Inside the render function where users are displayed
  return (
    <div className="divide-y divide-gray-100">
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading chats...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-20 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No chats found</p>
        </div>
      ) : (
        filteredUsers.map((chatUser) => (
          <Link
            key={chatUser.id}
            to={`/chat/${chatUser.id}`}
            className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {chatUser.username.charAt(0)}
              </div>
              {chatUser.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-medium text-gray-900 truncate">{chatUser.username}</h3>
                {chatUser.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(chatUser.lastMessage.timestamp), { addSuffix: true })}
                  </span>
                )}
              </div>
              {chatUser.lastMessage && (
                <p className="text-sm text-gray-500 truncate">
                  {chatUser.lastMessage.content}
                </p>
              )}
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default ChatList;