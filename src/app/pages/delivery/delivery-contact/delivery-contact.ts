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
  selector: 'app-delivery-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, Spinner, FormsModule],
  templateUrl: './delivery-contact.html',
  styleUrl: './delivery-contact.css',
})
export class DeliveryContact implements OnInit, OnDestroy {

  messages: any[] = [];
  newMessage: string = '';

  private visibilityHandler: any;
  private isMarkingSeen = false;
  private currentChannelName: string | null = null;

  currentUserId: number | null = null;
  conversationId: number | null = null;

  role: string = 'delivery_agent';

  authSub!: Subscription;
  isLoading: boolean = false;

  formErrors: Record<chatFormFields, string> = {
    message: '',
  };

  validationMessages: Record<chatFormFields, any> = {
    message: {
      required: 'Message cannot be empty'
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

    const newChannel = `chat.${this.conversationId}`;

    // ✅ SAME CHANNEL? then skip
    if (this.currentChannelName === newChannel) return;

    // ✅ leave old channel
    if (this.currentChannelName) {
      this.echoService.echo.leave(this.currentChannelName);
    }

    this.currentChannelName = newChannel;

    const channel = this.echoService.echo.channel(newChannel);

    // MESSAGE
    channel.listen('.message.sent', (data: any) => {

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
    channel.listen('.message.seen', (data: any) => {

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

            this.conversationId = res.conversation_id;
            this.listenToChat();


            this.messages = res.messages;
            this.cdr.detectChanges();

            this.scrollToBottom();

            const hasUnread = this.messages.some(
              msg => msg.sender_id !== this.currentUserId && !msg.is_seen
            );

            setTimeout(() => {
              if (hasUnread && document.visibilityState === 'visible') {
                this.triggerSeen();
              }
            }, 200);
          }
        },
        error: () => {
          Swal.fire('Error loading messages');
        }
      });
  }

  // ================= SEND =================
  sendMessage(): void {

    this.updateFormErrors();
    if (this.formErrors.message) return;

    const tempMessage = {
      id: Date.now(),
      message: this.newMessage,
      sender_id: this.currentUserId,
      is_seen: false
    };

    // ✅ UI update
    this.messages.push(tempMessage);
    this.scrollToBottom();

    // 🔥 ADD THIS
    this.isLoading = true;

    this.chatService.sendMessage({
      message: this.newMessage,
      conversation_id: this.conversationId
    }, this.role)
      .pipe(finalize(() => {
        // 🔥 STOP loader
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe((res: any) => {

        if (res.success) {

          this.newMessage = '';
          this.conversationId = res.conversation_id;

          this.listenToChat();

          this.messages = this.messages.map(m =>
            m.id === tempMessage.id ? res.message : m
          );

          this.cdr.detectChanges();
        }
      });
  }

  // ================= VALIDATION =================
  updateFormErrors(): void {
    this.formErrors.message = '';

    if (!this.newMessage?.trim()) {
      this.formErrors.message = 'Message required';
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

    setTimeout(() => this.markSeen(), 150);
  }

  // ================= SCROLL =================
  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-body') as HTMLElement;
      if (el) el.scrollTop = el.scrollHeight;
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