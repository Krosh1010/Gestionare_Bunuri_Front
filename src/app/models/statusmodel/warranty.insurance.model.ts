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
}