// useAI.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { ChatMessage } from '../types/chat';

export function useAI(userPhone: string, userName?: string) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Halo${userName ? ` ${userName}` : ''}! 👋 Saya asisten keuangan Rinci.in. Ada yang bisa saya bantu terkait transaksi, sisa anggaran, atau saldo dompetmu?`,
      createdAt: new Date().toISOString(),
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: (messageText: string) =>
      chatService.sendMessage({
        message: messageText,
        phone: userPhone,
        name: userName,
      }),
    onSuccess: (data) => {
      const responseText = data.text || 'Maaf, saya tidak mengerti maksud pesan tersebut.';
      const newAiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'ai',
        text: responseText,
        createdAt: new Date().toISOString(),
        data,
      };
      setMessages((prev) => [...prev, newAiMsg]);

      // If action affected transactions or wallets, invalidate query
      if (data.type === 'TRANSACTION_SAVED' || data.wallets) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
    onError: (err: any) => {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'ai',
        text: `Terjadi kesalahan: ${err.message || 'Gagal memproses pesan'}. Coba lagi nanti.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    await chatMutation.mutateAsync(text.trim());
  };

  return {
    messages,
    sendMessage,
    isLoading: chatMutation.isPending,
  };
}
