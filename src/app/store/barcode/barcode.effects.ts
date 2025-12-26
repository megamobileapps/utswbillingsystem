import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { BarcodeService } from 'src/app/services/barcode.service';
import * as BarcodeActions from './barcode.actions';

@Injectable()
export class BarcodeEffects {
  loadBarcodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BarcodeActions.loadBarcodes),
      exhaustMap(() =>
        this.barcodeService.getAllBarcode().pipe(
          map((barcodes) => BarcodeActions.loadBarcodesSuccess({ barcodes })),
          catchError((error) =>
            of(BarcodeActions.loadBarcodesFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private barcodeService: BarcodeService
  ) {}
}
