import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})

export class UserService {
    constructor(private apiService: ApiService) {}
    
    async getInfoUser(): Promise<any> {
        return this.apiService.getData(`api/User/me`);
    }

    async updateUser(data: { fullName?: string; email?: string }): Promise<any> {
        return this.apiService.patchData(`api/User/update-data`, data);
    }

    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
        return this.apiService.patchData(`api/User/change-password`, data);
    }
}