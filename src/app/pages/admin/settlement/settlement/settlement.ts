import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettlementService } from '../../../../core/services/admin/settlement/settlement-service';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './settlement.html',
  styleUrl: './settlement.css',
})
export class Settlement implements OnInit {

  isAgentDropdownOpen = false;
@ViewChild('agentDropdown') agentDropdown!: ElementRef;
  // ================= DATA =================
  agents: any[] = [];
  settlement: any = null;
  isLoading:boolean= false;
  // ================= FORM STATE =================
  selectedAgentId: number | null = null;
  settlementMode: string = '';

  // ================= UI STATE =================
  loading = false;
  submitting = false;

  constructor(
    private settlementService: SettlementService,
    private cdr: ChangeDetectorRef
  ) {}

  // ================= LIFECYCLE =================
  ngOnInit(): void {
    this.loadAgents();
  }
toggleAgentDropdown() {
  this.isAgentDropdownOpen = !this.isAgentDropdownOpen;
} 
selectAgent(agent: any) {
  this.selectedAgentId = agent.id;
  this.isAgentDropdownOpen = false;

  this.onAgentChange(); // already exists ✅
} 
@HostListener('document:click', ['$event'])
handleClickOutside(event: any) {
  if (
    this.agentDropdown &&
    !this.agentDropdown.nativeElement.contains(event.target)
  ) {
    this.isAgentDropdownOpen = false;
  }
}
  // ================= COMPUTED =================
  get selectedAgent(): any | null {
    return this.agents.find(a => a.id === this.selectedAgentId) || null;
  }

  // ================= METHODS =================

  // 1️⃣ Load delivery agents
 loadAgents(): void {
  this.isLoading = true;

  this.settlementService.getDeliveryAgents().subscribe({
    next: (res: any) => {
      this.agents = res?.data || [];
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;

      Swal.fire({
        title: err?.error?.message || 'Failed to load agents',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });

      console.error(err);
    },
  });
}
 onAgentChange(): void {
  this.isLoading = true;

  if (!this.selectedAgentId) {
    this.resetForm();
    this.isLoading = false;
    return;
  }

  this.loading = true;
  this.settlement = null;
  this.settlementMode = '';

  this.settlementService
    .getPendingSettlement(this.selectedAgentId)
    .subscribe({
      next: (res: any) => {
        this.settlement = res?.data || null;
        this.loading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.loading = false;
        this.isLoading = false;

        Swal.fire({
          title: err?.error?.message || 'No pending settlement found',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });

        console.error(err);
        this.settlement = null;
      },
    });
}
  // 3️⃣ Select settlement mode (card click)
  selectMode(mode: string): void {
    if (!this.settlement) return;
    this.settlementMode = mode;
  }

  // 4️⃣ Complete settlement
  submitSettlement(): void {
  this.isLoading = true;

  if (!this.settlement) {
    this.isLoading = false;

    Swal.fire({
      title: 'No settlement available',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#7f1d1d',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#ef4444'
    });

    return;
  }

  if (!this.settlementMode) {
    this.isLoading = false;

    Swal.fire({
      title: 'Please select settlement mode',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#7f1d1d',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff'
    });

    return;
  }

  this.submitting = true;

  const payload = {
    settlement_id: this.settlement.id,
    settlement_mode: this.settlementMode,
  };

  this.settlementService.completeSettlement(payload).subscribe({

    next: (res: any) => {
      this.isLoading = false;

      Swal.fire({
        title: res?.message || 'Settlement completed successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7f1d1d',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff'
      });

      this.resetForm();
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      this.submitting = false;

      Swal.fire({
        title: err?.error?.message || 'Failed to complete settlement',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7f1d1d',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });

      console.error(err);
    },

  });
}

  // 🔁 Reset UI
  resetForm(): void {
    this.settlement = null;
    this.settlementMode = '';
    this.selectedAgentId = null;
    this.loading = false;
    this.submitting = false;
  }
}
