import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService } from '../../../../services/ApiServices/insurance.service';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';
import { CustomTrackerService } from '../../../../services/ApiServices/custom.tracker';
import { LoanService } from '../../../../services/ApiServices/loan.service';

@Component({
  selector: 'app-warranty-insurance-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warranty-insurance-form.component.html',
  styleUrl: './warranty-insurance-form.component.scss'
})
export class WarrantyInsuranceFormComponent {
  @Input() assetId!: number | null;
  @Output() close = new EventEmitter<void>();

  mode: 'choose' | 'warranty' | 'insurance' | 'tracker' | 'loan' = 'choose';

  // Accepted file types
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt';

  warranty = {
    provider: '',
    start: '',
    end: '',
    notes: ''
  };
  insurance = {
    company: '',
    insuredValue: null as number | null,
    start: '',
    end: ''
  };
  tracker = {
    name: '',
    description: '',
    start: '',
    end: ''
  };
  loan = {
    loanedToName: '',
    condition: '',
    loanedAt: '',
    notes: ''
  };

  // Fișiere selectate pentru upload
  warrantyFile: File | null = null;
  warrantyFileName: string = '';
  insuranceFile: File | null = null;
  insuranceFileName: string = '';

  // Calculează zilele rămase până la expirarea garanției (frontend only)
  calculateWarrantyDays(): number | null {
    if (!this.warranty.end) return null;
    const endDate = new Date(this.warranty.end);
    const today = new Date();
    // Normalizează la miezul nopții pentru comparație corectă
    endDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diff = endDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  // Selectare fișier garanție
  onWarrantyFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.warrantyFile = input.files[0];
      this.warrantyFileName = input.files[0].name;
    }
  }

  // Eliminare fișier garanție selectat
  removeWarrantyFile() {
    this.warrantyFile = null;
    this.warrantyFileName = '';
  }

  // Selectare fișier asigurare
  onInsuranceFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.insuranceFile = input.files[0];
      this.insuranceFileName = input.files[0].name;
    }
  }

  // Eliminare fișier asigurare selectat
  removeInsuranceFile() {
    this.insuranceFile = null;
    this.insuranceFileName = '';
  }

  // Feedback vizual simplu
  message: string = '';
  loading = false;

  // Tipul mesajului pentru template (success/error)
  get messageType(): 'success' | 'error' | '' {
    if (!this.message) return '';
    if (this.message.toLowerCase().includes('succes')) return 'success';
    if (this.message.toLowerCase().includes('eroare')) return 'error';
    return '';
  }

  private warrantySrv = inject(warrantyService);
  private insuranceSrv = inject(InsuranceService);
  private trackerSrv = inject(CustomTrackerService);
  private loanSrv = inject(LoanService);

  // Reset forms when assetId changes
  ngOnChanges() {
    this.resetForms();
  }

  // Reset forms when returning to choose
  backToChoose() {
    this.mode = 'choose';
    this.message = '';
    this.resetForms();
  }

  selectWarranty() {
    this.mode = 'warranty';
    this.warranty = { provider: '', start: '', end: '', notes: '' };
    this.warrantyFile = null;
    this.warrantyFileName = '';
    this.message = '';
  }
  selectInsurance() {
    this.mode = 'insurance';
    this.insurance = { company: '', insuredValue: null, start: '', end: '' };
    this.insuranceFile = null;
    this.insuranceFileName = '';
    this.message = '';
  }
  selectTracker() {
    this.mode = 'tracker';
    this.tracker = { name: '', description: '', start: '', end: '' };
    this.message = '';
  }
  selectLoan() {
    this.mode = 'loan';
    this.loan = { loanedToName: '', condition: '', loanedAt: '', notes: '' };
    this.message = '';
  }

  resetForms() {
    this.warranty = { provider: '', start: '', end: '', notes: '' };
    this.insurance = { company: '', insuredValue: null, start: '', end: '' };
    this.tracker = { name: '', description: '', start: '', end: '' };
    this.loan = { loanedToName: '', condition: '', loanedAt: '', notes: '' };
    this.warrantyFile = null;
    this.warrantyFileName = '';
    this.insuranceFile = null;
    this.insuranceFileName = '';
    this.message = '';
    this.loading = false;
    this.mode = 'choose';
  }

  async submitWarranty() {
    if (!this.assetId || !this.warranty.provider || !this.warranty.start || !this.warranty.end) return;
    const payload = {
      assetId: this.assetId,
      provider: this.warranty.provider,
      startDate: this.warranty.start,
      endDate: this.warranty.end
    };
    this.loading = true;
    this.message = '';
    try {
      await this.warrantySrv.createWarranty(payload, this.warrantyFile || undefined);
      this.message = 'Garanția a fost adăugată cu succes!';
      setTimeout(() => {
        this.backToChoose();
        this.message = 'Garanția a fost adăugată cu succes!';
      }, 800);
    } catch (err) {
      this.message = 'Eroare la salvare garanție!';
    } finally {
      this.loading = false;
    }
  }
  async submitInsurance() {
    if (!this.assetId || !this.insurance.company || !this.insurance.insuredValue || !this.insurance.start || !this.insurance.end) return;
    const payload = {
      assetId: this.assetId,
      company: this.insurance.company,
      insuredValue: this.insurance.insuredValue,
      startDate: this.insurance.start,
      endDate: this.insurance.end
    };
    this.loading = true;
    this.message = '';
    try {
      await this.insuranceSrv.createInsurance(payload, this.insuranceFile || undefined);
      this.message = 'Asigurarea a fost adăugată cu succes!';
      setTimeout(() => {
        this.backToChoose();
        this.message = 'Asigurarea a fost adăugată cu succes!';
      }, 800);
    } catch (err) {
      this.message = 'Eroare la salvare asigurare!';
    } finally {
      this.loading = false;
    }
  }
  async submitTracker() {
    if (!this.assetId || !this.tracker.name || !this.tracker.start || !this.tracker.end) return;
    const payload = {
      AssetId: this.assetId,
      Name: this.tracker.name,
      Description: this.tracker.description,
      StartDate: this.tracker.start,
      EndDate: this.tracker.end
    };
    this.loading = true;
    this.message = '';
    try {
      await this.trackerSrv.createCustomTracker(payload);
      this.message = 'Custom tracker adăugat cu succes!';
      setTimeout(() => {
        this.backToChoose();
        this.message = 'Custom tracker adăugat cu succes!';
      }, 800);
    } catch (err) {
      this.message = 'Eroare la salvare tracker!';
    } finally {
      this.loading = false;
    }
  }
  async submitLoan() {
    if (!this.assetId || !this.loan.loanedToName || !this.loan.condition || !this.loan.loanedAt) return;
    const payload = {
      assetId: this.assetId,
      loanedToName: this.loan.loanedToName,
      condition: this.loan.condition,
      loanedAt: this.loan.loanedAt,
      notes: this.loan.notes
    };
    this.loading = true;
    this.message = '';
    try {
      await this.loanSrv.createLoan(payload);
      this.message = 'Împrumutul a fost înregistrat cu succes!';
      setTimeout(() => {
        this.backToChoose();
        this.message = 'Împrumutul a fost înregistrat cu succes!';
      }, 800);
    } catch (err) {
      this.message = 'Eroare la salvare împrumut!';
    } finally {
      this.loading = false;
    }
  }
  onClose() {
    this.close.emit();
  }
}
