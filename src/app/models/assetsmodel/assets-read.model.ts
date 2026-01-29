export interface AssetsReadModel {
    id: number;
    name: string;
    value: number;
    location: string;
    purchaseDate: string;
    description: string;
    category: string;
    status?: 'active' | 'inactive' | 'maintenance' | 'sold';
    warrantyEnd?: string;
    additionalInfo?: string;
}