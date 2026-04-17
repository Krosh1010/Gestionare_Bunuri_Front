import { AssetFilterService } from '../../../services/asset-filter.service';
import { AssetsReadModel } from '../../../models/assetsmodel/assets-read.model';
import { AssetsService } from '../../../services/ApiServices/assets.service';
import { SpaceService } from '../../../services/ApiServices/space.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WarrantyInsuranceFormComponent } from '../inventory/warranty-insurance-form/warranty-insurance-form.component';
import { WarrantyInsuranceSetingsComponent } from '../inventory/warranty-insurance-setings/warranty-insurance-setings.component';
import { AssetDetaileComponent } from '../inventory/asset-detaile/asset-detaile.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule,NgFor,CommonModule,ReactiveFormsModule, WarrantyInsuranceFormComponent, WarrantyInsuranceSetingsComponent, AssetDetaileComponent],
  // BrowserAnimationsModule is provided globally via provideAnimations() in app.config.ts
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  animations: [
    trigger('staggerCards', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger(60, [
            animate('280ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})

export class InventoryComponent implements OnInit {
  todayString: string = '';

  assets: AssetsReadModel[] = [];
    // Pentru a păstra filtrele active între pagini
  activeFiltersParams: any = null;

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

  totalValue: number = 0;
  expiringSoon: number = 0;

  parentLevels: any[][] = [];
  selectedParentIds: (number | null)[] = [];
selectedSpaceName: string | null = null;
  selectedSpaceId: number | null = null;
  isLoadingSpaces = false;
  isLeafSpaceSelected = false;

  // Tree picker + space search
  treeNodes: any[] = [];
  treePickerVisible = false;
  selectedTreeNode: any = null;
  treeLoading = false;

  spaceSearchQuery: string = '';
  spaceSearchResults: any[] = [];
  isSearchingSpaces = false;
  showSpaceSearchResults = false;
  private spaceSearchTimeout: any = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  isLoadingAssets: boolean = false;

  // Modal pentru warranty/insurance
  showWarrantyModal: boolean = false;
  createdAssetId: number | null = null;

  // Asset detail panel
  showAssetDetail: boolean = false;
  selectedAssetId: number | string | null = null;

  // Barcode search
  barcodeSearch: string = '';
  isBarcodeSearching: boolean = false;
  barcodeSearchError: string = '';

  constructor(
    private fb: FormBuilder,
    private assetsService: AssetsService,
    private spaceService: SpaceService,
    public assetFilterService: AssetFilterService
  ) {
    this.assetForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      location: [''],
      purchaseDate: [''],
      warrantyEnd: [''],
      spaceId: [null, Validators.required],
      barcode: ['']
    });
    this.filters = this.assetFilterService.getDefaultFilter();
  }

  ngOnInit(): void {
    this.todayString = this.formatDate(new Date());
    this.loadAssets();
  }

  async loadAssets(page: number = 1, filters?: any): Promise<void> {
    this.isLoadingAssets = true;
    this.currentPage = page;
    // Folosește filtrele active dacă nu se dau explicit
    const params = filters !== undefined ? filters : this.activeFiltersParams;
    try {
      const data = await this.assetsService.getAssets(
        this.currentPage,
        this.pageSize,
        params
      );
      if (data && data.items) {
        this.assets = data.items;
        this.totalItems = data.totalCount ?? data.items.length;
        if (typeof data.totalValue === 'number') {
          this.totalValue = data.totalValue;
        }
      } else if (Array.isArray(data)) {
        this.assets = data;
        this.totalItems = data.length;
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

  trackByLevel(index: number, _level: any[]) {
    return index;
  }
  // Filter and search
  async filterAssets(): Promise<void> {
    const backendFilters = this.assetFilterService.buildBackendFilter(this.filters, this.searchQuery);
    this.activeFiltersParams = backendFilters;
    await this.loadAssets(1, backendFilters);
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    if (this.showFilter) {
      this.loadFilterSpaces();
    }
  }

  async applyFilters(): Promise<void> {
    this.activeFilters = this.countActiveFilters();
    await this.filterAssets();
    this.showFilter = false;
  }

  async clearFilters(): Promise<void> {
    this.filters = this.assetFilterService.resetFilter();
    this.filterSelectedSpaceName = null;
    this.filterParentLevels = [];
    this.filterSelectedParentIds = [];
    this.activeFilters = 0;
    this.activeFiltersParams = null;
    this.barcodeSearch = '';
    this.barcodeSearchError = '';
    await this.loadAssets(1);
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
    spaceId: null,
    barcode: ''
  });

  this.parentLevels = [];
  this.selectedParentIds = [];
  this.isLeafSpaceSelected = false;
  this.selectedTreeNode = null;
  this.treeNodes = [];
  this.treePickerVisible = false;
  this.spaceSearchQuery = '';
  this.spaceSearchResults = [];
  this.showSpaceSearchResults = false;

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

  // --- Tree picker methods ---
  async openTreePicker(): Promise<void> {
    this.treePickerVisible = true;
    this.showSpaceSearchResults = false;
    if (this.treeNodes.length === 0) {
      this.treeLoading = true;
      try {
        const roots = await this.spaceService.getSpacesParents();
        this.treeNodes = roots.map((r: any) => ({
          ...r,
          expanded: false,
          childrenLoaded: false,
          children: [],
          loadingChildren: false
        }));
      } finally {
        this.treeLoading = false;
      }
    }
    if (this.selectedTreeNode) {
      await this.expandTreeToNode(this.selectedTreeNode.id);
    }
  }

  private async expandTreeToNode(spaceId: number): Promise<void> {
    try {
      const chain = await this.spaceService.getParentChain(spaceId.toString());
      if (!chain || chain.length === 0) return;
      let currentLevel = this.treeNodes;
      for (const chainNode of chain) {
        const treeNode = currentLevel.find((n: any) => n.id === chainNode.id);
        if (!treeNode) break;
        if (!treeNode.childrenLoaded) {
          treeNode.loadingChildren = true;
          try {
            const children = await this.spaceService.getSpaceByIdParents(treeNode.id.toString());
            treeNode.children = children.map((c: any) => ({
              ...c, expanded: false, childrenLoaded: false, children: [], loadingChildren: false
            }));
            treeNode.childrenLoaded = true;
          } finally {
            treeNode.loadingChildren = false;
          }
        }
        if (treeNode.children.length > 0) {
          treeNode.expanded = true;
        }
        currentLevel = treeNode.children;
      }
    } catch { /* silently fail */ }
  }

  closeTreePicker(): void {
    this.treePickerVisible = false;
  }

  async toggleTreeNode(node: any): Promise<void> {
    if (node.expanded) {
      node.expanded = false;
      return;
    }
    if (!node.childrenLoaded) {
      node.loadingChildren = true;
      try {
        const children = await this.spaceService.getSpaceByIdParents(node.id.toString());
        node.children = children.map((c: any) => ({
          ...c, expanded: false, childrenLoaded: false, children: [], loadingChildren: false
        }));
        node.childrenLoaded = true;
      } finally {
        node.loadingChildren = false;
      }
    }
    if (node.children.length > 0) {
      node.expanded = true;
    }
  }

  selectTreeNode(node: any): void {
    this.selectedTreeNode = node;
    this.assetForm.patchValue({ spaceId: node.id });
    this.isLeafSpaceSelected = true;
    this.treePickerVisible = false;
  }

  clearTreeSelection(): void {
    this.selectedTreeNode = null;
    this.assetForm.patchValue({ spaceId: null });
    this.isLeafSpaceSelected = false;
    this.spaceSearchQuery = '';
    this.spaceSearchResults = [];
    this.showSpaceSearchResults = false;
    this.treeNodes = [];
  }

  // --- Space search methods ---
  onSpaceSearchInput(): void {
    const query = this.spaceSearchQuery.trim();
    if (this.spaceSearchTimeout) {
      clearTimeout(this.spaceSearchTimeout);
    }
    if (query.length < 2) {
      this.spaceSearchResults = [];
      this.showSpaceSearchResults = false;
      return;
    }
    this.treePickerVisible = false;
    this.spaceSearchTimeout = setTimeout(() => {
      this.performSpaceSearch(query);
    }, 300);
  }

  async performSpaceSearch(query: string): Promise<void> {
    this.isSearchingSpaces = true;
    this.showSpaceSearchResults = true;
    try {
      const results = await this.spaceService.searchSpaces(query);
      this.spaceSearchResults = Array.isArray(results) ? results : [];
    } catch {
      this.spaceSearchResults = [];
    } finally {
      this.isSearchingSpaces = false;
    }
  }

  selectSpaceFromSearch(space: any): void {
    this.selectedTreeNode = { ...space, expanded: false, childrenLoaded: false, children: [], loadingChildren: false };
    this.assetForm.patchValue({ spaceId: space.id });
    this.isLeafSpaceSelected = true;
    this.spaceSearchQuery = '';
    this.showSpaceSearchResults = false;
    this.treeNodes = [];
  }

  startEditingSpace(): void {
    this.selectedTreeNode = null;
    this.assetForm.patchValue({ spaceId: null });
    this.spaceSearchQuery = '';
    this.treePickerVisible = false;
  }

  onSpaceSearchFocus(): void {
    if (this.spaceSearchQuery.trim().length >= 2) {
      this.showSpaceSearchResults = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.tree-picker-wrapper')) {
      this.showSpaceSearchResults = false;
      this.treePickerVisible = false;
    }
  }

    editAsset(asset: AssetsReadModel) {
      this.editAssetById(asset.id);
    }

  // Editare cu GET la asset și populare spații pe niveluri
  async editAssetById(assetId: string | number): Promise<void> {
    this.isLoadingSpaces = true;
    try {
      
      const asset = await this.assetsService.getAssetById(assetId.toString()) as import('../../../models/assetsmodel/assets-read.model').AssetsReadModel;
      this.editingAsset = asset;

      this.parentLevels = [];
      this.selectedParentIds = [];
      this.isLeafSpaceSelected = false;
      this.selectedTreeNode = null;
      this.treeNodes = [];
      this.treePickerVisible = false;
      this.spaceSearchQuery = '';
      this.spaceSearchResults = [];
      this.showSpaceSearchResults = false;

      if (asset.spaceId) {
        // Construiește selectedTreeNode din parent chain pentru a afișa spațiul selectat
        let parentChain: any[] = [];
        try {
          parentChain = await this.spaceService.getParentChain(asset.spaceId.toString());
        } catch {
          parentChain = [];
        }
        if (parentChain && parentChain.length > 0) {
          const lastSpace = parentChain[parentChain.length - 1];
          this.selectedTreeNode = { ...lastSpace, expanded: false, childrenLoaded: false, children: [], loadingChildren: false };
        } else {
          this.selectedTreeNode = { id: asset.spaceId, name: (asset as any).spaceName || `Spațiu #${asset.spaceId}`, expanded: false, childrenLoaded: false, children: [], loadingChildren: false };
        }
        this.assetForm.patchValue({ spaceId: asset.spaceId });
        this.isLeafSpaceSelected = true;
      }

      this.assetForm.patchValue({
        ...asset,
        purchaseDate: asset.purchaseDate ? this.formatDate(asset.purchaseDate) : '',
        warrantyEnd: asset.warrantyEnd ? this.formatDate(asset.warrantyEnd) : '',
      });
      this.showModal = true;
    } finally {
      this.isLoadingSpaces = false;
    }
  }
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  viewAsset(asset: AssetsReadModel): void {
    this.openAssetDetail(asset.id);
  }

  openAssetDetail(assetId: number | string): void {
    this.selectedAssetId = assetId;
    this.showAssetDetail = true;
  }

  closeAssetDetail(): void {
    this.showAssetDetail = false;
    this.selectedAssetId = null;
  }

  async searchByBarcode(): Promise<void> {
    const barcode = this.barcodeSearch.trim();
    if (!barcode) return;
    this.isBarcodeSearching = true;
    this.barcodeSearchError = '';
    try {
      const asset = await this.assetsService.getAssetByBarcode(barcode);
      if (asset?.id) {
        this.showFilter = false;
        this.openAssetDetail(asset.id);
      } else {
        this.barcodeSearchError = 'Niciun bun găsit cu acest cod de bare.';
      }
    } catch {
      this.barcodeSearchError = 'Niciun bun găsit cu acest cod de bare.';
    } finally {
      this.isBarcodeSearching = false;
    }
  }

  onDetailEdit(asset: AssetsReadModel): void {
    this.closeAssetDetail();
    this.editAsset(asset);
  }

  onDetailDelete(asset: AssetsReadModel): void {
    this.closeAssetDetail();
    this.deleteAsset(asset);
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
        if (formData.purchaseDate !== this.formatDate(this.editingAsset.purchaseDate)) patch.purchaseDate = formData.purchaseDate;
        if (formData.description !== this.editingAsset.description) patch.description = formData.description;
        if (formData.warrantyEnd !== this.formatDate(this.editingAsset.warrantyEnd ?? '')) patch.warrantyEnd = formData.warrantyEnd;
        if ((formData.barcode || null) !== (this.editingAsset.barcode || null)) {
          patch.barcode = formData.barcode || null;
          patch.barcodeIsSet = true;
        }
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
          description: formData.description,
          barcode: formData.barcode || null
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

  private warrantyStatusTextMap: { [key: string]: string } = {
    '1': 'Activă',
    '2': 'Expira degraba',
    '3': 'Expirata',
    'null': 'Lipsa',
    'undefined': 'Necunoscut',
  };
  private warrantyStatusClassMap: { [key: string]: string } = {
    '1': 'active',
    '2': 'expiredsoon',
    '3': 'expired',
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

  private customTrackerStatusTextMap: { [key: string]: string } = {
    '0': 'Neînceput',
    '1': 'Activ',
    '2': 'Expiră degrabă',
    '3': 'Expirat',
    'null': 'Tracker lipsă',
    'undefined': 'Tracker lipsă',
  };
  private customTrackerStatusClassMap: { [key: string]: string } = {
    '0': 'notstarted',
    '1': 'active',
    '2': 'expiredsoon',
    '3': 'expired',
    'null': 'unknown',
    'undefined': 'unknown',
  };
  getCustomTrackerStatusText(status: number | null | undefined): string {
    const key = String(status);
    return this.customTrackerStatusTextMap.hasOwnProperty(key)
      ? this.customTrackerStatusTextMap[key]
      : 'Necunoscut';
  }
  getCustomTrackerStatusClass(status: number | null | undefined): string {
    const key = String(status);
    return this.customTrackerStatusClassMap.hasOwnProperty(key)
      ? this.customTrackerStatusClassMap[key]
      : 'unknown';
  }

}
