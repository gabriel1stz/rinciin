// chat.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import { ChatRequestPayload, ChatResponse } from '../types/chat';

export const chatService = {
  sendMessage: async (payload: ChatRequestPayload): Promise<ChatResponse> => {
    const res = await api.post<ApiResponse<ChatResponse>>('/chat', payload);
    return res.data.data;
  },
};
