import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import * as BillActions from './bill.actions';

@Injectable()
export class BillEffects {
  loadBills$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BillActions.loadBills),
      switchMap(({ startDate, endDate }) =>
        this.dataService.getInvoiceDataFromServer(startDate, endDate).pipe(
          map((bills) => BillActions.loadBillsSuccess({ bills })),
          catchError((error) =>
            of(BillActions.loadBillsFailure({ error }))
          )
        )
      )
    )
  );

  createBill$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BillActions.createBill),
      tap(() => console.log('BillEffects: createBill action caught')), // Added console log
      switchMap(({ bill }) => {
        console.log('BillEffects: Calling DataService.saveInvoiceDataOnServer with bill:', bill); // Added console log
        return this.dataService.saveInvoiceDataOnServer(bill).pipe(
          map((savedBill) => {
            console.log('BillEffects: saveInvoiceDataOnServer success, savedBill:', savedBill); // Added console log
            return BillActions.createBillSuccess({ bill: savedBill });
          }),
          catchError((error) => {
            console.error('BillEffects: saveInvoiceDataOnServer error:', error); // Added console log
            return of(BillActions.createBillFailure({ error }));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private dataService: DataService
  ) {}
}
