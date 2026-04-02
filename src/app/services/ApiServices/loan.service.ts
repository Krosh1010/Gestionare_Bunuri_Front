import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})

export class LoanService {
    constructor(private apiService: ApiService) {}

    async createLoan(loanData: any): Promise<any> {
        return this.apiService.postData('api/loan/create', loanData);
    }
    async getLoansByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/loan/active/by-asset/${assetId}`);
    }
    async getAllLoansByAssetId(assetId: string): Promise<any> {
        return this.apiService.getData(`api/loan/history/by-asset/${assetId}`);
    }
    async deleteLoan(loanId: string): Promise<any> {
        return this.apiService.deleteData(`api/loan/${loanId}`);
    }
    async returnLoan(loanId: string, loanData: any): Promise<any> {
        return this.apiService.patchData(`api/loan/${loanId}/return`, loanData);
    }
    async updateLoan(loanId: string, loanData: any): Promise<any> {
        return this.apiService.patchData(`api/loan/${loanId}`, loanData);
    }

}