import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarrantyStatusService } from '../../../services/ApiServices/coveragestatus/warranty.status.sservice';
import { InsuranceStatusService } from '../../../services/ApiServices/coveragestatus/insurance.status.service';
import { WarrantyItem } from '../../../models/statusmodel/warranty.insurance.model';


@Component({
  selector: 'app-coveragestatus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coveragestatus.component.html',
  styleUrl: './coveragestatus.component.scss'
})
export class CoveragestatusComponent {
  selectedType: 'warranty' | 'insurance' | null = null;
  selectedStatus: 'expired' | 'expiring-soon' | 'active' | 'no-coverage' | null = null;
  warrantyItems: WarrantyItem[] = [];
  insuranceItems: WarrantyItem[] = [];
  filteredItems: WarrantyItem[] = [];
  totalItems = 0;
  totalValue = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoading = false;

  // Warranty summary statistics
  warrantyStats = { total: 0, expired: 0, expiringSoon: 0, active: 0, noCoverage: 0 };
  // Insurance summary statistics
  insuranceStats = { total: 0, expired: 0, expiringSoon: 0, active: 0, noCoverage: 0, totalValue: 0 };

  constructor(
    private warrantyStatusService: WarrantyStatusService,
    private insuranceStatusService: InsuranceStatusService
  ) {}

  ngOnInit() {
  }


