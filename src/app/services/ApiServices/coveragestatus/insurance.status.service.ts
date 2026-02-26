import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';


@Injectable({
    providedIn: 'root',
})

export class InsuranceStatusService {
    constructor(private apiService: ApiService) {}
    async getInsuranceStatusSummary(): Promise<any> {
        return this.apiService.getData('api/coverage-status/insurance/summary');
    }
    async getExpiredInsurances(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/insurance/expired-assets', { page, pageSize });
    }
    async getExpiringInsurances(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/insurance/expiring-assets', { page, pageSize });
    }
    async getValidInsurances(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/insurance/valid-assets', { page, pageSize });
    }
    async getWithoutInsurances(page: number = 1, pageSize: number = 10): Promise<any> {
        return this.apiService.getDataWithParams('api/coverage-status/insurance/assets-without-insurance', { page, pageSize });
    }
}