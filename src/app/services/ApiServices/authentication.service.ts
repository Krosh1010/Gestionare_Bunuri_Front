import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { RegisterModel} from '../../models/authmodel/register.model';
import { LogModel } from '../../models/authmodel/log.model';

@Injectable({
    providedIn: 'root',
})

export class AuthenticationService {
    constructor(private apiService: ApiService) {}

    async login(authData: LogModel): Promise<any> {
        return this.apiService.postData('api/Auth/login', authData);
    }

    async register(registerData: RegisterModel): Promise<any> {
        const response = await this.apiService.postData('api/Auth/register', registerData);
        if (response && response.data && response.data.token) {
            localStorage.setItem('authToken', JSON.stringify({ token: response.data.token }));
        }
        return response.data;
    }
}