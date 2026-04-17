import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
    providedIn: 'root',
})

export class InsuranceService {
    constructor(private apiService: ApiService) {}
    
    async createInsurance(insuranceData: any, document?: File): Promise<any> {
        const formData = new FormData();
        formData.append('AssetId', String(insuranceData.assetId));
        formData.append('Company', insuranceData.company);
        formData.append('InsuredValue', String(insuranceData.insuredValue));
        formData.append('StartDate', insuranceData.startDate);
        formData.append('EndDate', insuranceData.endDate);
        if (insuranceData.spaceId != null) {
            formData.append('SpaceId', String(insuranceData.spaceId));
        }
        if (document) {
            formData.append('document', document);
        }
        return this.apiService.postFormData('api/Insurance/create', formData);
    }
    async getInsuranceByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/Insurance/by-asset/${assetId}`);
    }
    async deleteInsurance(assetId: string): Promise<any> {
        return this.apiService.deleteData(`api/Insurance/by-asset/${assetId}`);
    }
    async updateInsurance(assetId: string, insuranceData: any, document?: File): Promise<any> {
        const formData = new FormData();
        if (insuranceData.company) formData.append('Company', insuranceData.company);
        if (insuranceData.insuredValue) formData.append('InsuredValue', String(insuranceData.insuredValue));
        if (insuranceData.startDate) formData.append('StartDate', insuranceData.startDate);
        if (insuranceData.endDate) formData.append('EndDate', insuranceData.endDate);
        if (insuranceData.spaceIdIsSet) {
            formData.append('SpaceIdIsSet', 'true');
            if (insuranceData.spaceId != null) {
                formData.append('SpaceId', String(insuranceData.spaceId));
            }
        }
        if (document) {
            formData.append('document', document);
        }
        return this.apiService.patchFormData(`api/Insurance/by-asset/${assetId}`, formData);
    }
    async getExpiringInsurances(): Promise<any> {
        return this.apiService.getData('api/Insurance/insurance-summary');
    }
    async downloadInsuranceDocument(assetId: string): Promise<Blob> {
        return this.apiService.getFile(`api/Insurance/by-asset/${assetId}/document/download`);
    }
    async deleteInsuranceDocument(assetId: string): Promise<any> {
        return this.apiService.deleteSimple(`api/Insurance/by-asset/${assetId}/document`);
    }
}