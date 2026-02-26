export interface AssetFilterModel {
  categories: {
    electronics: boolean;
    furniture: boolean;
    vehicles: boolean;
    documents: boolean;
  };
  priceMin: number | null;
  priceMax: number | null;
  spaceId: number | null;
}
