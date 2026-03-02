export interface WarrantyItem {
  id?: number;
  name: string;
  category: string;
  value?: number;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  insuranceEndDate?: Date;
  status: 'expired' | 'expiring-soon' | 'active' | 'no-coverage';
  daysRemaining: number;
  provider?: string;
  company?: string;
  documentFileName?: string;
  documentId?: number;
}

export interface WarrantyReadDto {
  id?: number;
  assetId: number;
  provider: string;
  startDate: string;
  endDate: string;
  status?: number;
  documentFileName?: string;
  documentId?: number;
}

export interface InsuranceReadDto {
  id?: number;
  assetId: number;
  company: string;
  insuredValue: number;
  startDate: string;
  endDate: string;
  status?: number;
  documentFileName?: string;
  documentId?: number;
}