'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ArrowLeft, Loader2 } from 'lucide-react';

interface BookOwner {
  id: string;
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  images: string[];
  owner: BookOwner;
}

interface Message {
  _id?: string;
  id?: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
}

interface ChatModalProps {
  book: Book;
  currentUserId: string;
  currentUserName: string;
  onClose: () => void;
  onBack: () => void;
}

export default function ChatModal({
  book,
  currentUserId,
  currentUserName,
  onClose,
  onBack
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [book.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations?bookId=${book.id}&ownerId=${book.owner.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.conversation) {
        setMessages(data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: book.id,
          ownerId: book.owner.id,
          message: newMessage.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add the new message to the list
        const message: Message = {
          id: data.message._id || Date.now().toString(),
          senderId: currentUserId,
          senderName: currentUserName,
          message: newMessage.trim(),
          createdAt: new Date()
        };

        setMessages([...messages, message]);
        setNewMessage('');
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <img
                src={book.images[0]}
                alt={book.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{book.title}</h2>
                <p className="text-sm text-slate-600">Chat with {book.owner.name}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Start the conversation</h3>
                <p className="text-slate-600 text-sm">
                  Send a message to {book.owner.name} about "{book.title}"
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const messageKey = message._id || message.id || `${message.senderId}-${message.createdAt}-${index}`;
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
                            ? 'bg-slate-800 text-white'
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
            </>
          )}
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
                placeholder={`Message ${book.owner.name}...`}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-sm"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-slate-800 text-white p-3 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
      </div>
    </div>
  );
}
