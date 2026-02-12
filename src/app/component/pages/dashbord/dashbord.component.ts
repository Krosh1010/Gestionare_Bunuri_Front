import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationsService } from '../../../services/ApiServices/notifications.service';
import { DashboardService } from '../../../services/ApiServices/dashboard.service';
import { SpaceService } from '../../../services/ApiServices/space.service';
import { LocationNode } from '../../../models/dashboard/location.model';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss',
  providers: [NotificationsService]
})
export class DashbordComponent implements OnInit {
  currentDate: Date = new Date();
  notifications: Array<{ id: string; type: number; message: string }> = [];

  totalCount: number = 0;
  electronicsCount: number = 0;
  furnitureCount: number = 0;
  vehiclesCount: number = 0;
  documentsCount: number = 0;
  otherCount: number = 0;
  totalAssets: number = 0;
  categoryDistribution: Array<{ name: string; count: number }> = [];

  // Warranty/Insurance status
  totalWarranty: number = 0;
  expiredWarranty: number = 0;
  expiringSoonWarranty: number = 0;
  activeWarranty: number = 0;
  totalInsurance: number = 0;
  expiredInsurance: number = 0;
  expiringSoonInsurance: number = 0;
  activeInsurance: number = 0;

  // Locations tree
  locationTree: LocationNode[] = [];
  locationsLoading: boolean = false;
  totalLocations: number = 0;

  types = [
    { label: 'HOME', value: 0 },
    { label: 'OFFICE', value: 1 },
    { label: 'ROOM', value: 2 },
    { label: 'STORAGE', value: 3 }
  ];

  constructor(
    private notificationsService: NotificationsService,
    private dashboardService: DashboardService,
    private spaceService: SpaceService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadDashboardData();
    this.loadLocationsTree();
  }
  loadDashboardData(): void {
    this.dashboardService.getDashboardData().then(
      (data) => {
        // presupunem ca data = { totalCount, electronicsCount, furnitureCount, vehiclesCount, documentsCount, otherCount, totalWarrantyInsurance, expiredWarrantyInsurance, expiringSoonWarrantyInsurance, activeWarrantyInsurance }
        this.totalCount = data?.totalCount || 0;
        this.electronicsCount = data?.electronicsCount || 0;
        this.furnitureCount = data?.furnitureCount || 0;
        this.vehiclesCount = data?.vehiclesCount || 0;
        this.documentsCount = data?.documentsCount || 0;
        this.otherCount = data?.otherCount || 0;

        this.totalWarranty = data?.totalWarranty || 0;
        this.expiredWarranty = data?.expiredWarranty || 0;
        this.expiringSoonWarranty = data?.expiringSoonWarranty || 0;
        this.activeWarranty = data?.activeWarranty || 0;

        this.totalInsurance = data?.totalInsurance || 0;
        this.expiredInsurance = data?.expiredInsurance || 0;
        this.expiringSoonInsurance = data?.expiringSoonInsurance || 0;
        this.activeInsurance = data?.activeInsurance || 0;

        console.log('Dashboard data:', data);
      },
      (error) => {
        console.error('Eroare la preluarea datelor dashboard:', error);
      }
    );
  }

  loadNotifications(): void {
    this.notificationsService.getNotifications().then(
      (data) => {
        // presupunem că data este un array de notificări cu {id, type, message}
        this.notifications = Array.isArray(data) ? data : [];
        console.log('Notificari primite din backend:', data);
      },
      (error) => {
        console.error('Eroare la preluarea notificarilor:', error);
      }
    );
  }

  markAsRead(notificationId: string): void {
    this.notificationsService.deleteNotification(notificationId).then(
      () => {
        // elimină notificarea din listă după ștergere
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      },
      (error) => {
        console.error('Eroare la ștergerea notificării:', error);
      }
    );
  }

  // --- Locations tree methods ---
  async loadLocationsTree(): Promise<void> {
    this.locationsLoading = true;
    try {
      const roots = await this.spaceService.getSpacesParents();
      this.locationTree = (roots || []).map((loc: any) => ({
        ...loc,
        expanded: false,
        childrenLoaded: false,
        loadingChildren: false,
        children: []
      }));
      this.totalLocations = this.locationTree.length;
    } catch (error) {
      console.error('Eroare la încărcarea locațiilor:', error);
      this.locationTree = [];
    } finally {
      this.locationsLoading = false;
    }
  }

  async toggleExpand(node: LocationNode): Promise<void> {
    if (node.expanded) {
      node.expanded = false;
      return;
    }
    node.expanded = true;
    if (!node.childrenLoaded) {
      node.loadingChildren = true;
      try {
        const children = await this.spaceService.getSpaceByIdParents(node.id.toString());
        node.children = (children || []).map((child: any) => ({
          ...child,
          expanded: false,
          childrenLoaded: false,
          loadingChildren: false,
          children: []
        }));
        node.childrenLoaded = true;
        this.totalLocations += node.children!.length;
      } catch (error) {
        console.error('Eroare la încărcarea sub-locațiilor:', error);
        node.children = [];
      } finally {
        node.loadingChildren = false;
      }
    }
  }

  getTypeLabel(typeValue: number): string {
    const type = this.types.find(t => t.value === typeValue);
    return type ? type.label : 'N/A';
  }

  getTypeEmoji(type: number): string {
    switch (type) {
      case 0: return '🏠';
      case 1: return '🏢';
      case 2: return '🚪';
      case 3: return '📦';
      default: return '📍';
    }
  }

  getTypeClass(type: number): string {
    switch (type) {
      case 0: return 'home';
      case 1: return 'office';
      case 2: return 'room';
      case 3: return 'storage';
      default: return 'home';
    }
  }

  getPieChartGradient(): string {
    const total = this.totalCount || 1; // evită împărțirea la 0
    
    // Calculează procentajele pentru fiecare categorie
    const electronicsPercent = (this.electronicsCount / total) * 100;
    const furniturePercent = (this.furnitureCount / total) * 100;
    const vehiclesPercent = (this.vehiclesCount / total) * 100;
    const documentsPercent = (this.documentsCount / total) * 100;
    const otherPercent = (this.otherCount / total) * 100;

    // Calculează pozițiile cumulative pentru conic-gradient
    const pos1 = electronicsPercent;
    const pos2 = pos1 + furniturePercent;
    const pos3 = pos2 + vehiclesPercent;
    const pos4 = pos3 + documentsPercent;
    const pos5 = pos4 + otherPercent;

    return `conic-gradient(
      #667eea 0% ${pos1}%,
      #764ba2 ${pos1}% ${pos2}%,
      #10b981 ${pos2}% ${pos3}%,
      #f59e0b ${pos3}% ${pos4}%,
      #ef4444 ${pos4}% ${pos5}%
    )`;
  }
}