  async loadWarrantySummary() {
    this.isLoading = true;
    try {
      const summary = await this.warrantyStatusService.getWarrantyStatusSummary();
      this.warrantyStats = {
        total: summary.totalCount || 0,
        expired: summary.expiredCount || 0,
        expiringSoon: summary.expiringSoonCount || 0,
        active: summary.validMoreThanMonthCount || 0,
        noCoverage: summary.assetsWithoutWarrantyCount || 0
      };
      this.warrantyItems = [];
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.warrantyStats = { total: 0, expired: 0, expiringSoon: 0, active: 0, noCoverage: 0 };
      this.warrantyItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  async loadInsuranceSummary() {
    this.isLoading = true;
    try {
      const insuranceSummary = await this.insuranceStatusService.getInsuranceStatusSummary();
      this.insuranceStats = {
        total: insuranceSummary.totalCount || 0,
        expired: insuranceSummary.expiredCount || 0,
        expiringSoon: insuranceSummary.expiringSoonCount || 0,
        active: insuranceSummary.validMoreThanMonthCount || 0,
        noCoverage: insuranceSummary.assetsWithoutInsuranceCount || 0,
        totalValue: insuranceSummary.totalInsuredValue || 0
      };
      this.insuranceItems = [];
      this.applyFilters();
      this.updateStats();
    } catch (err) {
      this.insuranceStats = { total: 0, expired: 0, expiringSoon: 0, active: 0, noCoverage: 0, totalValue: 0 };
      this.insuranceItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  async selectType(type: 'warranty' | 'insurance') {
    // If clicking on the same type, reset status selection
    if (this.selectedType === type) {
      this.selectedStatus = null;
      this.filteredItems = [];
      return;
    }
    
    this.selectedType = type;
    this.selectedStatus = null; // Reset status when changing type
    this.filteredItems = [];
    
    if (type === 'warranty') {
      await this.loadWarrantySummary();
    } else if (type === 'insurance') {
      await this.loadInsuranceSummary();
    }
  }

  async selectStatus(status: 'expired' | 'expiring-soon' | 'active' | 'no-coverage') {
    this.selectedStatus = status;
    if (this.selectedType === 'warranty' && status === 'expired') {
      await this.loadExpiredWarranties();
    } else if (this.selectedType === 'warranty' && status === 'expiring-soon') {
      await this.loadExpiringWarranties();
    } else if (this.selectedType === 'warranty' && status === 'active') {
      await this.loadValidWarranties();
    } else if (this.selectedType === 'warranty' && status === 'no-coverage') {
      await this.loadWithoutWarranties();
    } else if (this.selectedType === 'insurance' && status === 'expired') {
      await this.loadExpiredInsurances();
    } else if (this.selectedType === 'insurance' && status === 'expiring-soon') {
      await this.loadExpiringInsurances();
    } else if (this.selectedType === 'insurance' && status === 'active') {
      await this.loadValidInsurances();
    } else if (this.selectedType === 'insurance' && status === 'no-coverage') {
      await this.loadWithoutInsurances();
    } else {
      this.applyFilters();
    }
  }

  private async loadWithoutInsurances() {
    this.isLoading = true;
    try {
      const without = await this.insuranceStatusService.getWithoutInsurances();
      this.insuranceItems = (without || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        status: 'no-coverage',
        value: 0,
        daysRemaining: 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.insuranceItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadValidInsurances() {
    this.isLoading = true;
    try {
      const valid = await this.insuranceStatusService.getValidInsurances();
      this.insuranceItems = (valid || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        value: item.value || item.assetValue || 0,
        insuranceEndDate: item.endDate ? new Date(item.endDate) : (item.insuranceEndDate ? new Date(item.insuranceEndDate) : undefined),
        warrantyStartDate: item.startDate ? new Date(item.startDate) : undefined,
        status: 'active',
        daysRemaining: item.daysLeft || 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.insuranceItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadExpiringInsurances() {
    this.isLoading = true;
    try {
      const expiring = await this.insuranceStatusService.getExpiringInsurances();
      this.insuranceItems = (expiring || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        value: item.value || item.assetValue || 0,
        insuranceEndDate: item.endDate ? new Date(item.endDate) : (item.insuranceEndDate ? new Date(item.insuranceEndDate) : undefined),
        warrantyStartDate: item.startDate ? new Date(item.startDate) : undefined,
        status: 'expiring-soon',
        daysRemaining: item.daysLeft || 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.insuranceItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadExpiredInsurances() {
    this.isLoading = true;
    try {
      const expired = await this.insuranceStatusService.getExpiredInsurances();
      this.insuranceItems = (expired || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        value: item.value || item.assetValue || 0,
        insuranceEndDate: item.endDate ? new Date(item.endDate) : (item.insuranceEndDate ? new Date(item.insuranceEndDate) : undefined),
        warrantyStartDate: item.startDate ? new Date(item.startDate) : undefined,
        status: 'expired',
        daysRemaining: 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.insuranceItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadExpiredWarranties() {
    this.isLoading = true;
    try {
      const expired = await this.warrantyStatusService.getExpiredWarranties();
      this.warrantyItems = (expired || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        warrantyStartDate: item.startDate ? new Date(item.startDate) : undefined,
        warrantyEndDate: item.endDate ? new Date(item.endDate) : (item.warrantyEndDate ? new Date(item.warrantyEndDate) : undefined),
        status: 'expired',
        daysRemaining: 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.warrantyItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadExpiringWarranties() {
    this.isLoading = true;
    try {
      const expiring = await this.warrantyStatusService.getExpiringWarranties();
      this.warrantyItems = (expiring || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        warrantyStartDate: item.startDate ? new Date(item.startDate) : undefined,
        warrantyEndDate: item.endDate ? new Date(item.endDate) : (item.warrantyEndDate ? new Date(item.warrantyEndDate) : undefined),
        status: 'expiring-soon',
        daysRemaining: item.daysLeft || 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.warrantyItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadValidWarranties() {
    this.isLoading = true;
    try {
      const valid = await this.warrantyStatusService.getValidWarranties();
      this.warrantyItems = (valid || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        warrantyStartDate: item.startDate ? new Date(item.startDate) : undefined,
        warrantyEndDate: item.endDate ? new Date(item.endDate) : (item.warrantyEndDate ? new Date(item.warrantyEndDate) : undefined),
        status: 'active',
        daysRemaining: item.daysLeft || 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.warrantyItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadWithoutWarranties() {
    this.isLoading = true;
    try {
      const without = await this.warrantyStatusService.getWithoutWarranties();
      this.warrantyItems = (without || []).map((item: any) => ({
        name: item.name || item.assetName,
        category: item.category?.toLowerCase() || 'other',
        status: 'no-coverage',
        daysRemaining: 0
      }));
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      this.warrantyItems = [];
      this.applyFilters();
      this.updateStats();
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    const items = this.selectedType === 'warranty' ? this.warrantyItems : this.insuranceItems;
    this.filteredItems = items.filter(item => item.status === this.selectedStatus);
    this.updatePagination();
  }

  clearFilters() {
    this.selectedType = null;
    this.selectedStatus = null;
    this.filteredItems = [];
    this.warrantyStats = { total: 0, expired: 0, expiringSoon: 0, active: 0, noCoverage: 0 };
    this.insuranceStats = { total: 0, expired: 0, expiringSoon: 0, active: 0, noCoverage: 0, totalValue: 0 };
    this.updateStats();
  }

  updateStats() {
    if (this.selectedType === 'warranty') {
      this.totalItems = this.warrantyStats.total;
      this.totalValue = 0;
    } else {
      this.totalItems = this.insuranceStats.total;
      this.totalValue = this.insuranceStats.totalValue;
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getStatusCount(status: string): number {
    if (this.selectedType === 'warranty') {
      switch (status) {
        case 'expired': return this.warrantyStats.expired;
        case 'expiring-soon': return this.warrantyStats.expiringSoon;
        case 'active': return this.warrantyStats.active;
        case 'no-coverage': return this.warrantyStats.noCoverage;
        case 'total': return this.warrantyStats.total;
        default: return 0;
      }
    } else {
      switch (status) {
        case 'expired': return this.insuranceStats.expired;
        case 'expiring-soon': return this.insuranceStats.expiringSoon;
        case 'active': return this.insuranceStats.active;
        case 'no-coverage': return this.insuranceStats.noCoverage;
        case 'total': return this.insuranceStats.total;
        default: return 0;
      }
    }
  }

  getTitle(): string {
    if (!this.selectedType || !this.selectedStatus) {
      return 'Selectează tipul și statusul';
    }
    const typeText = this.selectedType === 'warranty' ? 'Garanții' : 'Asigurări';
    const statusText: { [key: string]: string } = {
      'expired': 'Expirate',
      'expiring-soon': 'Aproape expiră',
      'active': 'Active',
      'no-coverage': this.selectedType === 'warranty' ? 'Fără garanție' : 'Fără asigurare'
    };
    return `${typeText} - ${statusText[this.selectedStatus]}`;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      electronics: '💻',
      furniture: '🛋️',
      vehicles: '🚗',
      documents: '📄',
      other: '📦'
    };
    return icons[category] || '📦';
  }

  getCategoryText(category: string): string {
    const texts: { [key: string]: string } = {
      electronics: 'Electronice',
      furniture: 'Mobilier',
      vehicles: 'Vehicule',
      documents: 'Documente',
      other: 'Altele'
    };
    return texts[category] || 'Altele';
  }

  getExpirationDate(item: WarrantyItem): Date | undefined {
    return this.selectedType === 'warranty' ? item.warrantyEndDate : item.insuranceEndDate;
  }

  getItemStatusClass(item: WarrantyItem): string {
    return item.status;
  }

  getItemStatusText(item: WarrantyItem): string {
    const texts: { [key: string]: string } = {
      'expired': 'Expirată',
      'expiring-soon': 'Expiră curând',
      'active': 'Activă',
      'no-coverage': this.selectedType === 'warranty' ? 'Fără garanție' : 'Fără asigurare'
    };
    return texts[item.status];
  }

  getDaysRemaining(item: WarrantyItem): number {
    return item.daysRemaining;
  }

  getProgressPercentage(item: WarrantyItem): number {
    const maxDays = 365;
    const remaining = Math.max(0, item.daysRemaining);
    return Math.min(100, (remaining / maxDays) * 100);
  }

  isExpiringSoon(item: WarrantyItem): boolean {
    return item.status === 'expiring-soon';
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.filteredItems.length);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
