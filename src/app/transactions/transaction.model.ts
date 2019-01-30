import { ProductItem } from './../products/product-item.model';

export interface Transaction {
  id: string;
  managerId: string;
  transportorId?: string;
  dhStaffId?: string;
  dataTime?: Date;
  destinationStoreId: string;
  productLists: ProductItem[];
  transactionStatus: 'stockOut' | 'transporting' | 'storeIn' | null;
  remark?: string;
}
