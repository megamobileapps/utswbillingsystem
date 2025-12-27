export interface InventoryUploadStatus {
  barcode: string;
  labeldate: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}
