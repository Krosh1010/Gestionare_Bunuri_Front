import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
    providedIn: 'root',
})

export class ExportService {
    constructor(private apiService: ApiService) {}
    async exportAssetsToExcel(payload: any): Promise<Blob> {
        return this.apiService.postFile('api/export/assets-excel', payload);
    }
    async exportAssetsToPdf(payload: any): Promise<Blob> {
        return this.apiService.postFile('api/export/assets-pdf', payload);
    }
    async exportAssetsToCsv(payload: any): Promise<Blob> {
        return this.apiService.postFile('api/export/assets-csv', payload);
    }
}