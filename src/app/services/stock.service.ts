import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Stock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stocks: Stock[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 150, priceChange: 0 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2800, priceChange: 0 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 300, priceChange: 0 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3300, priceChange: 0 },
  ];

  private stocksSubject = new BehaviorSubject<Stock[]>(this.stocks);
  stocks$ = this.stocksSubject.asObservable();

  constructor() {
    this.simulatePriceChanges();
  }

  private simulatePriceChanges(): void {
    setInterval(() => {
      this.stocks = this.stocks.map(stock => {
        const change = (Math.random() - 0.5) * 10;
        const newPrice = Math.max(stock.price + change, 0.01);
        return {
          ...stock,
          price: +newPrice.toFixed(2),
          priceChange: +change.toFixed(2)
        };
      });
      this.stocksSubject.next(this.stocks);
    }, 2000);
  }

  getStockPrice(symbol: string): number {
    return this.stocks.find(s => s.symbol === symbol)?.price || 0;
  }
}