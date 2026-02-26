import { Injectable } from '@angular/core';
import { AssetFilterModel } from '../models/assetsmodel/asset-filter.model';

@Injectable({
  providedIn: 'root',
})
export class AssetFilterService {
  defaultFilter: AssetFilterModel = {
    categories: {
      electronics: false,
      furniture: false,
      vehicles: false,
      documents: false
    },
    priceMin: null,
    priceMax: null,
    spaceId: null
  };

  getDefaultFilter(): AssetFilterModel {
    // Returnează o copie nouă pentru a evita mutarea accidentală a valorilor implicite
    return JSON.parse(JSON.stringify(this.defaultFilter));
  }

  buildBackendFilter(filters: AssetFilterModel, searchQuery: string): any {
    const categories = Object.entries(filters.categories)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    const backendFilters: any = {};
    if (searchQuery) backendFilters.name = searchQuery;
    if (categories.length === 1) backendFilters.category = categories[0];
    else if (categories.length > 1) backendFilters.category = categories;
    if (filters.priceMin !== null && filters.priceMin !== undefined) backendFilters.minValue = filters.priceMin;
    if (filters.priceMax !== null && filters.priceMax !== undefined) backendFilters.maxValue = filters.priceMax;
    if (filters.spaceId !== null && filters.spaceId !== undefined) backendFilters.spaceId = filters.spaceId;
    return backendFilters;
  }

  resetFilter(): AssetFilterModel {
    return this.getDefaultFilter();
  }
}
