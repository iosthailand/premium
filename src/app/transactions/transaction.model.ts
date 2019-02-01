import { ProductItem } from './../products/product-item.model';

export interface Transaction {
  id: string;
  senderId: string;
  transportorId?: string;
  receiverId?: string;
  dateTime?: Date;
  departureStoreId: string;
  destinationStoreId: string;
  productLists: any;
  transactionStatus: 'Created' | 'Send' | 'Transporting' | 'Received' | 'Restore' | null;
  remark?: string;
}
