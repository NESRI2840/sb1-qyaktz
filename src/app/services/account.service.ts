import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Investment, Stock } from '../models/stock.model';
import { AlertService } from './alert.service';
import { StockService } from './stock.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private cashBalance = 10000;
  private cashBalanceSubject = new BehaviorSubject<number>(this.cashBalance);
  cashBalance$ = this.cashBalanceSubject.asObservable();

  private investments: Investment[] = [];
  private investmentsSubject = new BehaviorSubject<Investment[]>(this.investments);
  investments$ = this.investmentsSubject.asObservable();

  constructor(
    private alertService: AlertService,
    private stockService: StockService
  ) {
    this.updateInvestments();
  }

  private updateInvestments(): void {
    setInterval(() => {
      this.investments = this.investments.map(inv => {
        const currentPrice = this.stockService.getStockPrice(inv.symbol);
        const currentValue = currentPrice * inv.shares;
        return {
          ...inv,
          price: currentPrice,
          currentValue,
          return: currentValue - inv.cost
        };
      });
      this.investmentsSubject.next(this.investments);
    }, 2000);
  }

  buyStock(stock: Stock, shares: number): void {
    const totalCost = stock.price * shares;
    
    if (totalCost > this.cashBalance) {
      this.alertService.showError('Insufficient funds');
      return;
    }

    const existingInvestment = this.investments.find(i => i.symbol === stock.symbol);
    
    if (existingInvestment) {
      existingInvestment.shares += shares;
      existingInvestment.cost += totalCost;
    } else {
      this.investments.push({
        symbol: stock.symbol,
        name: stock.name,
        shares,
        price: stock.price,
        priceChange: stock.priceChange,
        cost: totalCost,
        currentValue: totalCost,
        return: 0
      });
    }

    this.cashBalance -= totalCost;
    this.cashBalanceSubject.next(this.cashBalance);
    this.investmentsSubject.next(this.investments);
    this.alertService.showSuccess(`Bought ${shares} shares of ${stock.symbol}`);
  }

  sellStock(investment: Investment, shares: number): void {
    if (shares > investment.shares) {
      this.alertService.showError('Not enough shares to sell');
      return;
    }

    const saleValue = investment.price * shares;
    const costBasis = (investment.cost / investment.shares) * shares;

    investment.shares -= shares;
    investment.cost -= costBasis;

    if (investment.shares === 0) {
      this.investments = this.investments.filter(i => i.symbol !== investment.symbol);
    }

    this.cashBalance += saleValue;
    this.cashBalanceSubject.next(this.cashBalance);
    this.investmentsSubject.next(this.investments);
    this.alertService.showSuccess(`Sold ${shares} shares of ${investment.symbol}`);
  }
}
