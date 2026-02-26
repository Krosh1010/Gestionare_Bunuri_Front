export interface AssetsReadModel {
    id: number;
    name: string;
    spaceId: number;
    value: number;
    spaceName: string;
    purchaseDate: string;
    description: string;
    category: string;
    status?: 'active' | 'inactive' | 'maintenance' | 'sold';
    warrantyEnd?: string;
    additionalInfo?: string;
    warrantyEndDate?: string;
    insuranceEndDate?: string;
    warrantyStatus?: 0 | 1 | null | undefined;
    insuranceStatus?: 0 | 1 | 2 | null | undefined;
    customTrackerName?: string | null;
    customTrackerEndDate?: string | null;
}