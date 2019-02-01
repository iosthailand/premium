import { ProductItem } from './../products/product-item.model';

export interface Transaction {
  id: string;
  senderId: string;
  transportorId?: string;
  receiverId?: string;
  dataTime?: Date;
  departureStoreId: string;
  destinationStoreId: string;
  productLists: any;
  transactionStatus: 'stockOut' | 'transporting' | 'storeIn' | null;
  remark?: string;
}
