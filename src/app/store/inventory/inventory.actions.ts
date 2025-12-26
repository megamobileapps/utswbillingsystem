import { createAction, props } from '@ngrx/store';
import { InventoryItem } from 'src/app/models/inoffice';

export const loadInventory = createAction(
  '[Inventory] Load Inventory'
);

export const loadInventorySuccess = createAction(
  '[Inventory] Load Inventory Success',
  props<{ inventory: InventoryItem[] }>()
);

export const loadInventoryFailure = createAction(
  '[Inventory] Load Inventory Failure',
  props<{ error: any }>()
);

export const deleteInventory = createAction(
  '[Inventory] Delete Inventory',
  props<{ barcode: string }>()
);

export const deleteInventorySuccess = createAction(
  '[Inventory] Delete Inventory Success',
  props<{ barcode: string }>()
);

export const deleteInventoryFailure = createAction(
  '[Inventory] Delete Inventory Failure',
  props<{ error: any }>()
);

export const addInventory = createAction(
  '[Inventory] Add Inventory',
  props<{ item: InventoryItem }>()
);

export const addInventorySuccess = createAction(
  '[Inventory] Add Inventory Success',
  props<{ item: InventoryItem }>()
);

export const addInventoryFailure = createAction(
  '[Inventory] Add Inventory Failure',
  props<{ error: any }>()
);
