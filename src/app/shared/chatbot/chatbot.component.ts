import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClaudeAIService } from '../../services/claude-ai.service';
import { ToastService } from '../toast/toast.service';
import { DatabaseService } from '../../services/database.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GuestUser {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  
  // Database session tracking
  private currentSessionId?: number;
  
  // Authentication state
  isAuthenticated = false;
  showAuthForm = false;
  
  // Guest registration form
  guestUser: GuestUser = {
    name: '',
    email: '',
    phone: ''
  };
  
  // Predefined quick questions
  quickQuestions = [
    'How does the AI scoring work?',
    'What is Investment Readiness Score?',
    'How to add a new startup?',
    'Explain the comparison feature'
  ];

  constructor(
    private aiService: ClaudeAIService,
    private router: Router,
    private toast: ToastService,
    private dbService: DatabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkAuthentication();
    
    // Restore session from sessionStorage
    const sessionId = sessionStorage.getItem('piq_chat_session_id');
    if (sessionId) {
      this.currentSessionId = parseInt(sessionId, 10);
      await this.loadChatHistory();
    }
  }

  private checkAuthentication(): void {
    const session = sessionStorage.getItem('piq_session');
    const superAdmin = sessionStorage.getItem('piq_super_admin');
    const guestSession = sessionStorage.getItem('piq_guest_chat');
    
    this.isAuthenticated = !!(session || superAdmin || guestSession);
    
    if (this.isAuthenticated) {
      this.initializeChat();
    }
  }

  private initializeChat(): void {
    const userName = this.getUsername();
    this.addMessage('assistant', 
      `Hello${userName ? ' ' + userName : ''}! 👋\n\n` +
      'I\'m Portfolio IQ Assistant, your AI-powered guide. I can help you with:\n\n' +
      '• Understanding AI scoring & metrics\n' +
      '• Navigating platform features\n' +
      '• Portfolio management tips\n' +
      '• Government schemes & funding\n' +
      '• Startup evaluation insights\n\n' +
      'What would you like to know?'
    );
  }

  private getUsername(): string {
    const guestData = sessionStorage.getItem('piq_guest_chat');
    if (guestData) {
      try {
        const guest = JSON.parse(guestData);
        return guest.name?.split(' ')[0] || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.isMinimized = false;
      this.showAuthForm = false;
    } else if (!this.isAuthenticated) {
      this.showAuthForm = true;
    }
  }

  navigateToLogin(): void {
    this.closeChat();
    this.router.navigate(['/auth']);
  }

  async submitGuestRegistration(): Promise<void> {
    // Validate form
    if (!this.guestUser.name.trim() || !this.guestUser.email.trim() || !this.guestUser.phone.trim()) {
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.guestUser.email)) {
      this.toast.warning('Please enter a valid email address');
      return;
    }
    
    try {
      // Create chat session in database
      const session = await this.dbService.createChatSession({
        session_type: 'guest',
        guest_name: this.guestUser.name,
        guest_email: this.guestUser.email,
        guest_phone: this.guestUser.phone,
        source_page: this.router.url
      });
      
      this.currentSessionId = session.id;
      
      // Save to sessionStorage for frontend state
      sessionStorage.setItem('piq_guest_chat', JSON.stringify(this.guestUser));
      sessionStorage.setItem('piq_chat_session_id', session.id.toString());
      
      this.isAuthenticated = true;
      this.showAuthForm = false;
      
      // Initialize chat
      this.initializeChat();
      
      // Track conversion
      await this.dbService.trackLandingEvent('chatbot_opened', {
        user_type: 'guest',
        guest_email: this.guestUser.email
      });
    } catch (error) {
      console.error('Failed to create chat session:', error);
      this.toast.error('Failed to start chat session. Please try again.');
    }
  }

  cancelRegistration(): void {
    this.showAuthForm = false;
    this.closeChat();
  }

  minimizeChat(): void {
    this.isMinimized = !this.isMinimized;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  async sendMessage(message?: string): Promise<void> {
    const messageToSend = message || this.userInput.trim();
    
    if (!messageToSend) return;

    // Add user message
    this.addMessage('user', messageToSend);
    this.userInput = '';
    this.isLoading = true;

    try {
      // Save user message to database (if session exists)
      if (this.currentSessionId) {
        try {
          await this.dbService.saveChatMessage(
            this.currentSessionId,
            'user',
            messageToSend,
            { is_quick_question: !!message }
          );
        } catch (dbError) {
          console.warn('Failed to save message to database:', dbError);
        }
      }

      // Build context for AI
      const contextPrompt = `You are Portfolio IQ Assistant, a helpful AI chatbot for Portfolio IQ - an AI-powered portfolio management platform for startup incubators and investors.

Portfolio IQ features:
- AI-Powered Scoring: Investment Readiness Score and Market Potential Score
- Portfolio Analytics: Real-time dashboards and insights
- Startup Comparison: Side-by-side comparison of up to 4 startups
- Valuation Tools: AI-driven valuation estimates
- Government Schemes: Database of funding schemes and support programs
- Export & Reports: Generate professional reports and export data

User question: ${messageToSend}

Provide a helpful, concise response (2-3 sentences). Be friendly and professional.`;

      // Call AI service
      const startTime = Date.now();
      const response = await this.aiService['callGitHubModels'](contextPrompt);
      const responseTime = Date.now() - startTime;
      
      // Save assistant response to database (if session exists)
      if (this.currentSessionId) {
        try {
          await this.dbService.saveChatMessage(
            this.currentSessionId,
            'assistant',
            response || 'I apologize, but I encountered an issue.',
            {
              ai_model: 'gpt-4o',
              response_time_ms: responseTime
            }
          );
        } catch (dbError) {
          console.warn('Failed to save response to database:', dbError);
        }
      }
      
      // Add AI response
      this.addMessage('assistant', response || 'I apologize, but I encountered an issue. Please try again or contact support.');
      
    } catch (error) {
      console.error('Chatbot error:', error);
      this.addMessage('assistant', 
        'I\'m having trouble connecting right now. Please try again in a moment, or feel free to explore our features directly!'
      );
    } finally {
      this.isLoading = false;
    }
  }

  selectQuickQuestion(question: string): void {
    this.sendMessage(question);
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Scroll to bottom after message is added
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    const chatBody = document.querySelector('.chat-messages');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  clearChat(): void {
    this.messages = [];
    this.ngOnInit(); // Re-add welcome message
  }

  private async loadChatHistory(): Promise<void> {
    if (!this.currentSessionId) return;
    
    try {
      const history = await this.dbService.getChatHistory(this.currentSessionId);
      this.messages = history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }
}
