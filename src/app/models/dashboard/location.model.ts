export interface LocationNode {
  id: number;
  name: string;
  type: number;
  parentSpaceId: number | null;
  children?: LocationNode[];
  expanded?: boolean;
  childrenLoaded?: boolean;
  loadingChildren?: boolean;
}