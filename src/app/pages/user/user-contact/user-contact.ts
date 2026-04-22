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
  private channel: any = null;
  private isMarkingSeen = false;
  private visibilityHandler: any;

  currentUserId: number | null = null;
  conversationId: number | null = null;
  private currentChannelName: string | null = null;

  role: string = 'USER';

  authSub!: Subscription;
  isLoading: boolean = false;

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
  ) { }

  // ================= INIT =================
  ngOnInit(): void {

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.triggerSeen();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);

    this.authSub = this.auth.user$.subscribe(user => {
      if (!user) return;

      this.currentUserId = user.id;
      this.loadMessages(true);
    });
  }

  // ================= REALTIME =================
  listenToChat(): void {

    if (!this.conversationId) return;

    const newChannelName = `chat.${this.conversationId}`;

    // ✅ leave OLD channel properly
    if (this.currentChannelName) {
      this.echoService.echo.leave(this.currentChannelName);
    }

    this.currentChannelName = newChannelName;

    this.channel = this.echoService.echo.channel(newChannelName);

    // MESSAGE
    this.channel.listen('.message.sent', (data: any) => {

      const exists = this.messages.find(m => m.id === data.message.id);

      if (!exists) {
        this.messages.push(data.message);
        this.cdr.detectChanges();

        this.scrollToBottom();

        setTimeout(() => {
          if (
            data.message.sender_id !== this.currentUserId &&
            document.visibilityState === 'visible'
          ) {
            this.triggerSeen();
          }
        }, 150);
      }
    });

    // SEEN
    this.channel.listen('.message.seen', (data: any) => {

      if (Number(data.conversationId) !== Number(this.conversationId)) return;

      this.messages = this.messages.map(msg => {
        if (msg.sender_id === this.currentUserId) {
          msg.is_seen = true;
        }
        return msg;
      });

      this.cdr.detectChanges();
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
            const newConversationId = res.conversation_id;


            this.conversationId = newConversationId;

            this.listenToChat(); 

            this.messages = res.messages;
            this.cdr.detectChanges();

            this.scrollToBottom();

            const hasUnread = this.messages.some(
              msg => msg.sender_id !== this.currentUserId && !msg.is_seen
            );

            setTimeout(() => {
              if (
                hasUnread &&
                document.visibilityState === 'visible'
              ) {
                this.triggerSeen();
              }
            }, 200);
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
             this.loadMessages(false);
            this.scrollToBottom();
          }
        },
        error: (err: any) => {
          Swal.fire({
            title: err.error?.message || 'Failed to send message',
            icon: 'error'
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

  // ================= SEEN =================
  markSeen(): void {

    if (!this.conversationId || this.isMarkingSeen) return;

    const hasUnread = this.messages.some(
      msg => msg.sender_id !== this.currentUserId && !msg.is_seen
    );

    if (!hasUnread) return;

    this.isMarkingSeen = true;

    this.chatService.markSeen(this.conversationId, this.role)
      .subscribe({
        next: () => this.isMarkingSeen = false,
        error: () => this.isMarkingSeen = false
      });
  }

  triggerSeen(): void {

    if (this.isMarkingSeen) return;

    if (document.visibilityState !== 'visible') return;

    setTimeout(() => {
      this.markSeen();
    }, 150);
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

  // ================= DESTROY =================
  ngOnDestroy(): void {

    if (this.authSub) this.authSub.unsubscribe();

    if (this.currentChannelName) {
      this.echoService.echo.leave(this.currentChannelName);
    }

    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }
}