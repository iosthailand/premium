export interface User {
  id: string;
  email: string;
  content: string;
  password: string;
  permission: string;
  storeId?: string;
  status?: boolean;
}
