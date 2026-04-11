import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { ChatService } from '../../../core/services/contact/chat-service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Spinner } from '../../../shared/spinner/spinner';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { EchoService } from '../../../core/services/echo.service';

type chatFormFields = 'message';

@Component({
  selector: 'app-user-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, Spinner, FormsModule],
  templateUrl: './user-contact.html',
  styleUrl: './user-contact.css',
})
export class UserContact implements OnInit, OnDestroy {

  messages: any[] = [];
  newMessage: string = '';

  currentUserId: number | null = null;
  conversationId: number | null = null;

  role: string = 'USER';

  authSub!: Subscription;
  isLoading: boolean = false;

  // ✅ VALIDATION (UNCHANGED)
  formErrors: Record<chatFormFields, string> = {
    message: '',
  };

  validationMessages: Record<chatFormFields, any> = {
    message: {
      required: 'Message cannot be empty',
      minlength: 'Message must be at least 1 character'
    }
  };

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private auth: Auth,
    private echoService: EchoService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.authSub = this.auth.user$.subscribe(user => {

      if (!user) return;

      this.currentUserId = user.id;

      this.loadMessages(true);
    });
  }

  // ================= REALTIME =================
  listenToChat(): void {

    if (!this.conversationId) return;

    // 🧹 remove old channel
    this.echoService.echo.leave(`chat.${this.conversationId}`);

    const channel = this.echoService.echo.channel(`chat.${this.conversationId}`);

    channel.listen('.message.sent', (data: any) => {

      console.log('🔥 USER REALTIME:', data);

      const exists = this.messages.find(m => m.id === data.message.id);

      if (!exists) {
        // ✅ FULL reload (admin जैसा)
        this.loadMessages(false);
      }

      // ✅ seen update
      if (data.message.sender_id !== this.currentUserId) {
        this.markSeen();
      }
    });
  }

  // ================= LOAD =================
  loadMessages(showLoader: boolean = false): void {

    if (!this.auth.userId) return;

    if (showLoader) this.isLoading = true;

    this.chatService.getMessages(this.conversationId || 0, this.role)
      .pipe(finalize(() => {
        if (showLoader) {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }))
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            this.conversationId = res.conversation_id;

            // ✅ LISTEN AFTER conversationId
            this.listenToChat();

            this.messages = res.messages;
            this.cdr.detectChanges();

            this.scrollToBottom();

            const lastMsg = this.messages[this.messages.length - 1];

            if (lastMsg && lastMsg.sender_id !== this.currentUserId) {
              this.markSeen();
            }
          }
        },
        error: (err: any) => {
          Swal.fire({
            title: err.error?.message || 'Failed to load messages',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });
        }
      });
  }

  // ================= VALIDATION =================
  updateFormErrors(): void {
    this.formErrors.message = '';

    if (!this.newMessage || this.newMessage.trim().length === 0) {
      this.formErrors.message = this.validationMessages.message.required;
    }
  }

  // ================= SEND =================
  sendMessage(): void {

    this.updateFormErrors();

    if (this.formErrors.message) return;

    const payload = {
      message: this.newMessage,
      conversation_id: this.conversationId
    };

    this.isLoading = true;

    this.chatService.sendMessage(payload, this.role)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            this.newMessage = '';

            // ✅ reload (admin जैसा)
            this.loadMessages(false);
          }
        },
        error: (err: any) => {

          Swal.fire({
            title: err.error?.message || 'Failed to send message',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });

          console.error('Send error', err);
        }
      });
  }

  // ================= SEEN =================
  markSeen(): void {

    if (!this.conversationId) return;

    this.chatService.markSeen(this.conversationId, this.role)
      .subscribe({
        next: () => {},
        error: () => {}
      });
  }

  // ================= SCROLL =================
  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-body') as HTMLElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  isNearBottom(): boolean {
    const el = document.querySelector('.chat-body') as HTMLElement;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }

  // ================= DESTROY =================
  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();

    if (this.conversationId) {
      this.echoService.echo.leave(`chat.${this.conversationId}`);
    }
  }
}