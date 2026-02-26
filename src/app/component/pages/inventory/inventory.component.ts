
import { AssetsReadModel } from '../../../models/assetsmodel/assets-read.model';
import { AssetsService } from '../../../services/ApiServices/assets.service';
import { SpaceService } from '../../../services/ApiServices/space.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgFor } from '@angular/common'; 
import { WarrantyInsuranceFormComponent } from '../inventory/warranty-insurance-form/warranty-insurance-form.component';
import { WarrantyInsuranceSetingsComponent } from '../inventory/warranty-insurance-setings/warranty-insurance-setings.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule,NgFor,CommonModule,ReactiveFormsModule, WarrantyInsuranceFormComponent, WarrantyInsuranceSetingsComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})

export class InventoryComponent implements OnInit {
        // ...existing code...
    // Metodă pentru template: deschide editarea pe baza assetului
    editAsset(asset: AssetsReadModel) {
      this.editAssetById(asset.id);
    }
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
    priceMin: null as number | null,
    priceMax: null as number | null,
    spaceId: null as number | null
  };

  // Spaces for filter dropdown
  filterSpaces: any[] = [];
  filterParentLevels: any[][] = [];
  filterSelectedParentIds: (number | null)[] = [];
  filterSelectedSpaceName: string | null = null;

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
  totalWarranties: number = 0;

  parentLevels: any[][] = [];
  selectedParentIds: (number | null)[] = [];
