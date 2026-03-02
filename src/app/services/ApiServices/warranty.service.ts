import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
    providedIn: 'root',
})

export class warrantyService {
    constructor(private apiService: ApiService) {}
    
    async createWarranty(warrantyData: any, document?: File): Promise<any> {
        const formData = new FormData();
        formData.append('AssetId', String(warrantyData.assetId));
        formData.append('Provider', warrantyData.provider);
        formData.append('StartDate', warrantyData.startDate);
        formData.append('EndDate', warrantyData.endDate);
        if (document) {
            formData.append('document', document);
        }
        return this.apiService.postFormData('api/Warranty/create', formData);
    }
    async getWarrantyByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/Warranty/by-asset/${assetId}`);
    }
    async deleteWarranty(assetId: string): Promise<any> {
        return this.apiService.deleteData(`api/Warranty/by-asset/${assetId}`);
    }
    async updateWarranty(assetId: string, warrantyData: any, document?: File): Promise<any> {
        const formData = new FormData();
        if (warrantyData.provider) formData.append('Provider', warrantyData.provider);
        if (warrantyData.startDate) formData.append('StartDate', warrantyData.startDate);
        if (warrantyData.endDate) formData.append('EndDate', warrantyData.endDate);
        if (document) {
            formData.append('document', document);
        }
        return this.apiService.patchFormData(`api/Warranty/by-asset/${assetId}`, formData);
    }
    async getExpiringWarranties(): Promise<any> {
        return this.apiService.getData('api/Warranty/warranty-summary');
    }
    async downloadWarrantyDocument(assetId: string): Promise<Blob> {
        return this.apiService.getFile(`api/Warranty/by-asset/${assetId}/document/download`);
    }
    async deleteWarrantyDocument(assetId: string): Promise<any> {
        return this.apiService.deleteSimple(`api/Warranty/by-asset/${assetId}/document`);
    }
}