import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { AssetsReadModel } from '../../models/assetsmodel/assets-read.model';

@Injectable({
    providedIn: 'root',
})

export class AssetsService {
    constructor(private apiService: ApiService) {}

    async getAssets(): Promise<AssetsReadModel> {
        return this.apiService.getData('api/Assets/my');
    }
    async getAssetById(assetId: string): Promise<AssetsReadModel> {
        return this.apiService.getData(`api/Assets/${assetId}`);
    }
    async deleteAsset(assetId: number): Promise<any> {
        return this.apiService.deleteData(`api/Assets/${assetId}`);
    }
    async createAsset(assetData: any): Promise<any> {
        return this.apiService.postData('api/Assets', assetData);
    }
    async updateAsset(assetId: number, assetData: any): Promise<any> {
        return this.apiService.patchData(`api/Assets/${assetId}`, assetData);
    }


}