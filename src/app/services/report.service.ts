import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { InventoryUploadStatus } from '../models/inventory-upload-status';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  downloadReport(data: InventoryUploadStatus[]): void {
    if (!data || data.length === 0) {
      return;
    }

    const successfulUploads = data.filter(item => item.status === 'SUCCESS');
    const failedUploads = data.filter(item => item.status === 'FAILED');

    const successfulSheet = XLSX.utils.json_to_sheet(successfulUploads);
    const failedSheet = XLSX.utils.json_to_sheet(failedUploads);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, successfulSheet, 'Successful');
    XLSX.utils.book_append_sheet(workbook, failedSheet, 'Failed');

    XLSX.writeFile(workbook, 'inventory_upload_report.xlsx');
  }
}