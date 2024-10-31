import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Stock, Investment } from './app/models/stock.model';
import { StockService } from './app/services/stock.service';
import { AccountService } from './app/services/account.service';
import { AlertService } from './app/services/alert.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div style="padding: 20px;">
      <h2>Stock Market</h2>
      <h3>Cash Balance: ${{cashBalance}}</h3>

      <h3>Available Stocks</h3>
      <table mat-table [dataSource]="stocks" class="mat-elevation-z8" style="width: 100%; margin-bottom: 20px;">
        <ng-container matColumnDef="symbol">
          <th mat-header-cell *matHeaderCellDef>Symbol</th>
          <td mat-cell *matCellDef="let stock">{{stock.symbol}}</td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let stock">{{stock.name}}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let stock">\${{stock.price.toFixed(2)}}</td>
        </ng-container>

        <ng-container matColumnDef="priceChange">
          <th mat-header-cell *matHeaderCellDef>Price Change</th>
          <td mat-cell *matCellDef="let stock" [ngClass]="{'positive-change': stock.priceChange > 0, 'negative-change': stock.priceChange < 0}">
            {{stock.priceChange > 0 ? '+' : ''}}{{stock.priceChange.toFixed(2)}}
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let stock">
            <mat-form-field style="width: 80px; margin-right: 10px;">
              <input matInput type="number" [(ngModel)]="buyShares[stock.symbol]" min="1">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="buyStock(stock)">Buy</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="stockColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: stockColumns;"></tr>
      </table>

      <h3>Your Investments</h3>
      <table mat-table [dataSource]="investments" class="mat-elevation-z8" style="width: 100%;">
        <ng-container matColumnDef="symbol">
          <th mat-header-cell *matHeaderCellDef>Symbol</th>
          <td mat-cell *matCellDef="let inv">{{inv.symbol}}</td>
        </ng-container>

        <ng-container matColumnDef="shares">
          <th mat-header-cell *matHeaderCellDef>Shares</th>
          <td mat-cell *matCellDef="let inv">{{inv.shares}}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Current Price</th>
          <td mat-cell *matCellDef="let inv">\${{inv.price.toFixed(2)}}</td>
        </ng-container>

        <ng-container matColumnDef="cost">
          <th mat-header-cell *matHeaderCellDef>Cost Basis</th>
          <td mat-cell *matCellDef="let inv">\${{inv.cost.toFixed(2)}}</td>
        </ng-container>

        <ng-container matColumnDef="currentValue">
          <th mat-header-cell *matHeaderCellDef>Current Value</th>
          <td mat-cell *matCellDef="let inv">\${{inv.currentValue.toFixed(2)}}</td>
        </ng-container>

        <ng-container matColumnDef="return">
          <th mat-header-cell *matHeaderCellDef>Return</th>
          <td mat-cell *matCellDef="let inv" [ngClass]="{'positive-change': inv.return > 0, 'negative-change': inv.return < 0}">
            \${{inv.return.toFixed(2)}}
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let inv">
            <mat-form-field style="width: 80px; margin-right: 10px;">
              <input matInput type="number" [(ngModel)]="sellShares[inv.symbol]" min="1">
            </mat-form-field>
            <button mat-raised-button color="warn" (click)="sellStock(inv)">Sell</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="investmentColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: investmentColumns;"></tr>
      </table>
    </div>
  `
})
export class App {
  stocks: Stock[] = [];
  investments: Investment[] = [];
  cashBalance: number = 0;
  buyShares: { [key: string]: number } = {};
  sellShares: { [key: string]: number } = {};

  stockColumns = ['symbol', 'name', 'price', 'priceChange', 'action'];
  investmentColumns = ['symbol', 'shares', 'price', 'cost', 'currentValue', 'return', 'action'];

  constructor(
    private stockService: StockService,
    private accountService: AccountService
  ) {
    this.stockService.stocks$.subscribe(stocks => {
      this.stocks = stocks;
    });

    this.accountService.investments$.subscribe(investments => {
      this.investments = investments;
    });

    this.accountService.cashBalance$.subscribe(balance => {
      this.cashBalance = balance;
    });
  }

  buyStock(stock: Stock): void {
    const shares = this.buyShares[stock.symbol] || 0;
    if (shares > 0) {
      this.accountService.buyStock(stock, shares);
      this.buyShares[stock.symbol] = 0;
    }
  }

  sellStock(investment: Investment): void {
    const shares = this.sellShares[investment.symbol] || 0;
    if (shares > 0) {
      this.accountService.sellStock(investment, shares);
      this.sellShares[investment.symbol] = 0;
    }
  }
}

bootstrapApplication(App, {
  providers: [
    provideAnimations()
  ]
});