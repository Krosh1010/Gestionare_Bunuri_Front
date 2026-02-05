import { ApiService } from "../api.service";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class DashboardService {
    constructor(private apiService: ApiService) {}
    
    async getDashboardData(): Promise<any> {
        return this.apiService.getData('api/Dashboard/assets-summary');
    }

}