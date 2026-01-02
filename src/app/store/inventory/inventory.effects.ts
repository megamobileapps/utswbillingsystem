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
            const inventory: InventoryItem[] = data.map(itemWrapper => {
              const item = itemWrapper.itemdetails as InventoryItem;
              return {
                ...item,
                lastupdatedby: 'System',
                lastupdatedon: new Date(),
                netvalue:item.mrp*( (100 - item.discount)/100 )
              };
            });
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
        const newItem = {
          ...item,
          lastupdatedby: 'System',
          lastupdatedon: new Date()
        };
        const data = {
          "itemdetails": newItem,
          "id": `${encodeURIComponent(newItem.barcode)}/${encodeURIComponent(newItem.labeleddate)}`
        };
        return from(this.inventoryService.addInventory(data)).pipe(
          map(() => InventoryActions.addInventorySuccess({ item: newItem })),
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
          const newItem = {
            ...item,
            lastupdatedby: 'System',
            lastupdatedon: new Date()
          };
          const data = {
            "itemdetails": newItem,
            "id": `${encodeURIComponent(newItem.barcode)}/${encodeURIComponent(newItem.labeleddate)}`
          };
          return from(this.inventoryService.addInventory(data)).pipe(
            map(() => ({ item: newItem, status: 'SUCCESS' as const })),
            catchError((error) => of({ item: item, status: 'FAILED' as const, error: error.message }))
          );
        });

        return forkJoin(uploadTasks).pipe(
          map(results => {
            const successfulUploads: InventoryUploadStatus[] = [];
            const failedUploads: InventoryUploadStatus[] = [];
            const successfulItems: InventoryItem[] = [];

            for (const r of results) {
              if (r.status === 'SUCCESS') {
                successfulUploads.push({ barcode: r.item.barcode, labeldate: r.item.labeleddate, status: 'SUCCESS' });
                successfulItems.push(r.item);
              } else if (r.status === 'FAILED') {
                failedUploads.push({ barcode: r.item.barcode, labeldate: r.item.labeleddate, status: 'FAILED', error: r.error });
              }
            }
            return InventoryActions.uploadInventorySuccess({ successfulUploads, failedUploads, successfulItems });
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
