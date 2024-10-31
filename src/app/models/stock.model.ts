export interface Stock {
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
}

export interface Investment {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  priceChange: number;
  cost: number;
  currentValue: number;
  return: number;
}