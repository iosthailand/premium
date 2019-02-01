import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Transaction } from '../transaction.model';
import { TransactionsService } from '../transactions.service';
import 'hammerjs'; // use for mat-paginator
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit, OnDestroy {
  // transactions = [
  //   { title: "First Transaction", content: "This is the first transaction's content" },
  //   { title: "Second Transaction", content: "This is the second transaction's content" },
  //   { title: "Third Transaction", content: "This is the third transaction's content" }
  // ];
  transactions: Transaction[] = [];
  isLoading = false;
  totalTransactions = 0;
  transactionsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  userIsAuthenticated = false;
  userId: string;
  private transactionsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public transactionsService: TransactionsService, private authService: AuthService) {}

  ngOnInit() {
    // this.transactions = this.transactionsService.getTransactions();
    this.isLoading = true;
    this.transactionsService.getTransactions(this.transactionsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.transactionsSub = this.transactionsService
      .getTransactionUpdateListener()
      .subscribe(( transactionData: { transactions: Transaction[], transactionCounts: number }) => {
        this.isLoading = false;
        this.totalTransactions = transactionData.transactionCounts;
        this.transactions = transactionData.transactions;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); // กรณีเข้ามาครั้งแรกจะต้องทราบสถานะว่าล็อกอินอยู่หรือไม่
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated; // การเปลี่ยนแปลงเมื่อผู้ใช้ล็อกอิน
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(transactionId: string) {
    this.isLoading = true;
    this.transactionsService.deleteTransaction(transactionId).subscribe(() => {
      this.transactionsService.getTransactions(this.transactionsPerPage, this.currentPage);
    }, (err) => {
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.transactionsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.transactionsPerPage = pageData.pageSize;
    this.transactionsService.getTransactions(this.transactionsPerPage, this.currentPage);
  }

  onConfirm(transactionId: string) {
    // edit status of transaction
  }

}
