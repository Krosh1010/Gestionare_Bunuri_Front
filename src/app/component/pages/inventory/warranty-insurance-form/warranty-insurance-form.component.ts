import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService } from '../../../../services/ApiServices/insurance.service';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';

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

  mode: 'choose' | 'warranty' | 'insurance' = 'choose';

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

  // Funcție goală pentru upload document garanție
  uploadWarrantyDocument() {
    // TODO: trimite la backend
  }

  // Funcție goală pentru upload document asigurare
  uploadInsuranceDocument() {
    // TODO: trimite la backend
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
    // Optionally reset warranty form here too
    this.warranty = { provider: '', start: '', end: '', notes: '' };
    this.message = '';
  }
  selectInsurance() {
    this.mode = 'insurance';
    this.insurance = { company: '', insuredValue: null, start: '', end: '' };
    this.message = '';
  }

  resetForms() {
    this.warranty = { provider: '', start: '', end: '', notes: '' };
    this.insurance = { company: '', insuredValue: null, start: '', end: '' };
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
      await this.warrantySrv.createWarranty(payload);
      this.message = 'Garanția a fost adăugată cu succes!';
      // După succes, revino la meniul de alegere, nu închide complet
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
      await this.insuranceSrv.createInsurance(payload);
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
  onClose() {
    this.close.emit();
  }
}
