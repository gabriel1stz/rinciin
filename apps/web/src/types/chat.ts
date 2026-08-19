// chat.ts
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
  data?: any;
}

export interface ChatRequestPayload {
  message: string;
  phone: string;
  name?: string;
}

export interface ChatResponse {
  type?: string;
  text?: string;
  result?: any;
  transactions?: any[];
  wallets?: any[];
  budget?: any;
}
