import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';

@Component({
  selector: 'app-warranty-insurance-setings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './warranty-insurance-setings.component.html',
  styleUrl: './warranty-insurance-setings.component.scss'
})
export class WarrantyInsuranceSetingsComponent implements OnInit {
  @Input() assetId!: number | null;
  warrantyForm!: FormGroup;
  loading = false;
  warrantyData: any = null;
  error: string | null = null;
  showWarrantyFormSection = false;
  showInsuranceFormSection = false;

  constructor(private fb: FormBuilder, private warrantyService: warrantyService) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    this.initForm();
    this.resetSections();
  }

  initForm() {
    this.warrantyForm = this.fb.group({
      warrantyNumber: [''],
      provider: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  resetSections() {
    this.showWarrantyFormSection = false;
    this.showInsuranceFormSection = false;
  }

  async openWarrantySection() {
    this.showWarrantyFormSection = true;
    this.showInsuranceFormSection = false;
    this.loading = true;
    this.error = null;
      this.showAddWarrantyForm = false;
      try {
        const data = await this.warrantyService.getWarrantyByAssetId(String(this.assetId));
        if (data) {
          this.warrantyData = data;
          this.warrantyForm.patchValue({
            provider: data.provider || '',
            startDate: data.startDate ? data.startDate.substring(0, 10) : '',
            endDate: data.endDate ? data.endDate.substring(0, 10) : ''
          });
        } else {
          this.warrantyData = null;
          this.warrantyForm.reset();
        }
      } catch (e: any) {
        if (e && e.status === 404) {
          this.warrantyData = null;
          this.warrantyForm.reset();
          this.showAddWarrantyForm = false;
        } else {
          this.error = 'Eroare la încărcarea garanției';
          this.warrantyData = null;
        }
      }
    this.loading = false;
  }

  async saveWarranty() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        ...this.warrantyForm.value,
        assetId: this.assetId
      };
      if (this.warrantyData) {
        // Update existing warranty
        await this.warrantyService.updateWarranty(String(this.assetId), payload);
      } else {
        // Create new warranty
        await this.warrantyService.createWarranty(payload);
      }
      await this.openWarrantySection();
    } catch (e) {
      this.error = 'Eroare la salvare';
    }
    this.loading = false;
  }

  async deleteWarranty() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      await this.warrantyService.deleteWarranty(String(this.assetId));
      this.warrantyData = null;
      this.warrantyForm.reset();
      this.showAddWarrantyForm = false;
      // Optionally, show a success message or refresh UI
    } catch (e) {
      this.error = 'Eroare la ștergerea garanției';
    }
    this.loading = false;
  }

  openInsuranceSection() {
    this.showInsuranceFormSection = true;
    this.showWarrantyFormSection = false;
    // TODO: logica pentru asigurare
    alert('Formularul de asigurare nu este implementat încă.');
  }

  backToMenu() {
    this.resetSections();
    this.showAddWarrantyForm = false;
  }
  showAddWarrantyForm = false;
  
  // Returns a status class for warranty badge (e.g., 'active', 'expired', 'soon')
  getWarrantyStatus(warranty: any): string {
    if (!warranty || !warranty.endDate) return 'unknown';
    const today = new Date();
    const end = new Date(warranty.endDate);
    const diff = (end.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return 'expired';
    if (diff <= 30) return 'soon';
    return 'active';
  }

  // Returns a human-readable status text for warranty
  getWarrantyStatusText(warranty: any): string {
    if (!warranty || !warranty.endDate) return 'Necunoscut';
    const today = new Date();
    const end = new Date(warranty.endDate);
    const diff = (end.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return 'Expirată';
    if (diff <= 30) return 'Aproape de expirare';
    return 'Activă';
  }

  // Formats a date string as 'DD.MM.YYYY'
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ro-RO');
  }

  // Calculates days remaining until a date
  calculateDaysRemaining(dateStr: string): string {
    if (!dateStr) return '-';
    const today = new Date();
    const end = new Date(dateStr);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diff < 0) return 'Expirată';
    return diff + ' zile';
  }
}
