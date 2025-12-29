import { ChatMessage, UserRole } from '../types';

type MessageCallback = (bookingId: string, message: ChatMessage) => void;

class MockSocketService {
  private callbacks: MessageCallback[] = [];

  connect() {
    console.log('Connected to Real-time Chat Server (Simulated)');
  }

  onMessage(callback: MessageCallback) {
    this.callbacks.push(callback);
  }

  emitMessage(bookingId: string, message: ChatMessage) {
    // 1. Simulate Network Delay (Server Processing)
    setTimeout(() => {
      // 2. Broadcast message back to client (Echo)
      this.callbacks.forEach(cb => cb(bookingId, message));

      // 3. Simulate "Other Party" Typing and Replying
      // Only reply if the sender is a real user (to avoid infinite loops)
      if (message.senderRole === UserRole.CUSTOMER || message.senderRole === UserRole.DRIVER) {
         this.simulateAutoReply(bookingId, message);
      }
    }, 300);
  }

  private simulateAutoReply(bookingId: string, originalMsg: ChatMessage) {
    const isCustomerSender = originalMsg.senderRole === UserRole.CUSTOMER;
    const replyRole = isCustomerSender ? UserRole.DRIVER : UserRole.CUSTOMER;
    
    // Randomize reply time between 2-5 seconds
    const delay = Math.floor(Math.random() * 3000) + 2000;

    setTimeout(() => {
      const replyText = isCustomerSender 
        ? "Got it! I'll be there shortly." 
        : "Okay, thanks for the update!";

      const reply: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderRole: replyRole,
        text: replyText,
        timestamp: Date.now()
      };
      
      this.callbacks.forEach(cb => cb(bookingId, reply));
    }, delay);
  }
}

export const socketService = new MockSocketService();