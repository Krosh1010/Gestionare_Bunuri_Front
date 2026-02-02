import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { SpaceCreateModel } from '../../models/spacemodel/space-create.model';

@Injectable({
    providedIn: 'root',
})

export class SpaceService {
    constructor(private apiService: ApiService) {}
    
    async createSpace(spaceData: any): Promise<any> {
        return this.apiService.postData('api/Spaces/create', spaceData);
    }
    async getSpacesParents(): Promise<any> {
        return this.apiService.getData('api/Spaces/parents');
    }
    async getSpaceByIdParents(parentId: string): Promise<any> {
        return this.apiService.getData(`api/Spaces/children/${parentId}`);
    }
    async getSpaceById(spaceId: string): Promise<any> {
        return this.apiService.getData(`api/Spaces/${spaceId}`);
    }
    async getParentChain(spaceId: string): Promise<any> {
        return this.apiService.getData(`api/Spaces/path/${spaceId}`);
    }
    async deleteSpace(spaceId: string): Promise<any> {
        return this.apiService.deleteData(`api/Spaces/${spaceId}`);
    }
    async updateSpace(spaceId: string, spaceData: SpaceCreateModel): Promise<any> {
        return this.apiService.patchData(`api/Spaces/${spaceId}`, spaceData);
    }

}