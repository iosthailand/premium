import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction } from './transaction.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Stock } from 'untitled folder/src/app/transactions/stock.model';

const BACKEND_URL = environment.apiUrl + '/transactions/';
const BACKEND_URL_STOCK = environment.apiUrl + '/stocks/';

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

  changeTransactionStatus(
    transactionId: string,
    senderId: string,
    transportorId: string,
    receiverId: string,
    departureStoreId: string,
    destinationStoreId: string,
    productLists: any,
    transectionStatus: 'Created' | 'Send' | 'Transporting' | 'Received' | 'Restore' | null
    ) {

    const transactionData = {
      id: transactionId,
      senderId: senderId,
      transportorId: transportorId,
      receiverId: receiverId,
      departureStoreId: departureStoreId,
      destinationStoreId: destinationStoreId,
      productLists: productLists,
      transactionStatus: transectionStatus
    };

    switch (transectionStatus) {
      case 'Created':
      transactionData.transactionStatus = 'Send';
        this.http
        .put(BACKEND_URL + 'change/' + transactionId, transactionData)
        .subscribe((response) => {
          this.router.navigate(['/']);
        });
        break;
      case 'Send':
      transactionData.transactionStatus = 'Transporting';
        this.http
        .put(BACKEND_URL + 'change/' + transactionId, transactionData)
        .subscribe((response) => {
          this.router.navigate(['/']);
        });
        break;
      case 'Transporting':
      // console.log('Transporting');
          const stockDataArray = Array();
          this.getTransaction(transactionId).subscribe( response => {
          let counter = 0;
          // เมื่อมีสินค้าที่จะถูกเพิ่มใน store
          if (response.productLists.length > 0) {
            // วนเข้าไปยังสินค้าทุกๆ ตัวที่จะเพิ่มไปยังสโตว์
            response.productLists.forEach(product => {
            // ขั้นตอนที่ 1 เตรียมเขียนเข้าสต๊อกปลายทาง โดยค้นจำนวนสต๊อกปลายทาง
              let destinationStock: number;
              let departureStock: number;
              const queryParams = `?productId=${product.productId._id}&storeId=${transactionData.destinationStoreId['_id']}`;
              this.http
              .get<{message: string, stock: Stock}>(BACKEND_URL_STOCK + queryParams)
              .subscribe((resultFromDestinationStore) => {
                destinationStock = resultFromDestinationStore.stock.currentStock;

                const stockDataIn = {
                  productId: product.productId._id,
                  storeId: transactionData.destinationStoreId['_id'],  // ไม่มีข้อมูลสินค้าเดิมให้เพิ่มไปยัง store ปลายทาง
                  // destinationStoreId: transactionData.destinationStoreId['_id'],
                  dateTime: new Date(),
                  code: 'SI',
                  stockIn: product.productQuantity,
                  stockOut: 0,
                  currentStock: destinationStock + product.productQuantity,
                  transactionId: response.transportorId
                };
                stockDataArray.push(stockDataIn);
                console.log('current-stock----in');
                console.log(resultFromDestinationStore.stock.currentStock);
                console.log('stock--dataArray');
                console.log(stockDataArray);

                // ขั้นตอนที่ 2 เตรียมหักออกจากสต๊อกต้นทาง
                const queryParamsOut = `?productId=${product.productId._id}&storeId=${transactionData.departureStoreId['_id']}`;
                this.http
                .get<{message: string, stock: Stock}>(BACKEND_URL_STOCK + queryParamsOut)
                .subscribe((resultFromDepartureStock) => {
                  departureStock = resultFromDepartureStock.stock.currentStock;
                  const stockDataOut = {
                    productId: product.productId._id,
                    storeId: transactionData.departureStoreId['_id'],
                    // destinationStoreId: transactionData.destinationStoreId['_id'],
                    dateTime: new Date(),
                    code: 'SO',
                    stockIn: 0,
                    stockOut: product.productQuantity,
                    currentStock: departureStock - product.productQuantity,
                    transactionId: response.transportorId
                  };
                  console.log('current-stock----out');
                  console.log(resultFromDepartureStock.stock.currentStock);
                  stockDataArray.push(stockDataOut);
                  console.log('stock--dataArray--2');
                  console.log(stockDataArray);

                  console.log('product-couter');
                  console.log(counter);

                  console.log('product-list-length');
                  console.log(response.productLists.length);
                  // ดูว่าเป็นสินค้าที่จะเพิ่มลงในสโตร์เป็นรายการสุดท้ายหรือไม่
                  if (response.productLists.length - 1 === counter) {
                    console.log('stock--dataArray--3');
                    console.log(stockDataArray);
                    this.http
                    .post<{message: string}>(BACKEND_URL_STOCK, stockDataArray)
                    .subscribe((updateResponse) => {

                      // หลังจากอัพเดทฐานข้อมูลแล้วต้องเปลี่ยนสถานะของ transaction
                      transactionData.transactionStatus = 'Received'; // ต้องการเปลี่ยนจาก Transporting เป็น Received
                      this.http
                      .put(BACKEND_URL + 'change/' + transactionId, transactionData)
                      .subscribe((finalResponse) => {
                        this.router.navigate(['/']);
                      });
                    });
                  }
                  counter++;  // ตัวนับสำหรับตรวจสอบว่าเป็นสินค้ารายการสุดท้ายหรือไม่
                });
              });

            });
          }


          //   response.productLists.forEach(product => {
          //     const queryParams = `?productId=${product.productId._id}&storeId=${transactionData.departureStoreId['_id']}`;
          //     this.http
          //     .get<{message: string, stocks: Stock[]}>(BACKEND_URL_STOCK + queryParams)
          //     .subscribe((result) => {

          //       if (result.stocks.length <= 0 ) { // กรณีไม่พบสินค้าตัวเก่าในสต๊อก ให้เพิ่มเข้าไปเลย
          //         const stockDataIn = {
          //           productId: product.productId._id,
          //           storeId: transactionData.destinationStoreId['_id'],  // ไม่มีข้อมูลสินค้าเดิมให้เพิ่มไปยัง store ปลายทาง
          //           // destinationStoreId: transactionData.destinationStoreId['_id'],
          //           dateTime: new Date(),
          //           code: 'SI',
          //           stockIn: product.productQuantity,
          //           stockOut: 0,
          //           currentStock: product.productQuantity,
          //           transactionId: response.transportorId
          //         };
          //         stockDataArray.push(stockDataIn);
          //         console.log(stockDataArray);
          //         this.http
          //         .post<{message: string}>(BACKEND_URL_STOCK, stockDataArray)
          //         .subscribe((test) => {
          //           // transactionData.transactionStatus = 'Received'; // ต้องการเปลี่ยนจาก Transporting เป็น Received
          //           // console.log(result);
          //           // this.router.navigate(['/']);
          //         });
          //       } else {  // กรณีที่พบสินค้าเก่าในสต๊อก
          //         // transactionData.transactionStatus = 'Received'; // ต้องการเปลี่ยนจาก Transporting เป็น Received
          //         console.log(result.stocks);
          //         for (const stock of result.stocks) {
          //           // ตรวจสอบ stock ทั้ง store ต้นทางและปลายทาง
          //           if (transactionData.destinationStoreId['_id'] === stock.storeId
          //           && transactionData.id !== stock.transactionId) {
          //             const stockDataIn = {
          //               productId: product.productId._id,
          //               storeId: stock.storeId,
          //               // destinationStoreId: transactionData.destinationStoreId['_id'],
          //               dateTime: new Date(),
          //               code: 'SI',
          //               stockIn: product.productQuantity,
          //               stockOut: 0,
          //               currentStock: stock.currentStock + product.productQuantity,
          //               transactionId: response.transportorId
          //             };
          //             console.log('current-stock----in');
          //             console.log(stock.currentStock);
          //             stockDataArray.push(stockDataIn);
          //           }
          //           if (transactionData.departureStoreId['_id'] === stock.storeId
          //           && transactionData.id !== stock.transactionId) {
          //             const stockDataOut = {
          //               productId: product.productId._id,
          //               storeId: stock.storeId,
          //               destinationStoreId: transactionData.destinationStoreId['_id'],
          //               dateTime: new Date(),
          //               code: 'SO',
          //               stockIn: 0,
          //               stockOut: product.productQuantity,
          //               currentStock: stock.currentStock - product.productQuantity,
          //               transactionId: response.transportorId
          //             };
          //             console.log('current-stock----out');
          //             console.log(stock.currentStock);
          //             stockDataArray.push(stockDataOut);
          //           }
          //         }
          //         // console.log(stockDataArray);
          //         // ตรวจสอบว่าเป็นข้อมูลสุดท้ายหรือไม่
          //         if (response.productLists.length - 1 === counter) {
          //           // console.log(stockDataArray);
          //           this.http
          //           .post<{message: string}>(BACKEND_URL_STOCK, stockDataArray)
          //           .subscribe((test) => {
          //             // transactionData.transactionStatus = 'Received'; // ต้องการเปลี่ยนจาก Transporting เป็น Received
          //             // console.log(result);
          //             // this.router.navigate(['/']);
          //           });
          //         }
          //         counter++;  // ตัวนับสำหรับตรวจสอบว่าเป็นสินค้ารายการสุดท้ายหรือไม่
          //       }
          //     });
          //   });
          // }
        });
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
