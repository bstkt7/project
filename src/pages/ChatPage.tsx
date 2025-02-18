import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

const STORAGE_KEY = 'chat_user_name';

export function ChatPage() {
  const [userName, setUserName] = useState(() => {
    // Пытаемся получить сохраненное имя из localStorage
    const savedName = localStorage.getItem(STORAGE_KEY);
    return savedName || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Автоматически аутентифицируем, если имя уже сохранено
    return !!localStorage.getItem(STORAGE_KEY);
  });
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const subscriptionRef = useRef<any>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      setupSubscription();
    }

    // Очистка подписки при размонтировании
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      setIsScrolledToBottom(isBottom);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(prev => {
      // Если сообщения уже загружены, добавляем только новые
      if (prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        const newMessages = data?.filter(msg => 
          new Date(msg.created_at) > new Date(lastMessage.created_at)
        ) || [];
        return [...prev, ...newMessages].slice(-200);
      }
      return data || [];
    });
  };

  const setupSubscription = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const subscription = supabase
      .channel('chat_messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          setMessages(prev => {
            // Проверяем, нет ли уже такого сообщения
            const messageExists = prev.some(msg => 
              msg.id === newMessage.id || 
              (msg.id.startsWith('temp-') && 
               msg.content === newMessage.content && 
               msg.user_name === newMessage.user_name)
            );

            if (!messageExists) {
              const updatedMessages = [...prev, newMessage].slice(-200);
              // Прокручиваем вниз только если уже были внизу
              if (isScrolledToBottom) {
                setTimeout(scrollToBottom, 100);
              }
              return updatedMessages;
            }
            return prev;
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to chat messages');
        }
      });

    subscriptionRef.current = subscription;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      // Сохраняем имя в localStorage
      localStorage.setItem(STORAGE_KEY, userName.trim());
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Пожалуйста, введите имя');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setUserName('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (message.length > 1000) {
      setError('Сообщение не может быть длиннее 1000 символов');
      return;
    }

    try {
      const tempId = 'temp-' + Date.now();
      const messageContent = message.trim();
      
      // Оптимистичное обновление UI
      const tempMessage = {
        id: tempId,
        user_name: userName,
        content: messageContent,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      setMessage('');
      setShowEmojiPicker(false);
      setError('');
      setIsScrolledToBottom(true);
      scrollToBottom();

      // Отправка сообщения на сервер
      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert([{
          user_name: userName,
          content: messageContent
        }]);

      if (sendError) {
        console.error('Error sending message:', sendError);
        setError('Ошибка отправки сообщения');
        // Удаляем временное сообщение в случае ошибки
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError('Произошла ошибка при отправке сообщения');
    }
  };

  const addEmoji = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
  };

  // Добавим эффект для переподключения при потере соединения
  useEffect(() => {
    let handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        fetchMessages();
        setupSubscription();
      }
    };

    let handleOnline = () => {
      if (isAuthenticated) {
        fetchMessages();
        setupSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Вход в чат</h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Введите ваше имя"
                className="w-full px-4 py-2 rounded border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                type="submit"
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Войти
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Чат ({userName})</h2>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded"
            >
              Выйти
            </button>
          </div>
          <div className="h-[600px] flex flex-col">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4"
              onScroll={handleScroll}
            >
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.user_name === userName ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.user_name === userName
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">{msg.user_name}</p>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {!isScrolledToBottom && messages.length > 0 && (
              <button
                onClick={() => {
                  setIsScrolledToBottom(true);
                  scrollToBottom();
                }}
                className="absolute bottom-24 right-8 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors"
                title="Прокрутить вниз"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
            )}

            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="relative flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="w-full px-4 py-2 rounded border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={2}
                    maxLength={1000}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
                  >
                    <Smile size={20} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <Picker
                        data={data}
                        onEmojiSelect={addEmoji}
                        theme="light"
                        locale="ru"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
                >
                  Отправить
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <p className="text-gray-500 text-sm mt-2">
                {message.length}/1000 символов
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 