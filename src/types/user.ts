export interface User {
  id: string;
  full_name: string;
  username: string;
  gender: 'Male' | 'Female';
  branch: string;
  email: string;
  created_at: string;
  last_seen: string;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface ChatUser extends User {
  isOnline: boolean;
  lastMessage?: {
    content: string;
    timestamp: number;
    isRead: boolean;
  };
}