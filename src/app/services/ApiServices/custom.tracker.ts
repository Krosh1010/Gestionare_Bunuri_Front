import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})

export class CustomTrackerService {
    constructor(private apiService: ApiService) {}

    async createCustomTracker(trackerData: any): Promise<any> {
        return this.apiService.postData('api/CustomTracker/create', trackerData);
    }
    async getCustomTrackersByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/CustomTracker/by-asset/${assetId}`);
    }
    async deleteCustomTracker(trackerId: string): Promise<any> {
        return this.apiService.deleteData(`api/CustomTracker/${trackerId}`);
    }
    async updateCustomTracker(trackerId: string, trackerData: any): Promise<any> {
        return this.apiService.patchData(`api/CustomTracker/${trackerId}`, trackerData);
    }

}