export interface Car {
  id: number;
  manufacturer: string;
  model: string;
  year: number;
  condition: 'new' | 'used';
  price: number;
}

export type CarCondition = 'new' | 'used';
export type SortBy = 'price' | 'year' | 'id';
export type SortOrder = 'asc' | 'desc';