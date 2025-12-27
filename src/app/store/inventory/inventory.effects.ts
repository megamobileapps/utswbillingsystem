import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { InventoryService } from 'src/app/services/inventory.service';
import * as InventoryActions from './inventory.actions';
import { InventoryItem } from 'src/app/models/inoffice';
import { mergeMap } from 'rxjs/operators';

import { forkJoin } from 'rxjs';
import { InventoryUploadStatus } from 'src/app/models/inventory-upload-status';

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
      mergeMap(({ barcode, labeldate }) =>
        from(this.inventoryService.deleteInventory({ id: `${encodeURIComponent(barcode)}/${encodeURIComponent(labeldate)}` })).pipe(
          map(() => InventoryActions.deleteInventorySuccess({ barcode, labeldate })),
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
          "id": `${encodeURIComponent(item.barcode)}/${encodeURIComponent(item.labeleddate)}`
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

  uploadInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.uploadInventory),
      exhaustMap(({ items }) => {
        const uploadTasks = items.map(item => {
          const data = {
            "itemdetails": item,
            "id": `${encodeURIComponent(item.barcode)}/${encodeURIComponent(item.labeleddate)}`
          };
          return from(this.inventoryService.addInventory(data)).pipe(
            map(() => ({ barcode: item.barcode, labeldate: item.labeleddate, status: 'SUCCESS' } as InventoryUploadStatus)),
            catchError((error) => of({ barcode: item.barcode, labeldate: item.labeleddate, status: 'FAILED', error: error.message } as InventoryUploadStatus))
          );
        });

        return forkJoin(uploadTasks).pipe(
          map(results => {
            const successfulUploads = results.filter(r => r.status === 'SUCCESS');
            const failedUploads = results.filter(r => r.status === 'FAILED');
            return InventoryActions.uploadInventorySuccess({ successfulUploads, failedUploads });
          }),
          catchError(error => of(InventoryActions.uploadInventoryFailure({ error })))
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private inventoryService: InventoryService
  ) {}
}
