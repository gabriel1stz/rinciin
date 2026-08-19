// AiAssistantPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Copy, Check, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../hooks/useAI';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { formatRelativeDateId } from '../utils/date';
import { containerStagger, itemFadeUp } from '../motion/variants';

const QUICK_PROMPTS = [
  'Laporan pengeluaran bulan ini',
  'Cek saldo dompet saya',
  'Kategori apa yang paling boros?',
  'Sisa anggaran makan',
  'Bantuan perintah yang bisa digunakan',
];

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userPhone = user?.phone || '';
  const userName = user?.name || undefined;

  const { messages, sendMessage, isLoading } = useAI(userPhone, userName);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const msg = inputText.trim();
    setInputText('');
    await sendMessage(msg);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Tersalin', 'Pesan berhasil disalin ke papan klip');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={itemFadeUp}>
        <PageHeader
          title="AI Asisten Keuangan"
          subtitle="Asisten cerdas berbasis NLP untuk mencatat transaksi, memantau budget, dan menjawab pertanyaan finansialmu"
        />
      </motion.div>

      {/* Main Chat Layout */}
      <motion.div variants={itemFadeUp} className="ai-chat-layout">
        {/* Messages List Area */}
        <div className="ai-messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--accent-500), var(--primary-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={16} />
                </div>
              )}

              <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                <div
                  className="flex items-center justify-between gap-4"
                  style={{
                    marginTop: 'var(--space-2)',
                    fontSize: '0.7rem',
                    opacity: 0.75,
                  }}
                >
                  <span>{formatRelativeDateId(msg.createdAt)}</span>
                  {msg.sender === 'ai' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      aria-label="Salin pesan"
                      style={{ padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                  }}
                >
                  <UserIcon size={16} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--accent-500), var(--primary-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Bot size={16} />
              </div>
              <div className="chat-bubble chat-bubble-ai animate-pulse">
                Sedang memproses dan menganalisis data keuangan...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: '0 var(--space-6) var(--space-3)' }}>
          <div className="quick-prompts-list">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="quick-prompt-btn"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="ai-input-area">
          <input
            type="text"
            className="form-input"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.25rem' }}
            placeholder="Ketik pertanyaan atau catat pengeluaran (cth: 'Makan siang 35rb')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            className="btn-icon"
            style={{ borderRadius: 'var(--radius-full)', width: '2.75rem', height: '2.75rem' }}
            disabled={!inputText.trim() || isLoading}
            isLoading={isLoading}
            aria-label="Kirim Pesan"
          >
            <Send size={16} />
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};
