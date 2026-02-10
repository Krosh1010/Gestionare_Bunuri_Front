import { Component, OnInit } from '@angular/core';
import { ExportService } from '../../../services/ApiServices/export.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ExportFormat {
  value: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  constructor(private exportService: ExportService) {}

  // Quick export
  selectedQuickExport: string = 'all';
  
  // Filters
  selectedCategories: string[] = [];
  insuranceStatus: string = 'all';
  warrantyStatus: string = 'all';
  
  // Columns
  selectedColumns = {
    name: true,
    description: false,
    category: true,
    value: true,
    space: false,
    purchaseDate: false,
    warrantyStart: false,
    warrantyEnd: true,
    warrantyStatus: false,
    warrantyDays: false,
    warrantyProvider: false,
    insuranceStart: false,
    insuranceEnd: true,
    insuranceStatus: false,
    insuranceDays: false,
    insuranceValue: false,
    insuranceCompany: false
  };
  
  // Export options
  exportFormats: ExportFormat[] = [
    { value: 'csv', name: 'CSV', icon: '📄', description: 'Compatibil cu Excel' },
    { value: 'excel', name: 'Excel', icon: '📊', description: 'Format .xlsx' },
    { value: 'pdf', name: 'PDF', icon: '📑', description: 'Pentru printare' },
  ];
  
  selectedFormat: string = 'excel';
  isExporting: boolean = false;
  
  // Categories
  categories = [
    { value: 'electronics', name: 'Electronice', icon: '💻' },
    { value: 'furniture', name: 'Mobilier', icon: '🛋️' },
    { value: 'vehicles', name: 'Vehicule', icon: '🚗' },
    { value: 'documents', name: 'Documente', icon: '📄' },
    { value: 'other', name: 'Altele', icon: '📦' }
  ];

  ngOnInit() {
    // Auto-select all categories
    this.selectedCategories = this.categories.map(c => c.value);
  }
  
  // Quick export selection
  selectQuickExport(type: string) {
    this.selectedQuickExport = type;

    // Apply corresponding filters
    switch (type) {
      case 'all':
        this.clearQuickFilters();
        break;
      case 'insurance-expired':
        this.insuranceStatus = 'expiring-soon';
        this.warrantyStatus = 'all';
        break;
      case 'warranty-soon':
        this.warrantyStatus = 'expiring-soon';
        this.insuranceStatus = 'all';
        break;
    }
  }
  
  clearQuickFilters() {
    this.insuranceStatus = 'all';
    this.warrantyStatus = 'all';
  }
  
  // Filter methods
  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }
  
  setInsuranceStatus(status: string) {
    this.insuranceStatus = status;
  }
  
  setWarrantyStatus(status: string) {
    this.warrantyStatus = status;
  }
  
  // Column methods
  selectAllColumns() {
    Object.keys(this.selectedColumns).forEach(key => {
      (this.selectedColumns as any)[key] = true;
    });
  }
  
  deselectAllColumns() {
    Object.keys(this.selectedColumns).forEach(key => {
      (this.selectedColumns as any)[key] = false;
    });
  }
  
  getSelectedColumns(): string[] {
    return Object.entries(this.selectedColumns)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);
  }
  
  updateCustomExport() {
    // Called when column selection changes
  }
  
  updateExport() {
    // Called when format changes
  }
  
  async performExport() {
    this.isExporting = true;
    const payload: any = {
      categories: this.selectedCategories,
      InsuranceStatus: this.insuranceStatus,
      WarrantyStatus: this.warrantyStatus,
      columns: this.getSelectedColumns().map(col => {
        const colMap: { [key: string]: string } = {
          name: 'Name',
          description: 'Description',
          category: 'Category',
          value: 'Value',
          space: 'SpaceName',
          purchaseDate: 'PurchaseDate',
          warrantyStart: 'WarrantyStartDate',
          warrantyEnd: 'WarrantyEndDate',
          warrantyStatus: 'WarrantyStatus',
          warrantyDays: 'WarrantyDaysLeft',
          warrantyProvider: 'WarrantyProvider',
          insuranceStart: 'InsuranceStartDate',
          insuranceEnd: 'InsuranceEndDate',
          insuranceStatus: 'InsuranceStatus',
          insuranceDays: 'InsuranceDaysLeft',
          insuranceValue: 'InsuranceValue',
          insuranceCompany: 'InsuranceCompany'
        };
        return colMap[col] || col;
      }),
      format: this.selectedFormat
    };

    try {
      let blob;
      if (this.selectedFormat === 'pdf') {
        blob = await this.exportService.exportAssetsToPdf(payload);
      } else if (this.selectedFormat === 'csv') {
        blob = await this.exportService.exportAssetsToCsv(payload);
      } else {
        blob = await this.exportService.exportAssetsToExcel(payload);
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.generateFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Eroare la export!');
    } finally {
      this.isExporting = false;
    }
  }
  
  generateFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    const typeNames: { [key: string]: string } = {
      'all': 'toate-bunurile',
      'insurance-expired': 'asigurari-aproape-expirate',
      'warranty-soon': 'garantii-aproape-expirate'
    };
    const type = typeNames[this.selectedQuickExport] || 'export';
    let ext = this.selectedFormat;
    if (this.selectedFormat === 'excel') {
      ext = 'xlsx';
    }
    return `export-${type}-${date}.${ext}`;
  }
}
