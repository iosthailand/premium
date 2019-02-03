import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from './store.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/stores/';


@Injectable({providedIn: 'root'})
export class StoresService {
  private stores: Store[] = [];
  private storesUpdated = new Subject<{stores: Store[], storeCounts: number} >();
  private storesOuterSub = new Subject<Store[]>();
  constructor(private http: HttpClient, private router: Router) {}

  getStores(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, stores: any, maxStores: number}>(BACKEND_URL + queryParams)
      .pipe(map((storeData) => {  // map result only get store content not include message
        return { stores: storeData.stores.map((store) => { // map _id from database to id same as in model
          return {
            id: store._id,
            storeName: store.storeName,
            storeCode: store.storeCode,
            storeDetails: store.storeDetails,
            imagePath: store.imagePath,
            creator: store.creator
          };
        }),
        maxStores: storeData.maxStores };
      })
      )
      .subscribe((transformStore) => {
        this.stores = transformStore.stores;  // Transform form { id, title, content } to { _id, title, content }
        this.storesUpdated.next({
          stores: [...this.stores],
          storeCounts: transformStore.maxStores
        });
      });
  }

  getStoreUpdateListener() {
    return this.storesUpdated.asObservable();
  }
  getStoreOuterListener() {
    return this.storesOuterSub.asObservable();
  }
  getStore(id: string) {
    // return {...this.stores.find(store => store.id === id)};
    return this.http.get<{
      _id: string,
      storeName: string,
      storeCode: string,
      storeDetails: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addStore( storeName: string, storeDetails: string, storeCode: string,  image: File) {
    const storeData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    storeData.append('storeName', storeName);
    storeData.append('storeCode', storeCode);
    storeData.append('storeDetails', storeDetails);
    storeData.append('image', image, storeName);

    this.http
      .post<{ message: string, store: Store }>(
      BACKEND_URL,
      storeData
      )
    .subscribe((responseData) => {
      this.router.navigate(['/stores']);
    });
  }

  updateStore(
    id: string, storeName: string, storeCode: string, storeDetails: string, image: File | string
    ) {
    let storeData: Store | FormData;
    if (typeof image === 'object') {
      storeData = new FormData();
      storeData.append('id', id);
      storeData.append('storeName', storeName);
      storeData.append('storeCode', storeCode);
      storeData.append('storeDetails', storeDetails);
      storeData.append('image', image, storeName);
    } else {
      storeData = {
        id: id,
        storeName: storeName,
        storeCode: storeCode,
        storeDetails: storeDetails,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, storeData)
      .subscribe((response) => {
          this.router.navigate(['/stores']);
      });
  }
  deleteStore(storeId: string) {
    return this.http.delete(BACKEND_URL + storeId);
  }
  getAllCurrentStoresOutside() {
    return this.http
      .get<{message: string, stores: any[]}>(BACKEND_URL)
      .pipe(map((storeData) => {  // map result only get store content not include message
        return { stores: storeData.stores.map((store) => { // map _id from database to id same as in model
          return {
            id: store._id,
            storeName: store.storeName,
            storeCode: store.storeCode,
            storeDetails: store.storeDetails,
            imagePath: store.imagePath,
            creator: store.creator
          };
        })};
      })
    );
  }
}
