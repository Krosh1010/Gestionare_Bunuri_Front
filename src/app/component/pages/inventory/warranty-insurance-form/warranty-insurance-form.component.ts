import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    number: '',
    end: '',
    amount: null as number | null,
    provider: '',
    details: ''
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
    this.insurance = { number: '', end: '', amount: null, provider: '', details: '' };
    this.message = '';
  }

  resetForms() {
    this.warranty = { provider: '', start: '', end: '', notes: '' };
    this.insurance = { number: '', end: '', amount: null, provider: '', details: '' };
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
  submitInsurance() {
    // TODO: trimite datele la backend
    this.close.emit();
  }
  onClose() {
    this.close.emit();
  }
}
