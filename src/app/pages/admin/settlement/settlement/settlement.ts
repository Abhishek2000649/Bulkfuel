import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettlementService } from '../../../../core/services/admin/settlement/settlement-service';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './settlement.html',
  styleUrl: './settlement.css',
})
export class Settlement implements OnInit {

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

  // ================= COMPUTED =================
  get selectedAgent(): any | null {
    return this.agents.find(a => a.id === this.selectedAgentId) || null;
  }

  // ================= METHODS =================

  // 1️⃣ Load delivery agents
  loadAgents(): void {
    this.isLoading=true;
    this.settlementService.getDeliveryAgents().subscribe({
      next: (res: any[]) => {
        this.agents = res || [];
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        alert('Failed to load agents');
      },
    });
  }

  // 2️⃣ On agent select → fetch pending settlement
  onAgentChange(): void {
    this.isLoading=true;
    if (!this.selectedAgentId) {
      this.resetForm();
      this.isLoading=false;
      return;
    }

    this.loading = true;
    this.settlement = null;
    this.settlementMode = '';

    this.settlementService
      .getPendingSettlement(this.selectedAgentId)
      .subscribe({
        next: (res: any) => {
          this.settlement = res?.settlement || null;
          this.loading = false;
          this.isLoading=false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.isLoading=false;
          alert('No pending settlement found');
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
    this.isLoading=true;
    if (!this.settlement) {
      this.isLoading=false;
      alert('No settlement available');
      return;
    }

    if (!this.settlementMode) {
      this.isLoading=false;
      alert('Please select settlement mode');
      return;
    }

    this.submitting = true;

    const payload = {
      settlement_id: this.settlement.id,
      settlement_mode: this.settlementMode,
    };

    this.settlementService.completeSettlement(payload).subscribe({
      next: () => {
        this.isLoading=false;
        alert('Settlement completed successfully');
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        alert('Failed to complete settlement');
        this.submitting = false;
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
