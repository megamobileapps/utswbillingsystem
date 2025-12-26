import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { InventoryService } from 'src/app/services/inventory.service';
import * as InventoryActions from './inventory.actions';
import { InventoryItem } from 'src/app/models/inoffice';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class InventoryEffects {
  loadInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.loadInventory),
      exhaustMap(() =>
        this.inventoryService.getAllInventory().pipe(
          map((data: any[]) => {
            // The service returns an array of {itemdetails: InventoryItem}, we need to map it
            const inventory: InventoryItem[] = data.map(itemWrapper => itemWrapper.itemdetails as InventoryItem);
            return InventoryActions.loadInventorySuccess({ inventory });
          }),
          catchError((error) =>
            of(InventoryActions.loadInventoryFailure({ error }))
          )
        )
      )
    )
  );

  deleteInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.deleteInventory),
      mergeMap(({ barcode }) =>
        from(this.inventoryService.deleteInventory({ id: barcode })).pipe( // Assuming deleteInventory returns a Promise
          map(() => InventoryActions.deleteInventorySuccess({ barcode })),
          catchError((error) =>
            of(InventoryActions.deleteInventoryFailure({ error }))
          )
        )
      )
    )
  );

  addInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.addInventory),
      mergeMap(({ item }) => {
        const data = {
          "itemdetails": item,
          "id": item.barcode + '/' + item.labeleddate
        };
        return from(this.inventoryService.addInventory(data)).pipe(
          map(() => InventoryActions.addInventorySuccess({ item })),
          catchError((error) =>
            of(InventoryActions.addInventoryFailure({ error }))
          )
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private inventoryService: InventoryService
  ) {}
}
