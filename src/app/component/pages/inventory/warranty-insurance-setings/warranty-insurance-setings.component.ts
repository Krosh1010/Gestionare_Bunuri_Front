import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';
import { InsuranceService } from '../../../../services/ApiServices/insurance.service';
import { CustomTrackerService } from '../../../../services/ApiServices/custom.tracker';
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
  customTrackerForm!: FormGroup;
  loading = false;
  warrantyData: any = null;
  insuranceData: any = null;
  customTrackerData: any = null;
  error: string | null = null;
  showWarrantyFormSection = false;
  showInsuranceFormSection = false;
  showCustomTrackerFormSection = false;

  constructor(
    private fb: FormBuilder,
    private warrantyService: warrantyService,
    private insuranceService: InsuranceService,
    private customTrackerService: CustomTrackerService
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
    this.customTrackerForm = this.fb.group({
      trackerName: [''],
      description: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  resetSections() {
    this.showWarrantyFormSection = false;
    this.showInsuranceFormSection = false;
    this.showCustomTrackerFormSection = false;
  }

  async openWarrantySection() {
    this.showWarrantyFormSection = true;
    this.showInsuranceFormSection = false;
    this.showCustomTrackerFormSection = false;
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
    this.showCustomTrackerFormSection = false;
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

  async openCustomTrackerSection() {
    this.showCustomTrackerFormSection = true;
    this.showWarrantyFormSection = false;
    this.showInsuranceFormSection = false;
    this.loading = true;
    this.error = null;
    try {
      const data = await this.customTrackerService.getCustomTrackersByAssetId(String(this.assetId));
      if (data) {
        this.customTrackerData = data;
        this.customTrackerForm.patchValue({
          trackerName: data.Name || '',
          description: data.description || '',
          startDate: data.startDate ? data.startDate.substring(0, 10) : '',
          endDate: data.endDate ? data.endDate.substring(0, 10) : ''
        });
      } else {
        this.customTrackerData = null;
        this.customTrackerForm.reset();
      }
    } catch (e: any) {
      if (e && e.status === 404) {
        this.customTrackerData = null;
        this.customTrackerForm.reset();
      } else {
        this.error = 'Eroare la încărcarea urmăritorului personalizat';
        this.customTrackerData = null;
      }
    }
    this.loading = false;
  }

  async saveCustomTracker() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        ...this.customTrackerForm.value,
        assetId: this.assetId
      };
      if (this.customTrackerData) {
        await this.customTrackerService.updateCustomTracker(String(this.assetId), payload);
      } else {
        await this.customTrackerService.createCustomTracker(payload);
      }
      await this.openCustomTrackerSection();
    } catch (e) {
      this.error = 'Eroare la salvarea urmăritorului personalizat';
    }
    this.loading = false;
  }

  async deleteCustomTracker() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      await this.customTrackerService.deleteCustomTracker(String(this.assetId));
      this.customTrackerData = null;
      this.customTrackerForm.reset();
      // Optionally, show a success message or refresh UI
    } catch (e) {
      this.error = 'Eroare la ștergerea urmăritorului personalizat';
    }
    this.loading = false;
  }

  backToMenu() {
    this.resetSections();
    this.showAddWarrantyForm = false;
  }
  showAddWarrantyForm = false;
  

  // Status maps (same as InventoryComponent)
  private warrantyStatusTextMap: { [key: string]: string } = {
    '0': 'Activă',
    '1': 'Aproape de expirare',
    '2': 'Expirată',
    'null': 'Lipsă',
    'undefined': 'Necunoscut',
  };
  private warrantyStatusClassMap: { [key: string]: string } = {
    '0': 'active',
    '1': 'soon',
    '2': 'expired',
    'null': 'unknown',
    'undefined': 'unknown',
  };
  getWarrantyStatus(warranty: any): string {
    const key = String(warranty?.status);
    return this.warrantyStatusClassMap.hasOwnProperty(key)
      ? this.warrantyStatusClassMap[key]
      : 'unknown';
  }
  getWarrantyStatusText(warranty: any): string {
    const key = String(warranty?.status);
    return this.warrantyStatusTextMap.hasOwnProperty(key)
      ? this.warrantyStatusTextMap[key]
      : 'Necunoscut';
  }

  private insuranceStatusTextMap: { [key: string]: string } = {
    '0': 'Neîncepută',
    '1': 'Activă',
    '2': 'Aproape de expirare',
    '3': 'Expirată',
    'null': 'Lipsă',
    'undefined': 'Necunoscut',
  };
  private insuranceStatusClassMap: { [key: string]: string } = {
    '0': 'notstarted',
    '1': 'active',
    '2': 'soon',
    '3': 'expired',
    'null': 'unknown',
    'undefined': 'unknown',
  };
  getInsuranceStatus(insurance: any): string {
    const key = String(insurance?.status);
    return this.insuranceStatusClassMap.hasOwnProperty(key)
      ? this.insuranceStatusClassMap[key]
      : 'unknown';
  }
  getInsuranceStatusText(insurance: any): string {
    const key = String(insurance?.status);
    return this.insuranceStatusTextMap.hasOwnProperty(key)
      ? this.insuranceStatusTextMap[key]
      : 'Necunoscut';
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
