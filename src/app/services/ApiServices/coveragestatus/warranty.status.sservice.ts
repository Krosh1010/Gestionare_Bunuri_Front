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
    async getExpiredWarranties(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/warranty/expired-assets', { page, pageSize });
    }
    async getExpiringWarranties(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/warranty/expiring-assets', { page, pageSize });
    }
    async getValidWarranties(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/warranty/valid-assets', { page, pageSize });
    }
    async getWithoutWarranties(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/warranty/assets-without-warranty', { page, pageSize });
    }
}