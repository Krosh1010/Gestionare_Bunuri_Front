
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WarrantyItem {
  id: number;
  name: string;
  category: string;
  value: number;
  purchaseDate: Date;
  warrantyEndDate?: Date;
  insuranceEndDate?: Date;
  status: 'expired' | 'expiring-soon' | 'active';
  daysRemaining: number;
}

@Component({
  selector: 'app-coveragestatus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coveragestatus.component.html',
  styleUrl: './coveragestatus.component.scss'
})
export class CoveragestatusComponent {
  selectedType: 'warranty' | 'insurance' = 'warranty';
  selectedStatus: 'expired' | 'expiring-soon' | 'active' = 'expired';
  warrantyItems: WarrantyItem[] = [];
  insuranceItems: WarrantyItem[] = [];
  filteredItems: WarrantyItem[] = [];
  totalItems = 0;
  totalValue = 0;
  lastUpdate = new Date();
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private mockWarrantyData: WarrantyItem[] = [
    { id: 1, name: 'Laptop Dell XPS 15', category: 'electronics', value: 1500, purchaseDate: new Date('2023-01-15'), warrantyEndDate: new Date('2024-01-15'), status: 'expired', daysRemaining: -30 },
    { id: 2, name: 'iPhone 14 Pro', category: 'electronics', value: 1200, purchaseDate: new Date('2023-06-01'), warrantyEndDate: new Date('2024-06-01'), status: 'active', daysRemaining: 150 },
    { id: 3, name: 'Scaun ergonomic', category: 'furniture', value: 450, purchaseDate: new Date('2023-11-01'), warrantyEndDate: new Date('2024-02-01'), status: 'expiring-soon', daysRemaining: 25 },
    { id: 4, name: 'Monitor Samsung 27"', category: 'electronics', value: 350, purchaseDate: new Date('2022-12-15'), warrantyEndDate: new Date('2023-12-15'), status: 'expired', daysRemaining: -45 },
    { id: 5, name: 'Imprimantă Canon', category: 'electronics', value: 250, purchaseDate: new Date('2023-03-20'), warrantyEndDate: new Date('2025-03-20'), status: 'active', daysRemaining: 430 },
  ];

  private mockInsuranceData: WarrantyItem[] = [
    { id: 6, name: 'Mașină personală', category: 'vehicles', value: 15000, purchaseDate: new Date('2022-05-10'), insuranceEndDate: new Date('2024-02-28'), status: 'expiring-soon', daysRemaining: 15 },
    { id: 7, name: 'Apartament', category: 'documents', value: 120000, purchaseDate: new Date('2020-01-15'), insuranceEndDate: new Date('2024-12-31'), status: 'active', daysRemaining: 320 },
    { id: 8, name: 'Bijuterii', category: 'other', value: 5000, purchaseDate: new Date('2023-08-01'), insuranceEndDate: new Date('2024-08-01'), status: 'active', daysRemaining: 210 },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.warrantyItems = [...this.mockWarrantyData];
    this.insuranceItems = [...this.mockInsuranceData];
    this.applyFilters();
    this.updateStats();
    this.lastUpdate = new Date();
  }

  selectType(type: 'warranty' | 'insurance') {
    this.selectedType = type;
    this.applyFilters();
  }

  selectStatus(status: 'expired' | 'expiring-soon' | 'active') {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    const items = this.selectedType === 'warranty' ? this.warrantyItems : this.insuranceItems;
    this.filteredItems = items.filter(item => item.status === this.selectedStatus);
    this.updatePagination();
  }

  clearFilters() {
    this.selectedType = 'warranty';
    this.selectedStatus = 'expired';
    this.applyFilters();
  }

  updateStats() {
    const items = this.selectedType === 'warranty' ? this.warrantyItems : this.insuranceItems;
    this.totalItems = items.length;
    this.totalValue = items.reduce((sum, item) => sum + item.value, 0);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getStatusCount(status: string): number {
    const items = this.selectedType === 'warranty' ? this.warrantyItems : this.insuranceItems;
    return items.filter(item => item.status === status).length;
  }

  getTitle(): string {
    const typeText = this.selectedType === 'warranty' ? 'Garanții' : 'Asigurări';
    const statusText = {
      'expired': 'Expirate',
      'expiring-soon': 'Aproape expiră',
      'active': 'Active'
    }[this.selectedStatus];
    return `${typeText} ${statusText}`;
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
    const texts = {
      'expired': 'Expirată',
      'expiring-soon': 'Expiră curând',
      'active': 'Activă'
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
