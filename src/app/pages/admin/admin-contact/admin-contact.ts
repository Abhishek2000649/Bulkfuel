import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { ChatService } from '../../../core/services/contact/chat-service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/spinner/spinner';
import { finalize, Subscription } from 'rxjs';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { EchoService } from '../../../core/services/echo.service';

type chatFormFields = 'message';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './admin-contact.html',
  styleUrls: ['./admin-contact.css'],
})
export class AdminContact implements OnInit, OnDestroy {

  users: any[] = [];
  messages: any[] = [];
  currentUserId: number | null = null;

  refreshSub?: Subscription;
  authSub?: Subscription;

  selectedUser: any = null;
  conversationId: number | null = null;

  newMessage: string = '';
  role: string = 'ADMIN';

  isLoading: boolean = false;

  // ✅ VALIDATION
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
    this.authSub = this.auth.user$.subscribe(user => {

      if (!user) {
        if (this.refreshSub) this.refreshSub.unsubscribe();
        return;
      }

      this.currentUserId = user.id;
      this.loadUsers();
    });
  }

  // ================= LOAD USERS =================
  loadUsers(): void {
    this.isLoading = true;

    this.chatService.getAdminUsers()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.users = res.data;
          }
        },
        error: (err: any) => {
          Swal.fire({
            title: err.error?.message || 'Error loading users',
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

  // ================= SELECT USER =================
  selectUser(user: any): void {
    this.selectedUser = user;
    this.conversationId = user.conversation_id;
    this.messages = [];

    this.loadMessages(true);

    // 🔥 remove old listener
this.echoService.echo.channel(`chat.${this.conversationId}`)
    // 🔥 listen new channel
    this.echoService.echo.channel(`chat.${this.conversationId}`)
      .listen('.message.sent', (data: any) => {

        if (data.message.conversation_id === this.conversationId) {

          const exists = this.messages.find(m => m.id === data.message.id);

          if (!exists) {
            this.messages.push(data.message);
            this.cdr.detectChanges();

            // ✅ Smart scroll
            if (this.isNearBottom()) {
              this.scrollToBottom();
            }
          }

          // ✅ Seen
          if (data.message.sender_id !== this.currentUserId) {
            this.markSeen();
          }
        }
      });
  }

  // ================= LOAD MESSAGES =================
  loadMessages(showLoader: boolean = false): void {

    if (!this.conversationId || !this.auth.userId) return;

    if (showLoader) this.isLoading = true;

    this.chatService.getMessages(this.conversationId, this.role)
      .pipe(finalize(() => {
        if (showLoader) {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }))
      .subscribe({
        next: (res: any) => {
          if (res.success) {

            this.messages = res.messages;
            this.cdr.detectChanges();

            // ✅ Scroll after load
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

  // ================= SEND MESSAGE =================
  sendMessage(): void {

    this.updateFormErrors();
    if (this.formErrors.message) return;

    const payload = {
      message: this.newMessage,
      conversation_id: this.conversationId,
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

            // ✅ Force scroll
            this.scrollToBottom();

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
        }
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

  // ================= SEEN =================
  markSeen(): void {
    if (!this.conversationId) return;

    this.chatService.markSeen(this.conversationId, this.role)
      .subscribe({
        next: () => { },
        error: () => { }
      });
  }

  // ================= DESTROY =================
  ngOnDestroy(): void {
    if (this.refreshSub) this.refreshSub.unsubscribe();
    if (this.authSub) this.authSub.unsubscribe();

    this.echoService.echo.leave('chat');
  }
}