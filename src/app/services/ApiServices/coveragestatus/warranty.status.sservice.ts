import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';


@Injectable({
    providedIn: 'root',
})

export class WarrantyStatusService {
    constructor(private apiService: ApiService) {}
    async getWarrantyStatusSummary(): Promise<any> {
        return this.apiService.getData('api/coverage-status/warranty/summary');
    }
    async getExpiredWarranties(): Promise<any> {
        return this.apiService.getData('api/coverage-status/warranty/expired-assets');
    }
    async getExpiringWarranties(): Promise<any> {
        return this.apiService.getData('api/coverage-status/warranty/expiring-assets');
    }
    async getValidWarranties(): Promise<any> {
        return this.apiService.getData('api/coverage-status/warranty/valid-assets');
    }
    async getWithoutWarranties(): Promise<any> {
        return this.apiService.getData('api/coverage-status/warranty/assets-without-warranty');
    }
}