import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as BillActions from '../../store/bill/bill.actions';
import * as InventoryActions from '../../store/inventory/inventory.actions';
import { tap } from 'rxjs/operators';
import { ReportService } from 'src/app/services/report.service';
import { selectInventoryUploadStatus } from 'src/app/store/inventory/inventory.selectors';
import { InventoryUploadStatus } from 'src/app/models/inventory-upload-status';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification',
  template: '',
})
export class NotificationComponent implements OnInit {
  uploadStatus$: Observable<InventoryUploadStatus[]>;
  uploadStatus: InventoryUploadStatus[];

  constructor(
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private reportService: ReportService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.uploadStatus$ = this.store.pipe(select(selectInventoryUploadStatus));
    this.uploadStatus$.subscribe(status => this.uploadStatus = status);

    this.actions$.pipe(
      ofType(BillActions.createBillSuccess),
      tap(() => {
        this.snackBar.open('Invoice created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(BillActions.createBillFailure),
      tap(({ error }) => {
        this.snackBar.open(`Error creating invoice: ${error.message}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(InventoryActions.addInventorySuccess),
      tap(() => {
        this.snackBar.open('Inventory added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(InventoryActions.addInventoryFailure),
      tap(({ error }) => {
        this.snackBar.open(`Error adding inventory: ${error.message}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(InventoryActions.deleteInventorySuccess),
      tap(() => {
        this.snackBar.open('Inventory deleted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(InventoryActions.deleteInventoryFailure),
      tap(({ error }) => {
        this.snackBar.open(`Error deleting inventory: ${error.message}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(InventoryActions.uploadInventorySuccess),
      tap(() => {
        const snackBarRef = this.snackBar.open('Inventory upload complete.', 'Download Report', {
          duration: 10000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        snackBarRef.onAction().subscribe(() => {
          this.reportService.downloadReport(this.uploadStatus);
        });
      })
    ).subscribe();
  }
}
