import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
    providedIn: 'root',
})

export class warrantyService {
    constructor(private apiService: ApiService) {}
    
    async createWarranty(warrantyData: any): Promise<any> {
        return this.apiService.postData('api/Warranty/create', warrantyData);
    }
    async getWarrantyByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/Warranty/by-asset/${assetId}`);
    }
    async deleteWarranty(assetId: string): Promise<any> {
        return this.apiService.deleteData(`api/Warranty/by-asset/${assetId}`);
    }
    async updateWarranty(assetId: string, warrantyData: any): Promise<any> {
        return this.apiService.patchData(`api/Warranty/by-asset/${assetId}`, warrantyData);
    }
}