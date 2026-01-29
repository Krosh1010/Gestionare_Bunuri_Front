
import { AssetsReadModel } from '../../../models/assetsmodel/assets-read.model';
import { AssetsService } from '../../../services/ApiServices/assets.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgFor } from '@angular/common'; 


@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule,NgFor,CommonModule,ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  // Assets data
  assets: AssetsReadModel[] = [];

  // Filtered assets
  filteredAssets: AssetsReadModel[] = [];

  // Search and filters
  searchQuery: string = '';
  showFilter: boolean = false;
  activeFilters: number = 0;

  filters = {
    categories: {
      electronics: false,
      furniture: false,
      vehicles: false,
      documents: false
    },
    status: {
      active: false,
      inactive: false,
      maintenance: false
    }
  };

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  // Modal state
  showModal: boolean = false;
  editingAsset: AssetsReadModel | null = null;
  assetForm: FormGroup;

  // Stats
  totalAssets: number = 0;
  activeAssets: number = 0;
  totalValue: number = 0;
  expiringSoon: number = 0;

  constructor(private fb: FormBuilder, private assetsService: AssetsService) {
    this.assetForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      id: [''],
      location: [''],
      status: ['active'],
      purchaseDate: [''],
      warrantyEnd: [''],
      additionalInfo: ['']
    });
  }

  ngOnInit(): void {
    this.assetsService.getAssets().then((data: any) => {
      // dacă backendul returnează array, folosește-l direct
      this.assets = Array.isArray(data) ? data : [data];
      this.filteredAssets = [...this.assets];
      this.updateStats();
    }).catch(() => {
      this.assets = [];
      this.filteredAssets = [];
      this.updateStats();
    });
  }

  // Filter and search
  filterAssets(): void {
    this.filteredAssets = this.assets.filter(asset => {
      const matchesSearch = this.searchQuery === '' || 
        asset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        asset.id.toString().toLowerCase().includes(this.searchQuery.toLowerCase());

      const categories = Object.entries(this.filters.categories)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      const matchesCategory = categories.length === 0 || 
        categories.includes(asset.category);

      // Status filter: dacă nu există status pe model, ignoră
      let matchesStatus = true;
      if ('status' in asset && asset.status) {
        const statuses = Object.entries(this.filters.status)
          .filter(([_, value]) => value)
          .map(([key, _]) => key);
        matchesStatus = statuses.length === 0 || statuses.includes((asset as any).status);
      }
      return matchesSearch && matchesCategory && matchesStatus;
    });
    this.updateStats();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  applyFilters(): void {
    this.activeFilters = this.countActiveFilters();
    this.filterAssets();
    this.showFilter = false;
  }

  clearFilters(): void {
    this.filters.categories = {
      electronics: false,
      furniture: false,
      vehicles: false,
      documents: false
    };
    this.filters.status = {
      active: false,
      inactive: false,
      maintenance: false
    };
    this.activeFilters = 0;
    this.filterAssets();
    this.showFilter = false;
  }

  countActiveFilters(): number {
    let count = 0;
    
    // Count category filters
    count += Object.values(this.filters.categories).filter(v => v).length;
    
    // Count status filters
    count += Object.values(this.filters.status).filter(v => v).length;
    
    return count;
  }

  // View mode
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Asset operations
  openAddModal(): void {
    this.editingAsset = null;
    this.assetForm.reset({
      name: '',
      description: '',
      category: '',
      value: 0,
      id: '',
      location: '',
      status: 'active',
      purchaseDate: '',
      warrantyEnd: '',
      additionalInfo: ''
    });
    this.showModal = true;
  }

  editAsset(asset: AssetsReadModel): void {
    this.editingAsset = asset;
    this.assetForm.patchValue(asset);
    this.showModal = true;
  }

  viewAsset(asset: AssetsReadModel): void {
    // For demo, just show an alert
    alert(`Detalii bun:\n\nNume: ${asset.name}\nID: ${asset.id}\nCategorie: ${this.getCategoryText(asset.category)}\nValoare: ${asset.value} EUR\nLocație: ${asset.location}\nStare: ${this.getStatusText(asset.status ?? '')}`);
  }

  deleteAsset(asset: AssetsReadModel): void {
      if (confirm(`Ești sigur că vrei să ștergi bunul "${asset.name}"?`)) {
        this.assetsService.deleteAsset(asset.id).then(() => {
          // Remove asset from local list after successful delete
          const index = this.assets.findIndex(a => a.id === asset.id);
          if (index !== -1) {
            this.assets.splice(index, 1);
            this.filterAssets();
          }
        }).catch(() => {
          alert('Eroare la ștergerea bunului. Încearcă din nou.');
        });
      }
  }

  saveAsset(): void {
    if (this.assetForm.valid) {
      const formData = this.assetForm.value;
      
      // Generate ID if not provided
      if (!formData.id) {
        formData.id = 'AG-' + (this.assets.length + 1).toString().padStart(3, '0');
      }

      if (this.editingAsset) {
        // Update existing asset
        const index = this.assets.findIndex(a => a.id === this.editingAsset?.id);
        if (index !== -1) {
          this.assets[index] = { ...this.editingAsset, ...formData };
        }
      } else {
        // Add new asset
        this.assets.push(formData);
      }

      this.filterAssets();
      this.closeModal();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAsset = null;
  }

  // Stats
  updateStats(): void {
    this.totalAssets = this.filteredAssets.length;
    this.activeAssets = this.filteredAssets.filter(a => a.status === 'active').length;
    this.totalValue = this.filteredAssets.reduce((sum, asset) => sum + asset.value, 0);
    
    // Count assets with warranty expiring in the next 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    this.expiringSoon = this.filteredAssets.filter(asset => {
      if (!asset.warrantyEnd) return false;
      
      const warrantyDate = new Date(asset.warrantyEnd);
      return warrantyDate >= today && warrantyDate <= thirtyDaysFromNow;
    }).length;
  }

  // Helpers
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

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      active: 'Activat',
      inactive: 'Dezactivat',
      maintenance: 'În service',
      sold: 'Vândut'
    };
    return texts[status] || 'Necunoscut';
  }

  isExpiringSoon(asset: AssetsReadModel): boolean {
    if (!asset.warrantyEnd) return false;
    
    const warrantyDate = new Date(asset.warrantyEnd);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return warrantyDate >= today && warrantyDate <= thirtyDaysFromNow;
  }

  getWarrantyDays(asset: AssetsReadModel): number | null {
    if (!asset.warrantyEnd) return null;
    
    const warrantyDate = new Date(asset.warrantyEnd);
    const today = new Date();
    const diffTime = warrantyDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : null;
  }
}
