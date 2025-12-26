import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { InventoryItem } from 'src/app/models/inoffice';
import * as InventoryActions from './inventory.actions';

export interface InventoryState extends EntityState<InventoryItem> {
  status: 'pending' | 'loading' | 'success' | 'error';
  error: any;
}

export const inventoryAdapter: EntityAdapter<InventoryItem> = createEntityAdapter<InventoryItem>({
  // Assuming 'barcode' is the unique identifier for an inventory item.
  // If not, this needs to be changed to the actual unique ID property.
  selectId: (item: InventoryItem) => item.barcode,
});

export const initialState: InventoryState = inventoryAdapter.getInitialState({
  status: 'pending',
  error: null,
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
  on(InventoryActions.deleteInventorySuccess, (state, { barcode }): InventoryState =>
    inventoryAdapter.removeOne(barcode, { ...state, status: 'success', error: null })
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
  }))
);
