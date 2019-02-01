import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction } from './transaction.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/transactions/';


@Injectable({providedIn: 'root'})
export class TransactionsService {
  private transactions: Transaction[] = [];
  private transactionsUpdated = new Subject<{transactions: Transaction[], transactionCounts: number} >();
  constructor(private http: HttpClient, private router: Router) {}
  getTransactions(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, transactions: any, maxTransactions: number}>(BACKEND_URL + queryParams)
      .pipe(map((transactionData) => {  // map result only get transaction content not include message
        return { transactions: transactionData.transactions.map((transaction) => { // map _id from database to id same as in model
          return {
            id: transaction._id,
            senderId: transaction.senderId,
            transportorId: transaction.transportorId,
            receiverId: transaction.receiverId,
            dateTime: transaction.dateTime,
            departureStoreId: transaction.departureStoreId,
            destinationStoreId: transaction.destinationStoreId,
            productLists: transaction.productLists,
            transactionStatus: transaction.transactionStatus,
            remark: transaction.remark
          };
        }),
        maxTransactions: transactionData.maxTransactions };
      })
      )
      .subscribe((transformTransaction) => {
        this.transactions = transformTransaction.transactions;  // Transform form { id, title, content } to { _id, title, content }
        this.transactionsUpdated.next({
          transactions: [...this.transactions],
          transactionCounts: transformTransaction.maxTransactions
        });
      });
  }

  getTransactionUpdateListener() {
    return this.transactionsUpdated.asObservable();
  }

  getTransaction(id: string) {
    // return {...this.transactions.find(transaction => transaction.id === id)};
    return this.http.get<{
      _id: string,
      senderId: string,
      transportorId: string,
      receiverId: string,
      dateTime: Date,
      departureStoreId: string,
      destinationStoreId: string,
      productLists: any,
      transactionStatus: 'Created' | 'Send' | 'Transporting' | 'Received' | 'Restore' | null,
      remark: string,
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true

  addTransaction(
    senderId: string,
    transportorId: string,
    receiverId: string,
    // dateTime: Date,
    departureStoreId: string,
    destinationStoreId: string,
    productLists: any,
    transactionStatus: 'Created' | 'Send' | 'Transporting' | 'Received' | 'Restore' | null,
    remark: string
  ) {
    const transactionData = {
      senderId: senderId,
      transportorId: transportorId,
      receiverId: receiverId,
      dateTime: new Date(),
      departureStoreId: departureStoreId,
      destinationStoreId: destinationStoreId,
      productLists: productLists,
      transactionStatus: transactionStatus,
      remark: remark
    };
    // console.log('---start----transactionData-----');
    // console.log(transactionData);
    // console.log('---end----transactionData-----');
    this.http
      .post<{ message: string, transaction: Transaction }>(
      BACKEND_URL,
      transactionData
      )
    .subscribe((responseData) => {

      this.router.navigate(['/transactions']);
    });
  }

  updateTransaction(
    id: string,
    senderId: string,
    transportorId: string,
    receiverId: string,
    // dateTime: Date,
    departureStoreId: string,
    destinationStoreId: string,
    productLists: any,
    transactionStatus: 'Created' | 'Send' | 'Transporting' | 'Received' | 'Restore' | null,
    remark: string
  ) {
    const transactionData: Transaction = {
        id: id,
        senderId: senderId,
        transportorId: transportorId,
        receiverId: receiverId,
        dateTime: new Date(),
        departureStoreId: departureStoreId,
        destinationStoreId: destinationStoreId,
        productLists: productLists,
        transactionStatus: transactionStatus,
        remark: remark
    };
    this.http
      .put(BACKEND_URL + id, transactionData)
      .subscribe((response) => {
          this.router.navigate(['/transactions']);
      });
  }
  deleteTransaction(transactionId: string) {
    return this.http.delete(BACKEND_URL + transactionId);
  }
}
