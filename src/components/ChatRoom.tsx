import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { database } from '../lib/firebase';
import { ref, push, onValue, update, serverTimestamp } from 'firebase/database';
import { User, Message } from '../types/user';
import { ArrowLeft, Send, Smile, MessageSquare } from 'lucide-react';

interface FirebaseMessage {
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: number;
  read: boolean;
}

const ChatRoom: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerIsOnline, setPartnerIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (!user || !userId) return;

    // Fetch chat partner from Firebase
    const userRef = ref(database, `users/${userId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (!userData) {
        console.error('User not found');
        navigate('/chat');
        return;
      }
      setChatPartner(userData as User);
    });

    // Listen for messages between the two users
    const chatId = [user.id, userId].sort().join('_');
    const messagesRef = ref(database, `messages/${chatId}`);
    
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList: Message[] = Object.entries<FirebaseMessage>(data).map(([key, value]) => ({
          id: key,
          sender_id: value.sender_id,
          receiver_id: value.receiver_id,
          content: value.content,
          timestamp: value.timestamp,
          read: value.read
        }));
        
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
        
        messageList.forEach(msg => {
          if (msg.receiver_id === user.id && !msg.read) {
            update(ref(database, `messages/${chatId}/${msg.id}`), {
              read: true
            });
          }
        });
      }
      setIsLoading(false);
    });

    // Listen for typing status
    const typingRef = ref(database, `typing/${chatId}/${userId}`);
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      const typingData = snapshot.val();
      setIsTyping(typingData?.isTyping || false);
    });

    // Listen for online status
    const statusRef = ref(database, `status/${userId}`);
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const statusData = snapshot.val();
      setPartnerIsOnline(statusData?.isOnline || false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeStatus();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userId || !chatPartner) return;

    const chatId = [user.id, userId].sort().join('_');
    const messagesRef = ref(database, `messages/${chatId}`);
    
    await push(messagesRef, {
      sender_id: user.id,
      receiver_id: userId,
      content: newMessage,
      timestamp: Date.now(),
      read: false
    });

    const typingRef = ref(database, `typing/${chatId}/${user.id}`);
    await update(typingRef, {
      isTyping: false,
      timestamp: serverTimestamp()
    });

    setNewMessage('');
    setShowEmoji(false);
  };

  const handleTyping = () => {
    if (!user || !userId) return;

    const chatId = [user.id, userId].sort().join('_');
    const typingRef = ref(database, `typing/${chatId}/${user.id}`);
    
    update(typingRef, {
      isTyping: true,
      timestamp: serverTimestamp()
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      update(typingRef, {
        isTyping: false,
        timestamp: serverTimestamp()
      });
    }, 2000);
  };

  const formatMessageDate = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    }) + ', ' + messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="text-center py-8">
        <p>User not found</p>
        <button 
          onClick={() => navigate('/chat')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Chat List
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center shadow-sm">
        <button 
          onClick={() => navigate('/chat')}
          className="p-1 rounded-full hover:bg-gray-100 mr-3"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        {chatPartner && (
          <div className="flex items-center flex-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3">
              {chatPartner.username.charAt(0)}
            </div>
            <div>
              <h2 className="font-medium text-gray-900">{chatPartner.username}</h2>
              <p className="text-xs text-gray-500">
                {partnerIsOnline ? (
                  <span className="flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    Online
                  </span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation with {chatPartner?.username}</p>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => {
              const isCurrentUser = message.sender_id === user?.id;
              const showDateHeader = index === 0 || 
                new Date(messages[index-1].timestamp).toDateString() !== new Date(message.timestamp).toDateString();
              
              return (
                <React.Fragment key={message.id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {new Date(message.timestamp).toLocaleDateString([], {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  <div 
                    className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl ${
                        isCurrentUser 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`text-xs mt-1 flex justify-between items-center ${
                        isCurrentUser ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        <span>{formatMessageDate(message.timestamp)}</span>
                        {isCurrentUser && (
                          <span className="flex items-center">
                            {message.read ? 
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 12L7 17L17 7M7 12L12 17L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg> : 
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 12L7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            }
                            {message.read ? 'Seen' : 'Sent'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 mx-2"
          >
            <Smile size={20} />
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        {showEmoji && (
          <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="grid grid-cols-8 gap-2">
              {['😊', '😂', '❤️', '👍', '🎉', '🔥', '👋', '😎'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewMessage(prev => prev + emoji)}
                  className="text-2xl hover:bg-gray-100 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatRoom;