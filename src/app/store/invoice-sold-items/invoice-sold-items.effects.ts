import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import * as InvoiceSoldItemsActions from './invoice-sold-items.actions';

@Injectable()
export class InvoiceSoldItemsEffects {
  loadInvoiceSoldItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceSoldItemsActions.loadInvoiceSoldItems),
      switchMap(({ startDate, endDate }) =>
        this.dataService.getInvoiceSoldItemsFromServer(startDate, endDate).pipe(
          map((invoiceSoldItems) => InvoiceSoldItemsActions.loadInvoiceSoldItemsSuccess({ invoiceSoldItems })),
          catchError((error) =>
            of(InvoiceSoldItemsActions.loadInvoiceSoldItemsFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dataService: DataService
  ) {}
}
