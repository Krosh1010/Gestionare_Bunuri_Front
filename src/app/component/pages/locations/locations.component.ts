import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SpaceService } from '../../../services/ApiServices/space.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
      // Close dropdown menu when clicking outside
      closeMenuOnOutsideClick(event: MouseEvent) {
        // Only close if menu is open and click is not on a menu button
        const target = event.target as HTMLElement;
        if (this.activeMenu !== null) {
          // If click is NOT inside a .dropdown-menu or .icon-btn, close
          if (!target.closest('.dropdown-menu') && !target.closest('.icon-btn')) {
            this.activeMenu = null;
          }
        }
      }
    // For dropdown menu state
    activeMenu: number | null = null;

    // Toggle dropdown menu for location actions
    toggleMenu(locationId: number): void {
      if (this.activeMenu === locationId) {
        this.activeMenu = null;
      } else {
        this.activeMenu = locationId;
      }
    }
  locationForm: FormGroup;
  types = [
    { label: 'HOME', value: 0 },
    { label: 'OFFICE', value: 1 },
    { label: 'ROOM', value: 2 },
    { label: 'STORAGE', value: 3 }
  ];
  
  locations: any[] = [];
  filteredLocations: any[] = [];
  currentLocations: any[] = [];
  parentLevels: any[][] = [];
  selectedParentIds: (number | null)[] = [];
  selectedLocationId: number | null = null;
  navigationStack: any[][] = [];
  isLoading = false;
  loadError = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  showForm = false;
  searchTerm = '';
  selectedType: number | '' = '';
  childSpaces: { [key: number]: any[] } = {};
  loadingChildSpaces: { [key: number]: boolean } = {};
  editingLocation: any = null;

  constructor(private fb: FormBuilder, private spaceService: SpaceService) {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      parentSpaceId: [''],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadLocations();
  }
    async onDeleteLocation(location: any) {
    if (confirm(`Ești sigur că vrei să ștergi locația "${location.name}"?`)) {
      this.isLoading = true;
      try {
        await this.spaceService.deleteSpace(location.id.toString());
        this.message = 'Locația a fost ștearsă cu succes!';
        this.messageType = 'success';
        await this.loadLocations();
      } catch (err: any) {
        console.error('Error deleting location:', err);
        this.message = err?.error?.message || 'Eroare la ștergerea locației!';
        this.messageType = 'error';
      } finally {
        this.isLoading = false;
      }
    }
  }

  async loadLocations() {
    try {
      this.isLoading = true;
      this.loadError = false;
        this.locations = await this.spaceService.getSpacesParents();
        this.filteredLocations = [...this.locations];
        this.currentLocations = [...this.locations];
        this.selectedLocationId = null;
        this.navigationStack = [];
    } catch (error) {
      console.error('Error loading locations:', error);
      this.loadError = true;
      this.locations = [];
      this.filteredLocations = [];
    } finally {
      this.isLoading = false;
    }
  }

  getTypeLabel(typeValue: number): string {
    const type = this.types.find(t => t.value === typeValue);
    return type ? type.label : 'Unknown';
  }

  async showCreateForm() {
    this.showForm = true;
    this.message = '';
    // Reset form with default placeholders
    this.locationForm.reset({
      name: '',
      type: '',
      parentSpaceId: null,
      description: ''
    });
    try {
      const parents = await this.spaceService.getSpacesParents();
      this.parentLevels = [parents];
      // Setează explicit 'Nicio locație părinte' ca selectat
      this.selectedParentIds = [null];
    } catch (error) {
      console.error('Error loading parent spaces for dropdown:', error);
      this.parentLevels = [[]];
      this.selectedParentIds = [null];
    }
  }

  async onParentSelected(level: number, parentId: number) {
    // Dacă se selectează 'Nicio locație părinte', setează null
    if (parentId === null) {
      this.selectedParentIds = this.selectedParentIds.slice(0, level);
      this.selectedParentIds[level] = null;
      this.parentLevels = this.parentLevels.slice(0, level + 1);
      this.locationForm.patchValue({ parentSpaceId: null });
      return;
    }
    // Convert parentId to number if needed
    const parentIdNum = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
    this.selectedParentIds = this.selectedParentIds.slice(0, level);
    this.selectedParentIds[level] = parentIdNum;
    // Încarcă copiii pentru id-ul selectat
    try {
      const children = await this.spaceService.getSpaceByIdParents(parentIdNum.toString());
      if (children && children.length > 0) {
        this.parentLevels = this.parentLevels.slice(0, level + 1);
        this.parentLevels[level + 1] = children;
      } else {
        // Dacă nu are copii, oprește la acest nivel
        this.parentLevels = this.parentLevels.slice(0, level + 1);
      }
    } catch (error) {
      console.error('Error loading child spaces for dropdown:', error);
      this.parentLevels = this.parentLevels.slice(0, level + 1);
    }
    // Setează valoarea în formă
    this.locationForm.patchValue({ parentSpaceId: parentId });
  }

  hideCreateForm() {
    this.showForm = false;
    this.locationForm.reset();
    this.editingLocation = null;
    this.message = '';
  }

  async createLocation() {
    if (this.locationForm.invalid) return;
    this.isLoading = true;
    this.message = '';
    const formValue = { ...this.locationForm.value };
    // Determină parentSpaceId pe baza selectedParentIds (ultimul id valid)
    let parentSpaceId = null;
    if (this.selectedParentIds && this.selectedParentIds.length > 0) {
      // Găsește ultimul id valid (number)
      for (let i = this.selectedParentIds.length - 1; i >= 0; i--) {
        if (typeof this.selectedParentIds[i] === 'number' && this.selectedParentIds[i] !== null) {
          parentSpaceId = this.selectedParentIds[i];
          break;
        }
      }
    }
    // Dacă nu există niciun id valid, forțează null
    if (typeof parentSpaceId !== 'number') {
      parentSpaceId = null;
    }
    if (this.editingLocation) {
      // Editare: trimite doar câmpurile modificate
      const patch: any = {};
      if (formValue.name !== this.editingLocation.name) patch.name = formValue.name;
      if (Number(formValue.type) !== Number(this.editingLocation.type)) patch.type = Number(formValue.type);
      if ((parentSpaceId || null) !== (this.editingLocation.parentSpaceId || null)) {
        patch.parentSpaceId = parentSpaceId;
        patch.parentSpaceIdIsSet = true;
      }
      if ((formValue.description || '') !== (this.editingLocation.description || '')) patch.description = formValue.description || '';
      if (Object.keys(patch).length === 0) {
        this.message = 'Nu ai modificat nimic.';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }
      try {
        await this.spaceService.updateSpace(this.editingLocation.id.toString(), patch);
        this.message = 'Locația a fost editată cu succes!';
        this.messageType = 'success';
        this.locationForm.reset();
        this.editingLocation = null;
        setTimeout(() => {
          this.showForm = false;
          this.loadLocations();
        }, 1500);
      } catch (err: any) {
        console.error('Error editing location:', err);
        this.message = err?.error?.message || 'Eroare la editarea locației!';
        this.messageType = 'error';
      } finally {
        this.isLoading = false;
      }
    } else {
      // Creare nouă
      const dto: any = {
        name: formValue.name,
        type: Number(formValue.type),
        parentSpaceId: parentSpaceId,
      };
      // Trimite și parentSpaceIdIsSet la creare dacă există parentSpaceId explicit
      if ('parentSpaceId' in dto) {
        dto.parentSpaceIdIsSet = true;
      }
      try {
        await this.spaceService.createSpace(dto);
        this.message = 'Locația a fost creată cu succes!';
        this.messageType = 'success';
        this.locationForm.reset();
        setTimeout(() => {
          this.showForm = false;
          this.loadLocations();
        }, 1500);
      } catch (err: any) {
        console.error('Error creating location:', err);
        this.message = err?.error?.message || 'Eroare la crearea locației!';
        this.messageType = 'error';
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Search and filter functions
  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.currentLocations;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(location =>
        location.name?.toLowerCase().includes(term) ||
        location.description?.toLowerCase().includes(term) ||
        this.getTypeLabel(location.type).toLowerCase().includes(term)
      );
    }
    if (this.selectedType !== '') {
      filtered = filtered.filter(location => Number(location.type) === Number(this.selectedType));
    }
    this.filteredLocations = filtered;
  }

  // Helper functions for UI
  getLocationTypeClass(type: number): string {
    switch(type) {
      case 0: return 'home';
      case 1: return 'office';
      case 2: return 'room';
      case 3: return 'storage';
      default: return 'home';
    }
  }

  getLocationIcon(type: number): string {
    switch(type) {
      case 0: return 'home';
      case 1: return 'business';
      case 2: return 'meeting_room';
      case 3: return 'warehouse';
      default: return 'location_on';
    }
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  editLocation(location: any) {
    this.showForm = true;
    // Ia datele complete cu GET by id
    this.spaceService.getSpaceById(location.id.toString()).then(async (loc) => {
      this.editingLocation = loc;
      this.locationForm.patchValue({
        name: loc.name,
        type: loc.type,
        parentSpaceId: loc.parentSpaceId || '',
        description: loc.description || ''
      });
      // Populează dropdown-urile pe niveluri cu părinții existenți
      await this.populateParentDropdowns(loc.parentSpaceId);
      // Forțează selectarea corectă a părintelui în dropdown
      if (loc.parentSpaceId) {
        this.locationForm.patchValue({ parentSpaceId: loc.parentSpaceId });
      }
    });
  }

async populateParentDropdowns(spaceId: number | null) {
  this.parentLevels = [];
  this.selectedParentIds = [];

  if (!spaceId) {
    let roots = await this.spaceService.getSpacesParents();
    roots = roots.map((r: { id: number; name?: string; label?: string; type?: number }) => ({ ...r, name: r.name || r.label || 'Fără nume' }));
    this.parentLevels = [roots];
    // Selectează explicit "Nicio locație părinte" la editare fără părinte
    this.selectedParentIds = [null];
    return;
  }

  // Obține lanțul complet de părinți (de la root la părinte direct)
  const parentChain = await this.spaceService.getParentChain(spaceId.toString());
  // parentChain[0] = root, [n-1] = părinte direct

  // Nivel 0 (roots)
  let roots = await this.spaceService.getSpacesParents();
  roots = roots.map((r: { id: number; name?: string; label?: string; type?: number }) => ({ ...r, name: r.name || r.label || 'Fără nume' }));
  // Asigură că primul din parentChain există în roots
  const firstParent = parentChain[0];
  if (!roots.find((r: { id: number }) => r.id === firstParent.id)) {
    roots = [...roots, { ...firstParent, name: firstParent.name || firstParent.label || 'Fără nume' }];
  }
  this.parentLevels = [roots];
  this.selectedParentIds[0] = firstParent.id;

  // Pentru fiecare nivel, adaugă copiii și marchează selectat părintele de la nivelul următor
  for (let i = 0; i < parentChain.length - 1; i++) {
    const parent = parentChain[i];
    const nextParent = parentChain[i + 1];
    let children = await this.spaceService.getSpaceByIdParents(parent.id.toString());
    children = children.map((r: { id: number; name?: string; label?: string; type?: number }) => ({ ...r, name: r.name || r.label || 'Fără nume' }));
    // Asigură că părintele următor există în children
    if (!children.find((r: { id: number }) => r.id === nextParent.id)) {
      children = [...children, { ...nextParent, name: nextParent.name || nextParent.label || 'Fără nume' }];
    }
    this.parentLevels.push(children);
    this.selectedParentIds[i + 1] = nextParent.id;
  }

  // Adaugă încă un dropdown gol la nivelul copilului, dacă nu există deja
  const lastParentId = parentChain[parentChain.length - 1]?.id;
  if (lastParentId) {
    let children = await this.spaceService.getSpaceByIdParents(lastParentId.toString());
    children = children.map((r: { id: number; name?: string; label?: string; type?: number }) => ({ ...r, name: r.name || r.label || 'Fără nume' }));
    // Dacă nu există deja un dropdown pentru acest nivel sau nu există copii, adaugă dropdown gol
    if (!children.length) {
      this.parentLevels.push([]);
      this.selectedParentIds[parentChain.length] = null;
    } else {
      this.parentLevels.push(children);
      this.selectedParentIds[parentChain.length] = null;
    }
  }
}

  async deleteLocation(location: any) {
    if (confirm(`Ești sigur că vrei să ștergi locația "${location.name}"?`)) {
      try {
        
        await this.loadLocations();
        this.message = 'Locația a fost ștearsă cu succes!';
        this.messageType = 'success';
      } catch (err: any) {
        console.error('Error deleting location:', err);
        this.message = err?.error?.message || 'Eroare la ștergerea locației!';
        this.messageType = 'error';
      }
    }
  }

  viewLocationDetails(location: any) {
    // Navighează la pagina de detalii sau afișează modal
    console.log('View location details:', location);
    // Aici poți implementa navigarea către pagina de detalii
  }

  async loadChildSpaces(locationId: number) {
    this.isLoading = true;
    this.selectedLocationId = locationId;
    this.navigationStack.push(this.currentLocations);
    try {
      const children = await this.spaceService.getSpaceByIdParents(locationId.toString());
      this.currentLocations = children;
      this.filteredLocations = children;
    } catch (error) {
      console.error('Error loading child spaces:', error);
      this.currentLocations = [];
      this.filteredLocations = [];
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    if (this.navigationStack.length > 0) {
      const previous = this.navigationStack.pop() || [];
      this.currentLocations = previous;
      this.filteredLocations = previous;
      this.selectedLocationId = this.navigationStack.length > 0 ? null : null;
    } else {
      this.loadLocations();
      this.filteredLocations = this.currentLocations;
    }
  }
}