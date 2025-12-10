import api from './api';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  message: string;
  conversationLength: number;
}

class ChatService {
  async sendMessage(activityId: string, message: string): Promise<string> {
    const response = await api.post<ChatResponse>(`/chat/${activityId}/message`, {
      message
    });
    return response.data.message;
  }

  async clearConversation(activityId: string): Promise<void> {
    await api.delete(`/chat/${activityId}/clear`);
  }

  async getConversationHistory(activityId: string): Promise<ChatMessage[]> {
    const response = await api.get<{ history: ChatMessage[] }>(`/chat/${activityId}/history`);
    return response.data.history;
  }
}

export const chatService = new ChatService();
