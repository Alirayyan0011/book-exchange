'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from './Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Search,
  Send,
  LogOut,
  Loader2,
  BookOpen,
  User as UserIcon,
  X
} from 'lucide-react';

interface Conversation {
  _id: string;
  bookId: string;
  bookTitle: string;
  interestedUserId: string;
  interestedUserName: string;
  ownerId: string;
  ownerName: string;
  messages: Message[];
  lastMessageAt: Date;
}

interface Message {
  _id?: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
}

const AdminChat = () => {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [adminUser, setAdminUser] = useState({
    name: 'Loading...',
    email: ''
  });

  useEffect(() => {
    if (authUser) {
      setAdminUser({
        name: `${authUser.firstName} ${authUser.lastName}`,
        email: authUser.email
      });
    }
  }, [authUser]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Refresh the conversation to get latest messages
    try {
      const response = await fetch(
        `/api/conversations?bookId=${conversation.bookId}&ownerId=${conversation.ownerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.conversation) {
          setSelectedConversation(data.conversation);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);

    try {
      const response = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookId: selectedConversation.bookId,
          ownerId: selectedConversation.ownerId,
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the selected conversation with the new message
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, data.message],
          lastMessageAt: new Date()
        };
        setSelectedConversation(updatedConversation);

        // Update the conversation in the list
        setConversations(conversations.map(conv =>
          conv._id === selectedConversation._id ? updatedConversation : conv
        ));

        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`;
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      }) + ` at ${timeStr}`;
    }
  };

  const formatLastMessage = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.interestedUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Sidebar */}
      <AdminSidebar
        activeItem="chat"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        {/* Header */}
        <header className="bg-slate-800 shadow-lg border-b border-slate-700">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-white">Messages</h1>
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 font-light">Welcome, {adminUser.name}</span>
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Administrator
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MessageCircle className="h-12 w-12 mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredConversations.map((conversation) => {
                    const otherUserName = authUser?.id === conversation.ownerId
                      ? conversation.interestedUserName
                      : conversation.ownerName;
                    const lastMessage = conversation.messages[conversation.messages.length - 1];

                    return (
                      <button
                        key={conversation._id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                          selectedConversation?._id === conversation._id ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-medium text-slate-900 truncate">
                                {conversation.bookTitle}
                              </h3>
                              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                {formatLastMessage(conversation.lastMessageAt)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-1 flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {otherUserName}
                            </p>
                            {lastMessage && (
                              <p className="text-sm text-slate-500 truncate">
                                {lastMessage.senderId === authUser?.id ? 'You: ' : ''}
                                {lastMessage.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedConversation.bookTitle}
                      </h2>
                      <p className="text-sm text-slate-600">
                        Conversation with{' '}
                        {authUser?.id === selectedConversation.ownerId
                          ? selectedConversation.interestedUserName
                          : selectedConversation.ownerName}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors lg:hidden"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedConversation.messages.map((message, index) => {
                    const isOwn = message.senderId === authUser?.id;
                    const messageKey = message._id || `${message.senderId}-${message.createdAt}-${index}`;

                    return (
                      <div
                        key={messageKey}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isOwn && (
                            <span className="text-xs text-slate-600 mb-1 px-1">
                              {message.senderName}
                            </span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-slate-900 border border-slate-200'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                          </div>
                          <span className="text-xs text-slate-500 mt-1 px-1">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-200 p-4 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-slate-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