selectedSpaceName: string | null = null;
  selectedSpaceId: number | null = null;
  isLoadingSpaces = false;
  isLeafSpaceSelected = false;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  totalItems: number = 0;
  isLoadingAssets: boolean = false;

  // Modal pentru warranty/insurance
  showWarrantyModal: boolean = false;
  createdAssetId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private assetsService: AssetsService,
    private spaceService: SpaceService,
  ) {
    this.assetForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      location: [''],
      purchaseDate: [''],
      warrantyEnd: [''],
      spaceId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAssets();
  }

  async loadAssets(page: number = 1): Promise<void> {
    this.isLoadingAssets = true;
    this.currentPage = page;
    try {
      const data = await this.assetsService.getAssets(this.currentPage, this.pageSize);
      // Backend-ul paginat returnează { items, totalCount } sau direct array
      if (data && data.items) {
        this.assets = data.items;
        this.totalItems = data.totalCount ?? data.items.length;
        if (typeof data.totalValue === 'number') {
          this.totalValue = data.totalValue;
        }
      } else if (Array.isArray(data)) {
        this.assets = data;
        this.totalItems = data.length;
        // Dacă nu vine din back, calculează local
        this.totalValue = this.assets.reduce((sum, asset) => sum + asset.value, 0);
      } else {
        this.assets = [data];
        this.totalItems = 1;
        this.totalValue = this.assets[0]?.value || 0;
      }
      this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
      this.filteredAssets = [...this.assets];
      this.updateStats();
    } catch {
      this.assets = [];
      this.filteredAssets = [];
      this.totalItems = 0;
      this.totalValue = 0;
      this.totalPages = 1;
      this.updateStats();
    } finally {
      this.isLoadingAssets = false;
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.loadAssets(page);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
      // Modal pentru setări garanție/asigurare la editare
    showWarrantySettingsModal: boolean = false;

    openWarrantySettingsModal(): void {
      this.showWarrantySettingsModal = true;
    }

    closeWarrantySettingsModal(): void {
      this.showWarrantySettingsModal = false;
    }
  
    getSelectValue(event: Event): number {
    const target = event.target as HTMLSelectElement | null;
    if (target && target.value) {
      return +target.value;
    }
    return 0;
  }
  // Pentru a preveni refresh-ul vizibil la dropdownuri (ca la locations)
  // TrackBy pentru dropdown-uri de spații: folosește indexul nivelului
  trackByLevel(index: number, _level: any[]) {
    return index;
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

      // Price range filter
      let matchesPrice = true;
      if (this.filters.priceMin !== null && this.filters.priceMin !== undefined) {
        matchesPrice = asset.value >= this.filters.priceMin;
      }
      if (matchesPrice && this.filters.priceMax !== null && this.filters.priceMax !== undefined) {
        matchesPrice = asset.value <= this.filters.priceMax;
      }

      // Space filter
      let matchesSpace = true;
      if (this.filters.spaceId !== null && this.filters.spaceId !== undefined) {
        matchesSpace = asset.spaceId === this.filters.spaceId;
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesSpace;
    });
    this.updateStats();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    if (this.showFilter) {
      this.loadFilterSpaces();
    }
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
    this.filters.priceMin = null;
    this.filters.priceMax = null;
    this.filters.spaceId = null;
    this.filterSelectedSpaceName = null;
    this.filterParentLevels = [];
    this.filterSelectedParentIds = [];
    this.activeFilters = 0;
    this.filterAssets();
    this.showFilter = false;
  }

  countActiveFilters(): number {
    let count = 0;
    
    // Count category filters
    count += Object.values(this.filters.categories).filter(v => v).length;
    
    // Count price filters
    if (this.filters.priceMin !== null && this.filters.priceMin !== undefined) count++;
    if (this.filters.priceMax !== null && this.filters.priceMax !== undefined) count++;
    
    // Count space filter
    if (this.filters.spaceId !== null && this.filters.spaceId !== undefined) count++;
    
    return count;
  }

  // Filter space selection
  async loadFilterSpaces(): Promise<void> {
    if (this.filterParentLevels.length > 0) return;
    try {
      const roots = await this.spaceService.getSpacesParents();
      this.filterParentLevels = [roots];
    } catch (e) {
      this.filterParentLevels = [];
    }
  }

  async onFilterSpaceSelected(level: number, parentId: number | null): Promise<void> {
    this.filterSelectedParentIds[level] = parentId;
    this.filterSelectedParentIds.length = level + 1;
    this.filterParentLevels.length = level + 1;

    if (!parentId) {
      this.filters.spaceId = null;
      this.filterSelectedSpaceName = null;
      return;
    }

    this.filters.spaceId = parentId;
    // Find name from current level
    const currentLevel = this.filterParentLevels[level];
    const selected = currentLevel?.find((s: any) => s.id === parentId);
    this.filterSelectedSpaceName = selected?.name || null;

    try {
      const children = await this.spaceService.getSpaceByIdParents(parentId.toString());
      if (children && children.length > 0) {
        this.filterParentLevels.push(children);
      }
    } catch (e) {
      // no children
    }
  }

  // View mode
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Asset operations
async openAddModal() {
  this.assetForm.reset({
    name: '',
    description: '',
    category: '',
    value: 0,
    purchaseDate: '',
    warrantyEnd: '',
    spaceId: null
  });

  this.parentLevels = [];
  this.selectedParentIds = [];
  this.isLeafSpaceSelected = false;

  this.isLoadingSpaces = true;
  try {
    const roots = await this.spaceService.getSpacesParents();
    this.parentLevels.push(roots);
  } finally {
    this.isLoadingSpaces = false;
  }

  this.showModal = true;
}


  async onParentSelected(level: number, parentId: number | null) {
  this.selectedParentIds[level] = parentId;
  this.selectedParentIds.length = level + 1;
  this.parentLevels.length = level + 1;

  // Dacă nu e selectat nimic, resetează
  if (!parentId) {
    this.assetForm.patchValue({ spaceId: null });
    this.isLeafSpaceSelected = false;
    return;
  }

  this.isLoadingSpaces = true;

  try {
    const children = await this.spaceService.getSpaceByIdParents(parentId.toString());
    // Setează spaceId pentru orice selecție validă
    this.assetForm.patchValue({ spaceId: parentId });
    // Permite adăugarea pe orice spațiu selectat
    this.isLeafSpaceSelected = true;
    if (children && children.length > 0) {
      // Dacă există copii, adaugă nivel nou, dar spaceId rămâne setat
      this.parentLevels.push(children);
    }
  } finally {
    this.isLoadingSpaces = false;
  }
}



  // Editare cu GET la asset și populare spații pe niveluri
  async editAssetById(assetId: string | number): Promise<void> {
    this.isLoadingSpaces = true;
    try {
      // 1. Ia asset-ul complet
      const asset = await this.assetsService.getAssetById(assetId.toString()) as import('../../../models/assetsmodel/assets-read.model').AssetsReadModel;
      this.editingAsset = asset;

      // 2. Populează spațiile pe niveluri dacă există spaceId
      this.parentLevels = [];
      this.selectedParentIds = [];
      this.isLeafSpaceSelected = false;
      if (asset.spaceId) {
        // Folosește getParentChain pentru a popula toate nivelurile
        let parentChain: any[] = [];
        try {
          parentChain = await this.spaceService.getParentChain(asset.spaceId.toString());
        } catch {
          parentChain = [];
        }
        if (!parentChain || parentChain.length === 0) {
          const roots = await this.spaceService.getSpacesParents();
          this.parentLevels = [roots];
        } else {
          let currentLevelSpaces = await this.spaceService.getSpacesParents();
          this.parentLevels = [currentLevelSpaces];
          this.selectedParentIds = [];
          for (let i = 0; i < parentChain.length; i++) {
            const parent = parentChain[i];
            this.selectedParentIds[i] = parent.id;
            if (i < parentChain.length - 1) {
              currentLevelSpaces = await this.spaceService.getSpaceByIdParents(parent.id.toString());
              this.parentLevels.push(currentLevelSpaces);
            }
          }
        }
        this.assetForm.patchValue({ spaceId: asset.spaceId });
        // După ce am setat dropdown-urile, dacă spațiul selectat are copii, adaugă încă un dropdown
        const children = await this.spaceService.getSpaceByIdParents(asset.spaceId.toString());
        if (children && children.length > 0) {
          this.parentLevels.push(children);
        }
        this.isLeafSpaceSelected = true;
      } else {
        const roots = await this.spaceService.getSpacesParents();
        this.parentLevels = [roots];
      }

      // 3. Populează formularul cu datele asset-ului (inclusiv datele pentru input type="date")
      this.assetForm.patchValue({
        ...asset,
        purchaseDate: asset.purchaseDate ? this.formatDateForInput(asset.purchaseDate) : '',
        warrantyEnd: asset.warrantyEnd ? this.formatDateForInput(asset.warrantyEnd) : '',
      });
      this.showModal = true;
    } finally {
      this.isLoadingSpaces = false;
    }
  }

  // Util: formatează data pentru input type="date"
  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  viewAsset(asset: AssetsReadModel): void {
    // For demo, just show an alert
    alert(`Detalii bun:\n\nNume: ${asset.name}\nID: ${asset.id}\nCategorie: ${this.getCategoryText(asset.category)}\nValoare: ${asset.value} EUR\nLocație: ${asset.spaceName}\nStare: ${this.getStatusText(asset.status ?? '')}`);
  }

  deleteAsset(asset: AssetsReadModel): void {
      if (confirm(`Ești sigur că vrei să ștergi bunul "${asset.name}"?`)) {
        this.assetsService.deleteAsset(asset.id).then(() => {
          // Reload current page after successful delete
          this.loadAssets(this.currentPage);
        }).catch(() => {
          alert('Eroare la ștergerea bunului. Încearcă din nou.');
        });
      }
  }

  async saveAsset(): Promise<void> {
    if (this.assetForm.valid) {
      const formData = this.assetForm.value;
      if (this.editingAsset) {
        // ...existing code for edit...
        const patch: any = {};
        if (formData.spaceId !== this.editingAsset.spaceId) patch.spaceId = formData.spaceId;
        if (formData.name !== this.editingAsset.name) patch.name = formData.name;
        if (formData.value !== this.editingAsset.value) patch.value = formData.value;
        if (formData.category !== this.editingAsset.category) patch.category = formData.category;
        if (formData.purchaseDate !== this.formatDateForInput(this.editingAsset.purchaseDate)) patch.purchaseDate = formData.purchaseDate;
        if (formData.description !== this.editingAsset.description) patch.description = formData.description;
        if (formData.warrantyEnd !== this.formatDateForInput(this.editingAsset.warrantyEnd ?? '')) patch.warrantyEnd = formData.warrantyEnd;
        if (Object.keys(patch).length === 0) {
          alert('Nu ai modificat nimic.');
          return;
        }
        try {
          await this.assetsService.updateAsset(this.editingAsset.id, patch);
          await this.loadAssets(this.currentPage);
          this.closeModal();
        } catch (err) {
          alert('Eroare la editarea bunului.');
        }
      } else {
        // Adăugare nouă
        const assetToSend = {
          name: formData.name,
          spaceId: formData.spaceId,
          value: formData.value,
          category: formData.category,
          purchaseDate: formData.purchaseDate,
          description: formData.description
        };
        try {
          const created = await this.assetsService.createAsset(assetToSend);
          // Obține id-ul bunului creat (din răspunsul backendului)
          const createdId = created?.data?.id;
          // NU reîncărca lista de bunuri aici!
          // Deschide modalul pentru warranty/insurance dacă există id
          if (createdId) {
            this.createdAssetId = createdId;
            this.showWarrantyModal = true;
          }
          this.closeModal();
        } catch (err) {
          alert('Eroare la adăugarea bunului.');
        }
      }
    }
  }

  async closeWarrantyModal(): Promise<void> {
    this.showWarrantyModal = false;
    this.createdAssetId = null;
    // Reîncarcă lista de bunuri și statistici după ce utilizatorul finalizează garanția/asigurarea
    await this.loadAssets(this.currentPage);
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAsset = null;
  }

  // Stats
  updateStats(): void {
    this.totalAssets = this.filteredAssets.length;
    this.activeAssets = this.filteredAssets.filter(a => a.status === 'active').length;
    // totalValue nu se mai calculează aici, vine din backend
    
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



  getWarrantyDays(asset: AssetsReadModel): number | null {
    if (!asset.warrantyEnd) return null;
    
    const warrantyDate = new Date(asset.warrantyEnd);
    const today = new Date();
    const diffTime = warrantyDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : null;
  }
    // Warranty status helpers

  // --- Status helpers (clean version) ---
  private warrantyStatusTextMap: { [key: string]: string } = {
    '0': 'Activă',
    '1': 'Expira degraba',
    '2': 'Expirata',
    'null': 'Lipsa',
    'undefined': 'Necunoscut',
  };
  private warrantyStatusClassMap: { [key: string]: string } = {
    '0': 'active',
    '1': 'expiredsoon', // Expiră degrabă - orange
    '2': 'expired',     // Expirată - roșu
    'null': 'unknown',
    'undefined': 'unknown',
  };
  getWarrantyStatusText(status: number | null | undefined): string {
    const key = String(status);
    return this.warrantyStatusTextMap.hasOwnProperty(key)
      ? this.warrantyStatusTextMap[key]
      : 'Necunoscut';
  }
  getWarrantyStatusClass(status: number | null | undefined): string {
    const key = String(status);
    return this.warrantyStatusClassMap.hasOwnProperty(key)
      ? this.warrantyStatusClassMap[key]
      : 'unknown';
  }

  private insuranceStatusTextMap: { [key: string]: string } = {
    '0': 'Neîncepută',
    '1': 'Activă',
    '2': 'Expiră degrabă',
    '3': 'Expirata',
    'null': 'Lipsa',
    'undefined': 'Necunoscut',
  };
  private insuranceStatusClassMap: { [key: string]: string } = {
    '0': 'notstarted',
    '1': 'active',
    '2': 'expiredsoon',
    '3': 'expired',
    'null': 'unknown',
    'undefined': 'unknown',
  };
  getInsuranceStatusText(status: number | null | undefined): string {
    const key = String(status);
    return this.insuranceStatusTextMap.hasOwnProperty(key)
      ? this.insuranceStatusTextMap[key]
      : 'Necunoscut';
  }
  getInsuranceStatusClass(status: number | null | undefined): string {
    const key = String(status);
    return this.insuranceStatusClassMap.hasOwnProperty(key)
      ? this.insuranceStatusClassMap[key]
      : 'unknown';
  } 

}
