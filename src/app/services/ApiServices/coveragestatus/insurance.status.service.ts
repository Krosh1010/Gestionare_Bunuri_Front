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
    async getExpiredInsurances(): Promise<any> {
        return this.apiService.getData('api/coverage-status/insurance/expired-assets');
    }
    async getExpiringInsurances(): Promise<any> {
        return this.apiService.getData('api/coverage-status/insurance/expiring-assets');
    }
    async getValidInsurances(): Promise<any> {
        return this.apiService.getData('api/coverage-status/insurance/valid-assets');
    }
    async getWithoutInsurances(): Promise<any> {
        return this.apiService.getData('api/coverage-status/insurance/assets-without-insurance');
    }
}