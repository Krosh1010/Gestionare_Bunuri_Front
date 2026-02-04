import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';
import { InsuranceService } from '../../../../services/ApiServices/insurance.service';

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
  insuranceForm!: FormGroup;
  loading = false;
  warrantyData: any = null;
  insuranceData: any = null;
  error: string | null = null;
  showWarrantyFormSection = false;
  showInsuranceFormSection = false;

  constructor(
    private fb: FormBuilder,
    private warrantyService: warrantyService,
    private insuranceService: InsuranceService
  ) {}

  ngOnInit() {
    this.initForms();
  }

  ngOnChanges() {
    this.initForms();
    this.resetSections();
  }

  initForms() {
    this.warrantyForm = this.fb.group({
      warrantyNumber: [''],
      provider: [''],
      startDate: [''],
      endDate: ['']
    });
    this.insuranceForm = this.fb.group({
      company: [''],
      insuredValue: [''],
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

  async openInsuranceSection() {
    this.showInsuranceFormSection = true;
    this.showWarrantyFormSection = false;
    this.loading = true;
    this.error = null;
    try {
      const data = await this.insuranceService.getInsuranceByAssetId(String(this.assetId));
      if (data) {
        this.insuranceData = data;
        this.insuranceForm.patchValue({
          company: data.company || '',
          insuredValue: data.insuredValue || '',
          startDate: data.startDate ? data.startDate.substring(0, 10) : '',
          endDate: data.endDate ? data.endDate.substring(0, 10) : ''
        });
      } else {
        this.insuranceData = null;
        this.insuranceForm.reset();
      }
    } catch (e: any) {
      if (e && e.status === 404) {
        this.insuranceData = null;
        this.insuranceForm.reset();
      } else {
        this.error = 'Eroare la încărcarea asigurării';
        this.insuranceData = null;
      }
    }
    this.loading = false;
  }

  async saveInsurance() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        ...this.insuranceForm.value,
        assetId: this.assetId
      };
      if (this.insuranceData) {
        await this.insuranceService.updateInsurance(String(this.assetId), payload);
      } else {
        await this.insuranceService.createInsurance(payload);
      }
      await this.openInsuranceSection();
    } catch (e) {
      this.error = 'Eroare la salvare asigurare';
    }
    this.loading = false;
  }

  async deleteInsurance() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      await this.insuranceService.deleteInsurance(String(this.assetId));
      this.insuranceData = null;
      this.insuranceForm.reset();
      // Optionally, show a success message or refresh UI
    } catch (e) {
      this.error = 'Eroare la ștergerea asigurării';
    }
    this.loading = false;
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

  // Returns a status class for insurance badge (e.g., 'active', 'expired', 'soon')
  getInsuranceStatus(insurance: any): string {
    if (!insurance || !insurance.endDate) return 'unknown';
    const today = new Date();
    const end = new Date(insurance.endDate);
    const diff = (end.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return 'expired';
    if (diff <= 30) return 'soon';
    return 'active';
  }

  // Returns a human-readable status text for insurance
  getInsuranceStatusText(insurance: any): string {
    if (!insurance || !insurance.endDate) return 'Necunoscut';
    const today = new Date();
    const end = new Date(insurance.endDate);
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
