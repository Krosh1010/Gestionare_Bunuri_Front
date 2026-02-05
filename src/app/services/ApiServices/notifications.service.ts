import { ApiService } from "../api.service";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class NotificationsService {
    constructor(private apiService: ApiService) {}
    
    async getNotifications(): Promise<any> {
        return this.apiService.getData('api/Notifications');
    }
    async deleteNotification(notificationId: string): Promise<any> {
        return this.apiService.deleteData(`api/Notifications/${notificationId}`);
    }
}