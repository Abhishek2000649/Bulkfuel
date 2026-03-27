import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatService } from '../../../core/services/contact/chat-service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Spinner } from '../../../shared/spinner/spinner';
import { FormsModule } from '@angular/forms';
import { finalize, interval, Subscription } from 'rxjs';
import { Auth } from '../../../core/services/Auth/authservice/auth';

type chatFormFields = 'message';

@Component({
  selector: 'app-user-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, Spinner, FormsModule],
  templateUrl: './user-contact.html',
  styleUrl: './user-contact.css',
})
export class UserContact implements OnInit {

  messages: any[] = [];
  newMessage: string = '';
  currentUserId: number | null = null;
  conversationId: number | null = null;
  role: string = 'USER';
  lastMessageId: number | null = null;
  refreshSub!: Subscription;
  authSub!: Subscription;
  isLoading: boolean = false;

  // =========================
  // ✅ VALIDATION (LIKE CHECKOUT)
  // =========================
  formErrors: Record<chatFormFields, string> = {
    message: '',
  };

  validationMessages: Record<chatFormFields, any> = {
    message: {
      required: 'Message cannot be empty',
      minlength: 'Message must be at least 1 character'
    }
  };

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, private auth: Auth) { }

  ngOnInit(): void {
      this.authSub = this.auth.user$.subscribe(user => {

    if (!user) {
      // 🔥 USER LOGOUT → STOP EVERYTHING
      if (this.refreshSub) {
        this.refreshSub.unsubscribe();
      }
      return;
    }
    this.currentUserId = this.auth.userId;
    this.loadMessages(true);

    this.refreshSub = interval(3000).subscribe(() => {
      if (document.visibilityState === 'visible') {
        this.loadMessages(false);
      }
    });
      });

  }


  updateFormErrors(): void {
    this.formErrors.message = '';

    if (!this.newMessage || this.newMessage.trim().length === 0) {
      this.formErrors.message = this.validationMessages.message.required;
    }
  }


  loadMessages(showLoader: boolean = false): void {
    if (showLoader) this.isLoading = true;
      if (!this.auth.userId) return; 
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

            const newMessages = res.messages;

            // 🔥 Last message ID
            const newLastMessageId = newMessages.length
              ? newMessages[newMessages.length - 1].id
              : null;

            // 🔥 Check new message
            const isNewMessage = this.lastMessageId !== newLastMessageId;

            // 🔥 Update messages
            this.messages = newMessages;
            this.cdr.detectChanges();

            // 🔥 Get last message
            const lastMsg = newMessages.length
              ? newMessages[newMessages.length - 1]
              : null;

            // ✅ SINGLE CLEAN LOGIC (no duplicate calls)
            if (lastMsg && lastMsg.sender_id !== this.currentUserId) {

              const shouldScroll = showLoader || (isNewMessage && this.isNearBottom());

              // ✅ Scroll only when needed
              if (shouldScroll) {
                this.scrollToBottom();
              }

              // ✅ Seen ALWAYS when new message from other user
              if (showLoader || isNewMessage) {
                this.markSeen();
              }
            }

            // 🔥 Update last message id
            this.lastMessageId = newLastMessageId;
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


  sendMessage(): void {

    this.updateFormErrors();

    if (this.formErrors.message) {

      return;
    }

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

            // 🔥 FORCE scroll (important)
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

          console.error('Send error', err);
        }
      });
  }


  markSeen(): void {
    if (!this.conversationId) return;

    this.chatService.markSeen(this.conversationId, this.role)
      .subscribe({
        next: () => {
          // optional: console.log('Seen updated');
        },
        error: (err: any) => {
          console.error('Seen error', err);
        }
      });
  }
  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-body') as HTMLElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
  ngOnDestroy(): void {
  if (this.refreshSub) {
    this.refreshSub.unsubscribe();
  }

  if (this.authSub) {
    this.authSub.unsubscribe();
  }
}
  isNearBottom(): boolean {
    const el = document.querySelector('.chat-body') as HTMLElement;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }
}

