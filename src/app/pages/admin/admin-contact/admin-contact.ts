import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatService } from '../../../core/services/contact/chat-service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/spinner/spinner';
import { finalize, interval, Subscription } from 'rxjs';
import { Auth } from '../../../core/services/Auth/authservice/auth';

type chatFormFields = 'message';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './admin-contact.html',
  styleUrl: './admin-contact.css',
})
export class AdminContact implements OnInit {

  users: any[] = [];
  messages: any[] = [];
  currentUserId: number | null = null;
  refreshSub!: Subscription;
  authSub!: Subscription;
  selectedUser: any = null;
  conversationId: number | null = null;

  newMessage: string = '';
  role: string = 'ADMIN';

  isLoading: boolean = false;

  formErrors: Record<chatFormFields, string> = {
    message: '',
  };

  validationMessages: Record<chatFormFields, any> = {
    message: {
      required: 'Message cannot be empty',
    }
  };

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, private auth: Auth) { }

  ngOnInit(): void {

  this.authSub = this.auth.user$.subscribe(user => {

    if (!user) {
      if (this.refreshSub) {
        this.refreshSub.unsubscribe();
      }
      return;
    }

    this.currentUserId = user.id;

    this.loadUsers();

  });

}


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


  selectUser(user: any): void {
    this.selectedUser = user;
    this.conversationId = user.conversation_id;

    this.loadMessages(true);

    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }

    this.refreshSub = interval(3000).subscribe(() => {
 if (document.visibilityState === 'visible') { // 🔥 ADD THIS
      this.loadMessages(false);
    }
  });
  }


  loadMessages(showLoader: boolean = false): void {
    if (!this.conversationId) return;
     if (!this.auth.userId) return;
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

            const oldMessages = this.messages;
            this.messages = res.messages;

            // 👇 always update UI
            this.cdr.detectChanges();

            const oldLastId = oldMessages[oldMessages.length - 1]?.id;
            const newLastMsg = this.messages[this.messages.length - 1];

            // 👇 new message आया है
            if (newLastMsg && newLastMsg.id !== oldLastId) {
              this.scrollToBottom();

              if (newLastMsg.sender_id !== this.currentUserId) {
                this.markSeen();
              }
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


  updateFormErrors(): void {
    this.formErrors.message = '';

    if (!this.newMessage || this.newMessage.trim().length === 0) {
      this.formErrors.message = this.validationMessages.message.required;
    }
  }


  sendMessage(): void {

    this.updateFormErrors();

    if (this.formErrors.message) {
      return;
    }

    const payload = {
      message: this.newMessage,
      conversation_id: this.conversationId,
      // receiver_id: this.selectedUser?.id
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
            this.loadMessages(true);
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
  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-body') as HTMLElement;
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
  ngOnDestroy(): void {
  if (this.refreshSub) {
    this.refreshSub.unsubscribe();
  }

  if (this.authSub) {
    this.authSub.unsubscribe();
  }
}
  markSeen(): void {
    if (!this.conversationId) return;

    this.chatService.markSeen(this.conversationId, this.role)
      .subscribe({
        next: () => { },
        error: () => { }
      });
  }
}