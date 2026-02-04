import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
    providedIn: 'root',
})

export class InsuranceService {
    constructor(private apiService: ApiService) {}
    
    async createInsurance(insuranceData: any): Promise<any> {
        return this.apiService.postData('api/Insurance/create', insuranceData);
    }
    async getInsuranceByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/Insurance/by-asset/${assetId}`);
    }
    async deleteInsurance(assetId: string): Promise<any> {
        return this.apiService.deleteData(`api/Insurance/by-asset/${assetId}`);
    }
    async updateInsurance(assetId: string, insuranceData: any): Promise<any> {
        return this.apiService.patchData(`api/Insurance/by-asset/${assetId}`, insuranceData);
    }
    async getExpiringInsurances(): Promise<any> {
        return this.apiService.getData('api/Insurance/insurance-summary');
    }

}