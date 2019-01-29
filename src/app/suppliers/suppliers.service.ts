import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Supplier } from './supplier.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/suppliers/';


@Injectable({providedIn: 'root'})
export class SuppliersService {
  private suppliers: Supplier[] = [];
  private suppliersUpdated = new Subject<{suppliers: Supplier[], supplierCounts: number} >();

  constructor(private http: HttpClient, private router: Router) {}

  getSuppliers(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, suppliers: any, maxSuppliers: number}>(BACKEND_URL + queryParams)
      .pipe(map((supplierData) => {  // map result only get supplier content not include message
        return { suppliers: supplierData.suppliers.map((supplier) => { // map _id from database to id same as in model
          return {
            id: supplier._id,
            supplierName: supplier.supplierName,
            supplierDetails: supplier.supplierDetails,
            imagePath: supplier.imagePath,
            creator: supplier.creator
          };
        }),
        maxSuppliers: supplierData.maxSuppliers };
      })
      )
      .subscribe((transformSupplier) => {
        this.suppliers = transformSupplier.suppliers;  // Transform form { id, title, content } to { _id, title, content }
        this.suppliersUpdated.next({
          suppliers: [...this.suppliers],
          supplierCounts: transformSupplier.maxSuppliers
        });
      });
  }

  getSupplierUpdateListener() {
    return this.suppliersUpdated.asObservable();
  }

  getSupplier(id: string) {
    // return {...this.suppliers.find(supplier => supplier.id === id)};
    return this.http.get<{
      _id: string,
      supplierName: string,
      supplierDetails: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addSupplier( supplierName: string, supplierDetails: string,  image: File) {
    const supplierData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    supplierData.append('supplierName', supplierName);
    supplierData.append('supplierDetails', supplierDetails);
    supplierData.append('image', image, supplierName);

    this.http
      .post<{ message: string, supplier: Supplier }>(
      BACKEND_URL,
      supplierData
      )
    .subscribe((responseData) => {
      this.router.navigate(['/suppliers']);
    });
  }

  updateSupplier(
    id: string, supplierName: string, supplierDetails: string, image: File | string
    ) {
    let supplierData: Supplier | FormData;
    if (typeof image === 'object') {
      supplierData = new FormData();
      supplierData.append('id', id);
      supplierData.append('supplierName', supplierName);
      supplierData.append('supplierDetails', supplierDetails);
      supplierData.append('image', image, supplierName);
    } else {
      supplierData = {
        id: id,
        supplierName: supplierName,
        supplierDetails: supplierDetails,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, supplierData)
      .subscribe((response) => {
          this.router.navigate(['/suppliers']);
      });
  }
  deleteSupplier(supplierId: string) {
    return this.http.delete(BACKEND_URL + supplierId);
  }
}
