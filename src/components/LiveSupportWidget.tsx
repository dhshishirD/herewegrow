import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Zap, 
  ExternalLink, 
  Phone, 
  CheckCheck,
  ChevronDown,
  HelpCircle,
  ShoppingBag,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { getLocalOrders, getLocalWallet } from '../services/growthService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  time: string;
  actionButton?: {
    label: string;
    action: 'whatsapp' | 'orders' | 'wallet';
  };
}

const SUPPORT_STORAGE_KEY = 'herewegrow_support_whatsapp_num';

export const LiveSupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem(SUPPORT_STORAGE_KEY) || '8801700000000';
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'quick_contact'>('chat');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: '👋 আসসালামু আলাইকুম! Welcome to HereWeGrow Support Desk. How can we assist your social growth today?',
      time: 'Just now'
    },
    {
      id: 'welcome-2',
      sender: 'bot',
      text: 'You can chat here directly, or click below for instant 1-on-1 WhatsApp assistance with our team.',
      time: 'Just now',
      actionButton: {
        label: '💬 Chat on WhatsApp (+880)',
        action: 'whatsapp'
      }
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const openWhatsAppWithCustomText = (customText?: string) => {
    const orders = getLocalOrders();
    const latestOrder = orders[0];
    
    let defaultMsg = 'Hello HereWeGrow Support, I need help with social growth services.';
    if (latestOrder) {
      defaultMsg = `Hello HereWeGrow Support, I have a question regarding Order #${latestOrder.id} (${latestOrder.serviceName} - Link: ${latestOrder.link}).`;
    }

    const textToSend = customText || defaultMsg;
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputText.trim().toLowerCase();
    setInputText('');
    setIsTyping(true);

    // Smart Automated Response logic
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Thank you for your message! Our team is reviewing this right now.';
      let actionBtn: ChatMessage['actionButton'] = { label: 'Connect on WhatsApp', action: 'whatsapp' };

      if (query.includes('order') || query.includes('status') || query.includes('track') || query.includes('অর্ডার')) {
        const orders = getLocalOrders();
        if (orders.length > 0) {
          const o = orders[0];
          replyText = `Your latest order #${o.id} (${o.serviceName}) is currently "${o.status.toUpperCase()}". You can monitor live start counts in the Track Orders section.`;
          actionBtn = { label: 'View Orders Tracker', action: 'orders' };
        } else {
          replyText = 'You do not have any active orders saved on this device. Once you place an order, live tracking appears instantly in the Track Orders tab.';
        }
      } else if (query.includes('bkash') || query.includes('payment') || query.includes('nagad') || query.includes('টাকা') || query.includes('পেমেন্ট')) {
        replyText = 'We accept automated instant bKash, Nagad, Rocket, Cards via Paymently, and Binance Pay (0% fee). If you paid but were not redirected, use the "Verify Trx" tool in the Wallet modal!';
        actionBtn = { label: 'Open Wallet & Verify', action: 'wallet' };
      } else if (query.includes('cheap') || query.includes('chef') || query.includes('sosta') || query.includes('সস্তা') || query.includes('কম দাম')) {
        replyText = 'We have ultra-budget services starting from only ৳8/1k (Telegram views), ৳10/1k (TikTok views), ৳12/1k (IG views), and ৳15/1k (FB reels). Select the "🔥 Ultra Cheap" filter in the store!';
      } else if (query.includes('refill') || query.includes('drop') || query.includes('গ্যারান্টি')) {
        replyText = 'All non-drop services come with 30-Day, 60-Day, or 365-Day Auto-Refill protection. If any drop occurs, click the "Refill" button in Track Orders for automatic top-up!';
        actionBtn = { label: 'Check Orders & Refills', action: 'orders' };
      } else {
        replyText = `For immediate 1-on-1 assistance with our Dhaka support team, you can continue directly on WhatsApp!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'agent',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButton: actionBtn
        }
      ]);
    }, 900);
  };

  const handleActionClick = (action: 'whatsapp' | 'orders' | 'wallet') => {
    if (action === 'whatsapp') {
      openWhatsAppWithCustomText();
    } else if (action === 'orders') {
      window.location.hash = '#orders';
      const ordersTabBtn = document.querySelector('[data-tab="orders"]') as HTMLButtonElement;
      if (ordersTabBtn) ordersTabBtn.click();
      setIsOpen(false);
    } else if (action === 'wallet') {
      const depositBtn = document.querySelector('[data-action="open-wallet"]') as HTMLButtonElement;
      if (depositBtn) depositBtn.click();
      setIsOpen(false);
    }
  };

  const quickQuestions = [
    '📦 Where is my order?',
    '💰 Payment verification help',
    '🇧🇩 Best Facebook services',
    '🛡️ How does auto-refill work?'
  ];

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
        {/* Pulsing Chat Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Live Support"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-950 hover:bg-indigo-600 text-white shadow-2xl border border-slate-700/80 hover:border-indigo-400 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {/* WhatsApp Green Dot / Status */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>

          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold tracking-tight hidden sm:inline">
              Instant Support
            </span>
          </div>

          {/* Unread Message Badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Live Support Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-w-[420px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fadeIn font-sans">
          
          {/* Header */}
          <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight text-white font-serif">HereWeGrow Desk</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    24/7 Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  Typical response: <strong className="text-emerald-400 font-bold">1 - 2 mins</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Direct WhatsApp Banner */}
          <div className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 flex items-center justify-between transition-colors shadow-inner cursor-pointer"
            onClick={() => openWhatsAppWithCustomText()}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <span className="text-xs font-bold">Direct WhatsApp Chat Available</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold opacity-90">
              <span>Open</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p className="font-normal">{msg.text}</p>
                    
                    {/* Action Button inside message if any */}
                    {msg.actionButton && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.actionButton!.action)}
                        className="mt-2.5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>{msg.actionButton.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1 font-mono">{msg.time}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 max-w-[120px] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse delay-200"></span>
                <span className="text-[10px] text-slate-400 font-medium ml-1">Typing...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(q.replace(/^[^\s]+\s/, ''));
                }}
                className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or type order #..."
              className="flex-1 bg-slate-50 focus:bg-white text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 p-2.5 outline-none transition-all shadow-2xs"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                inputText.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
