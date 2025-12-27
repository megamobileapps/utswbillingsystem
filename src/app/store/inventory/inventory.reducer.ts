import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { InventoryItem } from 'src/app/models/inoffice';
import * as InventoryActions from './inventory.actions';

import { InventoryUploadStatus } from 'src/app/models/inventory-upload-status';

export interface InventoryState extends EntityState<InventoryItem> {
  status: 'pending' | 'loading' | 'success' | 'error';
  error: any;
  uploadStatus: InventoryUploadStatus[];
}

export const inventoryAdapter: EntityAdapter<InventoryItem> = createEntityAdapter<InventoryItem>({
  selectId: (item: InventoryItem) => `${item.barcode}/${item.labeleddate}`,
});

export const initialState: InventoryState = inventoryAdapter.getInitialState({
  status: 'pending',
  error: null,
  uploadStatus: [],
});

export const inventoryReducer = createReducer(
  initialState,
  on(InventoryActions.loadInventory, (state): InventoryState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(InventoryActions.loadInventorySuccess, (state, { inventory }): InventoryState =>
    inventoryAdapter.setAll(inventory, { ...state, status: 'success', error: null })
  ),
  on(InventoryActions.loadInventoryFailure, (state, { error }): InventoryState => ({
    ...state,
    status: 'error',
    error: error,
  })),
  on(InventoryActions.deleteInventory, (state): InventoryState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(InventoryActions.deleteInventorySuccess, (state, { barcode, labeldate }): InventoryState =>
    inventoryAdapter.removeOne(`${barcode}/${labeldate}`, { ...state, status: 'success', error: null })
  ),
  on(InventoryActions.deleteInventoryFailure, (state, { error }): InventoryState => ({
    ...state,
    status: 'error',
    error: error,
  })),
  on(InventoryActions.addInventory, (state): InventoryState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(InventoryActions.addInventorySuccess, (state, { item }): InventoryState =>
    inventoryAdapter.addOne(item, { ...state, status: 'success', error: null })
  ),
  on(InventoryActions.addInventoryFailure, (state, { error }): InventoryState => ({
    ...state,
    status: 'error',
    error: error,
  })),
  on(InventoryActions.uploadInventory, (state): InventoryState => ({
    ...state,
    status: 'loading',
    error: null,
    uploadStatus: [],
  })),
  on(InventoryActions.uploadInventorySuccess, (state, { successfulUploads, failedUploads }): InventoryState => {
    const successfulItems = successfulUploads.map(s => ({ ...s, ...state.entities[`${s.barcode}/${s.labeldate}`] }));
    return inventoryAdapter.addMany(successfulItems as InventoryItem[], {
      ...state,
      status: 'success',
      error: null,
      uploadStatus: [...successfulUploads, ...failedUploads],
    });
  }
  ),
  on(InventoryActions.uploadInventoryFailure, (state, { error }): InventoryState => ({
    ...state,
    status: 'error',
    error: error,
  }))
);
