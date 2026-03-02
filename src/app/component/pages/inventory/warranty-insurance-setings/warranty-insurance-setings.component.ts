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

  // Accepted file types
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt';

  // Fișiere pentru edit warranty/insurance
  warrantyEditFile: File | null = null;
  warrantyEditFileName: string = '';
  insuranceEditFile: File | null = null;
  insuranceEditFileName: string = '';

  // Fișiere pentru creare (când nu există încă)
  warrantyNewFile: File | null = null;
  warrantyNewFileName: string = '';
  insuranceNewFile: File | null = null;
  insuranceNewFileName: string = '';

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
        await this.warrantyService.updateWarranty(String(this.assetId), payload, this.warrantyEditFile || undefined);
      } else {
        // Create new warranty
        await this.warrantyService.createWarranty(payload, this.warrantyNewFile || undefined);
      }
      this.warrantyEditFile = null;
      this.warrantyEditFileName = '';
      this.warrantyNewFile = null;
      this.warrantyNewFileName = '';
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
        await this.insuranceService.updateInsurance(String(this.assetId), payload, this.insuranceEditFile || undefined);
      } else {
        await this.insuranceService.createInsurance(payload, this.insuranceNewFile || undefined);
      }
      this.insuranceEditFile = null;
      this.insuranceEditFileName = '';
      this.insuranceNewFile = null;
      this.insuranceNewFileName = '';
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
      const response = await this.customTrackerService.getCustomTrackersByAssetId(String(this.assetId));
      // API may return array or single object
      const data = Array.isArray(response) ? response[0] : response;
      if (data) {
        this.customTrackerData = data;
        this.customTrackerForm.patchValue({
          trackerName: data.name || data.Name || '',
          description: data.description || data.Description || '',
          startDate: (data.startDate || data.StartDate) ? (data.startDate || data.StartDate).substring(0, 10) : '',
          endDate: (data.endDate || data.EndDate) ? (data.endDate || data.EndDate).substring(0, 10) : ''
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
      const formVal = this.customTrackerForm.value;
      const payload = {
        AssetId: this.assetId,
        Name: formVal.trackerName,
        Description: formVal.description,
        StartDate: formVal.startDate,
        EndDate: formVal.endDate
      };
      if (this.customTrackerData) {
        const trackerId = this.customTrackerData.id || this.customTrackerData.Id;
        await this.customTrackerService.updateCustomTracker(String(trackerId), payload);
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
    if (!this.assetId || !this.customTrackerData) return;
    this.loading = true;
    this.error = null;
    try {
      const trackerId = this.customTrackerData.id || this.customTrackerData.Id;
      await this.customTrackerService.deleteCustomTracker(String(trackerId));
      this.customTrackerData = null;
      this.customTrackerForm.reset();
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

  // Custom Tracker status maps
  private customTrackerStatusTextMap: { [key: string]: string } = {
    '0': 'Activă',
    '1': 'Aproape de expirare',
    '2': 'Expirată',
    'null': 'Lipsă',
    'undefined': 'Necunoscut',
  };
  private customTrackerStatusClassMap: { [key: string]: string } = {
    '0': 'active',
    '1': 'soon',
    '2': 'expired',
    'null': 'unknown',
    'undefined': 'unknown',
  };
  getCustomTrackerStatus(tracker: any): string {
    const key = String(tracker?.status);
    return this.customTrackerStatusClassMap.hasOwnProperty(key)
      ? this.customTrackerStatusClassMap[key]
      : 'unknown';
  }
  getCustomTrackerStatusText(tracker: any): string {
    const key = String(tracker?.status);
    return this.customTrackerStatusTextMap.hasOwnProperty(key)
      ? this.customTrackerStatusTextMap[key]
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

  // --- Document management methods ---

  // Warranty edit file selection
  onWarrantyEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.warrantyEditFile = input.files[0];
      this.warrantyEditFileName = input.files[0].name;
    }
  }
  removeWarrantyEditFile() {
    this.warrantyEditFile = null;
    this.warrantyEditFileName = '';
  }

  // Warranty new file selection
  onWarrantyNewFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.warrantyNewFile = input.files[0];
      this.warrantyNewFileName = input.files[0].name;
    }
  }
  removeWarrantyNewFile() {
    this.warrantyNewFile = null;
    this.warrantyNewFileName = '';
  }

  // Insurance edit file selection
  onInsuranceEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.insuranceEditFile = input.files[0];
      this.insuranceEditFileName = input.files[0].name;
    }
  }
  removeInsuranceEditFile() {
    this.insuranceEditFile = null;
    this.insuranceEditFileName = '';
  }

  // Insurance new file selection
  onInsuranceNewFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.insuranceNewFile = input.files[0];
      this.insuranceNewFileName = input.files[0].name;
    }
  }
  removeInsuranceNewFile() {
    this.insuranceNewFile = null;
    this.insuranceNewFileName = '';
  }

  // Download warranty document
  async downloadWarrantyDocument() {
    if (!this.assetId) return;
    this.loading = true;
    try {
      const blob = await this.warrantyService.downloadWarrantyDocument(String(this.assetId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.warrantyData?.documentFileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      this.error = 'Eroare la descărcarea documentului';
    }
    this.loading = false;
  }

  // Delete warranty document only
  async deleteWarrantyDocument() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      await this.warrantyService.deleteWarrantyDocument(String(this.assetId));
      // Refresh data
      await this.openWarrantySection();
    } catch (e) {
      this.error = 'Eroare la ștergerea documentului';
    }
    this.loading = false;
  }

  // Download insurance document
  async downloadInsuranceDocument() {
    if (!this.assetId) return;
    this.loading = true;
    try {
      const blob = await this.insuranceService.downloadInsuranceDocument(String(this.assetId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.insuranceData?.documentFileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      this.error = 'Eroare la descărcarea documentului';
    }
    this.loading = false;
  }

  // Delete insurance document only
  async deleteInsuranceDocument() {
    if (!this.assetId) return;
    this.loading = true;
    this.error = null;
    try {
      await this.insuranceService.deleteInsuranceDocument(String(this.assetId));
      // Refresh data
      await this.openInsuranceSection();
    } catch (e) {
      this.error = 'Eroare la ștergerea documentului';
    }
    this.loading = false;
  }
  
  
}
