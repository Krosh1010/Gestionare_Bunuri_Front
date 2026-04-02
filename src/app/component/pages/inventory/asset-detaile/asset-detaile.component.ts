import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsReadModel } from '../../../../models/assetsmodel/assets-read.model';
import { AssetsService } from '../../../../services/ApiServices/assets.service';
import { warrantyService } from '../../../../services/ApiServices/warranty.service';
import { InsuranceService } from '../../../../services/ApiServices/insurance.service';
import { LoanService } from '../../../../services/ApiServices/loan.service';

@Component({
  selector: 'app-asset-detaile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-detaile.component.html',
  styleUrl: './asset-detaile.component.scss'
})
export class AssetDetaileComponent implements OnChanges {
  @Input() assetId: number | string | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<AssetsReadModel>();
  @Output() delete = new EventEmitter<AssetsReadModel>();

  asset: AssetsReadModel | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  loanHistory: any[] = [];
  isLoadingHistory: boolean = false;
  showLoanHistory: boolean = false;

  constructor(
    private assetsService: AssetsService,
    private warrantyService: warrantyService,
    private insuranceService: InsuranceService,
    private loanService: LoanService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assetId'] && this.assetId) {
      this.loadAsset();
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.asset = null;
      this.errorMessage = null;
      this.loanHistory = [];
      this.showLoanHistory = false;
    }
  }

  async loadAsset(): Promise<void> {
    if (!this.assetId) return;
    this.isLoading = true;
    this.errorMessage = null;
    try {
      this.asset = await this.assetsService.getAssetById(this.assetId.toString());
    } catch (err) {
      this.errorMessage = 'Nu s-au putut încărca datele bunului.';
      this.asset = null;
    } finally {
      this.isLoading = false;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.asset) this.edit.emit(this.asset);
  }

  onDelete(): void {
    if (this.asset) this.delete.emit(this.asset);
  }

  async toggleLoanHistory(): Promise<void> {
    this.showLoanHistory = !this.showLoanHistory;
    if (this.showLoanHistory && this.loanHistory.length === 0) {
      this.isLoadingHistory = true;
      try {
        const history = await this.loanService.getAllLoansByAssetId(this.assetId!.toString());
        this.loanHistory = Array.isArray(history) ? history : [];
      } catch {
        this.loanHistory = [];
      } finally {
        this.isLoadingHistory = false;
      }
    }
  }

  async deleteLoanFromHistory(loanId: string): Promise<void> {
    try {
      await this.loanService.deleteLoan(loanId);
      this.loanHistory = this.loanHistory.filter(l => l.id !== loanId);
    } catch {
      // silent
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('detail-overlay')) {
      this.onClose();
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      electronics: '💻',
      furniture: '🪑',
      vehicles: '🚗',
      documents: '📄'
    };
    return icons[category] || '📦';
  }

  getCategoryText(category: string): string {
    const texts: { [key: string]: string } = {
      electronics: 'Electronică',
      furniture: 'Mobilier',
      vehicles: 'Vehicule',
      documents: 'Documente'
    };
    return texts[category] || 'Altele';
  }

  getWarrantyStatusText(status: number | null | undefined): string {
    const map: { [key: string]: string } = {
      '1': 'Activă', '2': 'Expiră curând', '3': 'Expirată',
      'null': 'Nesetată', 'undefined': 'Nesetată'
    };
    return map[String(status)] || 'Necunoscut';
  }

  getWarrantyStatusClass(status: number | null | undefined): string {
    const map: { [key: string]: string } = {
      '1': 'active', '2': 'expiring-soon', '3': 'expired',
      'null': 'none', 'undefined': 'none'
    };
    return map[String(status)] || 'none';
  }

  getInsuranceStatusText(status: number | null | undefined): string {
    const map: { [key: string]: string } = {
      '0': 'Neîncepută', '1': 'Activă', '2': 'Expiră curând', '3': 'Expirată',
      'null': 'Nesetată', 'undefined': 'Nesetată'
    };
    return map[String(status)] || 'Necunoscut';
  }

  getInsuranceStatusClass(status: number | null | undefined): string {
    const map: { [key: string]: string } = {
      '0': 'not-started', '1': 'active', '2': 'expiring-soon', '3': 'expired',
      'null': 'none', 'undefined': 'none'
    };
    return map[String(status)] || 'none';
  }

  getCustomTrackerStatusText(status: number | null | undefined): string {
    const map: { [key: string]: string } = {
      '0': 'Neînceput', '1': 'Activ', '2': 'Expiră curând', '3': 'Expirat',
      'null': 'Lipsă', 'undefined': 'Lipsă'
    };
    return map[String(status)] || 'Necunoscut';
  }

  getCustomTrackerStatusClass(status: number | null | undefined): string {
    const map: { [key: string]: string } = {
      '0': 'not-started', '1': 'active', '2': 'expiring-soon', '3': 'expired',
      'null': 'none', 'undefined': 'none'
    };
    return map[String(status)] || 'none';
  }

  getDaysUntil(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  async downloadWarrantyDocument(): Promise<void> {
    if (!this.assetId) return;
    try {
      const blob = await this.warrantyService.downloadWarrantyDocument(this.assetId.toString());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.asset?.warrantyDocumentFileName || 'document-garantie';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Eroare la descărcarea documentului garanție:', err);
    }
  }

  async downloadInsuranceDocument(): Promise<void> {
    if (!this.assetId) return;
    try {
      const blob = await this.insuranceService.downloadInsuranceDocument(this.assetId.toString());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.asset?.insuranceDocumentFileName || 'document-asigurare';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Eroare la descărcarea documentului asigurare:', err);
    }
  }
}
