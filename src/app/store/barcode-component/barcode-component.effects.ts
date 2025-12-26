import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { BarcodeService } from 'src/app/services/barcode.service';
import * as BarcodeComponentActions from './barcode-component.actions';

@Injectable()
export class BarcodeComponentEffects {
  loadBarcodeComponents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BarcodeComponentActions.loadBarcodeComponents),
      exhaustMap(() =>
        this.barcodeService.getAllBarcodecomponentAtLevel().pipe(
          map((barcodeComponents) => BarcodeComponentActions.loadBarcodeComponentsSuccess({ barcodeComponents })),
          catchError((error) =>
            of(BarcodeComponentActions.loadBarcodeComponentsFailure({ error }))
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
