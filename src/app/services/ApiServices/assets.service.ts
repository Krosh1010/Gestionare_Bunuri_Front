import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { AssetsReadModel } from '../../models/assetsmodel/assets-read.model';
import { AssetsCreateModel } from '../../models/assetsmodel/assets-create.model';

@Injectable({
    providedIn: 'root',
})

export class AssetsService {
    constructor(private apiService: ApiService) {}

    async getAssets(
        page: number = 1,
        pageSize: number = 8,
        filters?: {
            name?: string;
            category?: string;
            minValue?: number;
            maxValue?: number;
            spaceId?: number;
        }
    ): Promise<any> {
        const params: any = {
            page: page,
            pageSize: pageSize
        };
        if (filters) {
            if (filters.name) params.name = filters.name;
            if (filters.category) params.category = filters.category;
            if (filters.minValue !== undefined && filters.minValue !== null) params.minValue = filters.minValue;
            if (filters.maxValue !== undefined && filters.maxValue !== null) params.maxValue = filters.maxValue;
            if (filters.spaceId !== undefined && filters.spaceId !== null) params.spaceId = filters.spaceId;
        }
        return this.apiService.getDataWithParams('api/Assets/my/paged', params);
    }
    async getAssetById(assetId: string): Promise<AssetsReadModel> {
        return this.apiService.getData(`api/Assets/${assetId}`);
    }
    async deleteAsset(assetId: number): Promise<any> {
        return this.apiService.deleteData(`api/Assets/${assetId}`);
    }
    async createAsset(assetData: any): Promise<AssetsCreateModel> {
        return this.apiService.postData('api/Assets', assetData);
    }
    async updateAsset(assetId: number, assetData: any): Promise<AssetsCreateModel> {
        return this.apiService.patchData(`api/Assets/${assetId}`, assetData);
    }


}