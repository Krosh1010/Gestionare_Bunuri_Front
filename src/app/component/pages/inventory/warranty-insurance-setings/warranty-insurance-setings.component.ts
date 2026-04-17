import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';
import { InsuranceService } from '../../../../services/ApiServices/insurance.service';
import { CustomTrackerService } from '../../../../services/ApiServices/custom.tracker';
import { LoanService } from '../../../../services/ApiServices/loan.service';
import { SpaceService } from '../../../../services/ApiServices/space.service';
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
  showLoanFormSection = false;

  // Loan state
  loanForm!: FormGroup;
  returnLoanForm!: FormGroup;
  activeLoanData: any = null;
  showReturnForm = false;

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

  // Fișiere pentru loan (multiple)
  loanEditFiles: File[] = [];
  loanEditFileNames: string[] = [];
  loanNewFiles: File[] = [];
  loanNewFileNames: string[] = [];

  // Warranty tree picker state
  warrantyTreeNodes: any[] = [];
  warrantyTreePickerVisible = false;
  warrantySelectedTreeNode: any = null;
  warrantyTreeLoading = false;
  warrantySpaceSearchQuery = '';
  warrantySpaceSearchResults: any[] = [];
  warrantyIsSearchingSpaces = false;
  warrantyShowSpaceSearchResults = false;
  private warrantySpaceSearchTimeout: any = null;

  // Insurance tree picker state
  insuranceTreeNodes: any[] = [];
  insuranceTreePickerVisible = false;
  insuranceSelectedTreeNode: any = null;
  insuranceTreeLoading = false;
  insuranceSpaceSearchQuery = '';
  insuranceSpaceSearchResults: any[] = [];
  insuranceIsSearchingSpaces = false;
  insuranceShowSpaceSearchResults = false;
  private insuranceSpaceSearchTimeout: any = null;

  constructor(
    private fb: FormBuilder,
    private warrantyService: warrantyService,
    private insuranceService: InsuranceService,
    private customTrackerService: CustomTrackerService,
    private loanService: LoanService,
    private spaceService: SpaceService
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
    const today = new Date().toISOString().substring(0, 10);
    this.loanForm = this.fb.group({
      loanedToName: ['', Validators.required],
      condition: ['', Validators.required],
      notes: [''],
      loanedAt: [today, Validators.required]
    });
    this.returnLoanForm = this.fb.group({
      conditionOnReturn: [''],
      notes: [''],
      returnedAt: [today, Validators.required]
    });
  }

  resetSections() {
    this.showWarrantyFormSection = false;
    this.showInsuranceFormSection = false;
    this.showCustomTrackerFormSection = false;
    this.showLoanFormSection = false;
    this.showReturnForm = false;
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
          // Set tree picker from loaded data
          if (data.spaceId) {
            this.warrantySelectedTreeNode = { id: data.spaceId, name: data.spaceName || 'Spațiu #' + data.spaceId, type: data.spaceType };
          } else {
            this.warrantySelectedTreeNode = null;
          }
        } else {
          this.warrantyData = null;
          this.warrantyForm.reset();
          this.warrantySelectedTreeNode = null;
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
      const payload: any = {
        ...this.warrantyForm.value,
        assetId: this.assetId
      };
      if (this.warrantyData) {
        // Update existing warranty
        payload.spaceIdIsSet = true;
        payload.spaceId = this.warrantySelectedTreeNode ? this.warrantySelectedTreeNode.id : null;
        await this.warrantyService.updateWarranty(String(this.assetId), payload, this.warrantyEditFile || undefined);
      } else {
        // Create new warranty
        if (this.warrantySelectedTreeNode) {
          payload.spaceId = this.warrantySelectedTreeNode.id;
        }
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
        // Set tree picker from loaded data
        if (data.spaceId) {
          this.insuranceSelectedTreeNode = { id: data.spaceId, name: data.spaceName || 'Spațiu #' + data.spaceId, type: data.spaceType };
        } else {
          this.insuranceSelectedTreeNode = null;
        }
      } else {
        this.insuranceData = null;
        this.insuranceForm.reset();
        this.insuranceSelectedTreeNode = null;
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
      const payload: any = {
        ...this.insuranceForm.value,
        assetId: this.assetId
      };
      if (this.insuranceData) {
        payload.spaceIdIsSet = true;
        payload.spaceId = this.insuranceSelectedTreeNode ? this.insuranceSelectedTreeNode.id : null;
        await this.insuranceService.updateInsurance(String(this.assetId), payload, this.insuranceEditFile || undefined);
      } else {
        if (this.insuranceSelectedTreeNode) {
          payload.spaceId = this.insuranceSelectedTreeNode.id;
        }
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

  async openLoanSection() {
    this.showLoanFormSection = true;
    this.showWarrantyFormSection = false;
    this.showInsuranceFormSection = false;
    this.showCustomTrackerFormSection = false;
    this.showReturnForm = false;
    this.loading = true;
    this.error = null;
    try {
      const data = await this.loanService.getLoansByAssetId(String(this.assetId));
      const today = new Date().toISOString().substring(0, 10);
      this.activeLoanData = data && (Array.isArray(data) ? data[0] : data) ? (Array.isArray(data) ? data[0] : data) : null;
      if (this.activeLoanData) {
        this.loanForm.patchValue({
          loanedToName: this.activeLoanData.loanedToName || '',
          condition: this.activeLoanData.condition || '',
          notes: this.activeLoanData.notes || '',
          loanedAt: this.activeLoanData.loanedAt ? this.activeLoanData.loanedAt.substring(0, 10) : today
        });
      } else {
        this.loanForm.reset({ loanedAt: today });
      }
      this.returnLoanForm.reset({ returnedAt: today });
    } catch (e: any) {
      if (e && e.status === 404) {
        this.activeLoanData = null;
      } else {
        this.error = 'Eroare la încărcarea împrumutului activ';
        this.activeLoanData = null;
      }
    }
    this.loading = false;
  }

  async createLoan() {
    if (!this.assetId || this.loanForm.invalid) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        assetId: this.assetId,
        loanedToName: this.loanForm.value.loanedToName,
        condition: this.loanForm.value.condition,
        notes: this.loanForm.value.notes || null,
        loanedAt: this.loanForm.value.loanedAt
      };
      await this.loanService.createLoan(payload, this.loanNewFiles.length > 0 ? this.loanNewFiles : undefined);
      this.loanNewFiles = [];
      this.loanNewFileNames = [];
      await this.openLoanSection();
    } catch (e) {
      this.error = 'Eroare la crearea împrumutului';
    }
    this.loading = false;
  }

  async returnLoan() {
    if (!this.activeLoanData) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        conditionOnReturn: this.returnLoanForm.value.conditionOnReturn || null,
        notes: this.returnLoanForm.value.notes || null,
        returnedAt: this.returnLoanForm.value.returnedAt
      };
      await this.loanService.returnLoan(String(this.activeLoanData.id), payload);
      await this.openLoanSection();
    } catch (e) {
      this.error = 'Eroare la returnarea împrumutului';
    }
    this.loading = false;
  }

  async saveLoan() {
    if (!this.assetId || !this.activeLoanData || this.loanForm.invalid) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = {
        assetId: this.assetId,
        loanedToName: this.loanForm.value.loanedToName,
        condition: this.loanForm.value.condition,
        notes: this.loanForm.value.notes || null,
        loanedAt: this.loanForm.value.loanedAt
      };
      await this.loanService.updateLoan(String(this.activeLoanData.id), payload, this.loanEditFiles.length > 0 ? this.loanEditFiles : undefined);
      this.loanEditFiles = [];
      this.loanEditFileNames = [];
      await this.openLoanSection();
    } catch (e) {
      this.error = 'Eroare la salvarea împrumutului';
    }
    this.loading = false;
  }

  async deleteLoan() {
    if (!this.activeLoanData) return;
    this.loading = true;
    this.error = null;
    try {
      await this.loanService.deleteLoan(String(this.activeLoanData.id));
      this.activeLoanData = null;
      this.loanForm.reset({ loanedAt: new Date().toISOString().substring(0, 10) });
    } catch (e) {
      this.error = 'Eroare la ștergerea împrumutului';
    }
    this.loading = false;
  }
  showAddWarrantyForm = false;
  

  // Status maps (same as InventoryComponent)
  private warrantyStatusTextMap: { [key: string]: string } = {
    '0': 'Neîncepută',
    '1': 'Activă',
    '2': 'Aproape de expirare',
    '3': 'Expirată',
    'null': 'Lipsă',
    'undefined': 'Necunoscut',
  };
  private warrantyStatusClassMap: { [key: string]: string } = {
    '0': 'notstarted',
    '1': 'active',
    '2': 'soon',
    '3': 'expired',
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
    '0': 'Neînceput',
    '1': 'Activ',
    '2': 'Expiră curând',
    '3': 'Expirat',
    'null': 'Lipsă',
    'undefined': 'Necunoscut',
  };
  private customTrackerStatusClassMap: { [key: string]: string } = {
    '0': 'notstarted',
    '1': 'active',
    '2': 'expiredsoon',
    '3': 'expired',
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

  // Loan edit file selection (multiple)
  onLoanEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        this.loanEditFiles.push(input.files[i]);
        this.loanEditFileNames.push(input.files[i].name);
      }
    }
    input.value = '';
  }
  removeLoanEditFile(index: number) {
    this.loanEditFiles.splice(index, 1);
    this.loanEditFileNames.splice(index, 1);
  }

  // Loan new file selection (multiple)
  onLoanNewFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        this.loanNewFiles.push(input.files[i]);
        this.loanNewFileNames.push(input.files[i].name);
      }
    }
    input.value = '';
  }
  removeLoanNewFile(index: number) {
    this.loanNewFiles.splice(index, 1);
    this.loanNewFileNames.splice(index, 1);
  }

  // Download loan document by document ID
  async downloadLoanDocument(doc: any) {
    if (!doc?.id) return;
    this.loading = true;
    try {
      const blob = await this.loanService.downloadLoanDocument(String(doc.id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      this.error = 'Eroare la descărcarea documentului';
    }
    this.loading = false;
  }

  // Delete single loan document by document ID
  async deleteLoanDocument(doc: any) {
    if (!doc?.id) return;
    this.loading = true;
    this.error = null;
    try {
      await this.loanService.deleteLoanDocument(String(doc.id));
      // Refresh data
      await this.openLoanSection();
    } catch (e) {
      this.error = 'Eroare la ștergerea documentului';
    }
    this.loading = false;
  }

  // Delete all loan documents
  async deleteAllLoanDocuments() {
    if (!this.activeLoanData) return;
    this.loading = true;
    this.error = null;
    try {
      await this.loanService.deleteAllLoanDocuments(String(this.activeLoanData.id));
      await this.openLoanSection();
    } catch (e) {
      this.error = 'Eroare la ștergerea documentelor';
    }
    this.loading = false;
  }

  // --- Warranty tree picker methods ---
  async openWarrantyTreePicker(): Promise<void> {
    this.warrantyTreePickerVisible = true;
    this.warrantyShowSpaceSearchResults = false;
    if (this.warrantyTreeNodes.length === 0) {
      this.warrantyTreeLoading = true;
      try {
        const roots = await this.spaceService.getSpacesParents();
        this.warrantyTreeNodes = roots.map((r: any) => ({ ...r, expanded: false, childrenLoaded: false, children: [], loadingChildren: false }));
      } finally { this.warrantyTreeLoading = false; }
    }
    if (this.warrantySelectedTreeNode?.id) {
      try {
        const chain: any[] = await this.spaceService.getParentChain(this.warrantySelectedTreeNode.id.toString());
        let currentLevel = this.warrantyTreeNodes;
        for (const ancestor of chain) {
          const node = currentLevel.find((n: any) => n.id === ancestor.id);
          if (!node) break;
          if (!node.childrenLoaded) {
            const children = await this.spaceService.getSpaceByIdParents(node.id.toString());
            node.children = children.map((c: any) => ({ ...c, expanded: false, childrenLoaded: false, children: [], loadingChildren: false }));
            node.childrenLoaded = true;
          }
          if (node.children.length > 0) { node.expanded = true; }
          currentLevel = node.children;
        }
      } catch {}
    }
  }

  async toggleWarrantyTreeNode(node: any): Promise<void> {
    if (node.expanded) { node.expanded = false; return; }
    if (!node.childrenLoaded) {
      node.loadingChildren = true;
      try {
        const children = await this.spaceService.getSpaceByIdParents(node.id.toString());
        node.children = children.map((c: any) => ({ ...c, expanded: false, childrenLoaded: false, children: [], loadingChildren: false }));
        node.childrenLoaded = true;
      } finally { node.loadingChildren = false; }
    }
    if (node.children.length > 0) { node.expanded = true; }
  }

  selectWarrantyTreeNode(node: any): void {
    this.warrantySelectedTreeNode = node;
    this.warrantyTreePickerVisible = false;
  }

  clearWarrantyTreeSelection(): void {
    this.warrantySelectedTreeNode = null;
    this.warrantySpaceSearchQuery = '';
    this.warrantySpaceSearchResults = [];
    this.warrantyShowSpaceSearchResults = false;
    this.warrantyTreeNodes = [];
  }

  onWarrantySpaceSearchInput(): void {
    const query = this.warrantySpaceSearchQuery.trim();
    if (this.warrantySpaceSearchTimeout) { clearTimeout(this.warrantySpaceSearchTimeout); }
    if (query.length < 2) { this.warrantySpaceSearchResults = []; this.warrantyShowSpaceSearchResults = false; return; }
    this.warrantyTreePickerVisible = false;
    this.warrantySpaceSearchTimeout = setTimeout(() => { this.performWarrantySpaceSearch(query); }, 300);
  }

  async performWarrantySpaceSearch(query: string): Promise<void> {
    this.warrantyIsSearchingSpaces = true;
    this.warrantyShowSpaceSearchResults = true;
    try {
      const results = await this.spaceService.searchSpaces(query);
      this.warrantySpaceSearchResults = Array.isArray(results) ? results : [];
    } catch { this.warrantySpaceSearchResults = []; }
    finally { this.warrantyIsSearchingSpaces = false; }
  }

  async selectWarrantySpaceFromSearch(space: any): Promise<void> {
    this.warrantySelectedTreeNode = { ...space, expanded: false, childrenLoaded: false, children: [], loadingChildren: false };
    this.warrantySpaceSearchQuery = '';
    this.warrantyShowSpaceSearchResults = false;
    this.warrantyTreeNodes = [];
  }

  startEditingWarrantySpace(): void {
    this.warrantySelectedTreeNode = null;
    this.warrantySpaceSearchQuery = '';
    this.warrantyTreePickerVisible = false;
    this.warrantyTreeNodes = [];
  }

  onWarrantySpaceSearchFocus(): void {
    if (this.warrantySpaceSearchQuery.trim().length >= 2) { this.warrantyShowSpaceSearchResults = true; }
  }

  // --- Insurance tree picker methods ---
  async openInsuranceTreePicker(): Promise<void> {
    this.insuranceTreePickerVisible = true;
    this.insuranceShowSpaceSearchResults = false;
    if (this.insuranceTreeNodes.length === 0) {
      this.insuranceTreeLoading = true;
      try {
        const roots = await this.spaceService.getSpacesParents();
        this.insuranceTreeNodes = roots.map((r: any) => ({ ...r, expanded: false, childrenLoaded: false, children: [], loadingChildren: false }));
      } finally { this.insuranceTreeLoading = false; }
    }
    if (this.insuranceSelectedTreeNode?.id) {
      try {
        const chain: any[] = await this.spaceService.getParentChain(this.insuranceSelectedTreeNode.id.toString());
        let currentLevel = this.insuranceTreeNodes;
        for (const ancestor of chain) {
          const node = currentLevel.find((n: any) => n.id === ancestor.id);
          if (!node) break;
          if (!node.childrenLoaded) {
            const children = await this.spaceService.getSpaceByIdParents(node.id.toString());
            node.children = children.map((c: any) => ({ ...c, expanded: false, childrenLoaded: false, children: [], loadingChildren: false }));
            node.childrenLoaded = true;
          }
          if (node.children.length > 0) { node.expanded = true; }
          currentLevel = node.children;
        }
      } catch {}
    }
  }

  async toggleInsuranceTreeNode(node: any): Promise<void> {
    if (node.expanded) { node.expanded = false; return; }
    if (!node.childrenLoaded) {
      node.loadingChildren = true;
      try {
        const children = await this.spaceService.getSpaceByIdParents(node.id.toString());
        node.children = children.map((c: any) => ({ ...c, expanded: false, childrenLoaded: false, children: [], loadingChildren: false }));
        node.childrenLoaded = true;
      } finally { node.loadingChildren = false; }
    }
    if (node.children.length > 0) { node.expanded = true; }
  }

  selectInsuranceTreeNode(node: any): void {
    this.insuranceSelectedTreeNode = node;
    this.insuranceTreePickerVisible = false;
  }

  clearInsuranceTreeSelection(): void {
    this.insuranceSelectedTreeNode = null;
    this.insuranceSpaceSearchQuery = '';
    this.insuranceSpaceSearchResults = [];
    this.insuranceShowSpaceSearchResults = false;
    this.insuranceTreeNodes = [];
  }

  onInsuranceSpaceSearchInput(): void {
    const query = this.insuranceSpaceSearchQuery.trim();
    if (this.insuranceSpaceSearchTimeout) { clearTimeout(this.insuranceSpaceSearchTimeout); }
    if (query.length < 2) { this.insuranceSpaceSearchResults = []; this.insuranceShowSpaceSearchResults = false; return; }
    this.insuranceTreePickerVisible = false;
    this.insuranceSpaceSearchTimeout = setTimeout(() => { this.performInsuranceSpaceSearch(query); }, 300);
  }

  async performInsuranceSpaceSearch(query: string): Promise<void> {
    this.insuranceIsSearchingSpaces = true;
    this.insuranceShowSpaceSearchResults = true;
    try {
      const results = await this.spaceService.searchSpaces(query);
      this.insuranceSpaceSearchResults = Array.isArray(results) ? results : [];
    } catch { this.insuranceSpaceSearchResults = []; }
    finally { this.insuranceIsSearchingSpaces = false; }
  }

  async selectInsuranceSpaceFromSearch(space: any): Promise<void> {
    this.insuranceSelectedTreeNode = { ...space, expanded: false, childrenLoaded: false, children: [], loadingChildren: false };
    this.insuranceSpaceSearchQuery = '';
    this.insuranceShowSpaceSearchResults = false;
    this.insuranceTreeNodes = [];
  }

  startEditingInsuranceSpace(): void {
    this.insuranceSelectedTreeNode = null;
    this.insuranceSpaceSearchQuery = '';
    this.insuranceTreePickerVisible = false;
    this.insuranceTreeNodes = [];
  }

  onInsuranceSpaceSearchFocus(): void {
    if (this.insuranceSpaceSearchQuery.trim().length >= 2) { this.insuranceShowSpaceSearchResults = true; }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tree-picker-wrapper')) {
      this.warrantyShowSpaceSearchResults = false;
      this.warrantyTreePickerVisible = false;
      this.insuranceShowSpaceSearchResults = false;
      this.insuranceTreePickerVisible = false;
    }
  }
}
