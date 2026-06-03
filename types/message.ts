export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'payment';
  read: boolean;
  delivered: boolean;
  timestamp: Date;
  replyTo?: Message;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  }[];
  lastMessage: Message;
  unreadCount: number;
  pinned: boolean;
  archived: boolean;
}