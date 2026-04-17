import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})

export class LoanService {
    constructor(private apiService: ApiService) {}

    async createLoan(loanData: any, documents?: File[]): Promise<any> {
        const formData = new FormData();
        formData.append('AssetId', String(loanData.assetId));
        formData.append('LoanedToName', loanData.loanedToName);
        formData.append('Condition', loanData.condition);
        formData.append('LoanedAt', loanData.loanedAt);
        if (loanData.notes) formData.append('Notes', loanData.notes);
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                formData.append('documents', doc);
            }
        }
        return this.apiService.postFormData('api/loan/create', formData);
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
    async updateLoan(loanId: string, loanData: any, documents?: File[]): Promise<any> {
        const formData = new FormData();
        if (loanData.loanedToName) formData.append('LoanedToName', loanData.loanedToName);
        if (loanData.condition) formData.append('Condition', loanData.condition);
        if (loanData.loanedAt) formData.append('LoanedAt', loanData.loanedAt);
        if (loanData.notes) formData.append('Notes', loanData.notes);
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                formData.append('documents', doc);
            }
        }
        return this.apiService.patchFormData(`api/loan/${loanId}`, formData);
    }
    async downloadLoanDocument(documentId: string): Promise<Blob> {
        return this.apiService.getFile(`api/loan/document/${documentId}/download`);
    }
    async deleteLoanDocument(documentId: string): Promise<any> {
        return this.apiService.deleteSimple(`api/loan/document/${documentId}`);
    }
    async deleteAllLoanDocuments(loanId: string): Promise<any> {
        return this.apiService.deleteSimple(`api/loan/${loanId}/documents`);
    }

}