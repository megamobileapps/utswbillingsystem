import { createFeatureSelector, createSelector } from '@ngrx/store';
import { inventoryAdapter, InventoryState } from './inventory.reducer';

export const selectInventoryState = createFeatureSelector<InventoryState>('inventory');

const { selectAll, selectEntities, selectIds, selectTotal } = inventoryAdapter.getSelectors();

export const selectAllInventory = createSelector(
  selectInventoryState,
  selectAll
);

export const selectInventoryEntities = createSelector(
  selectInventoryState,
  selectEntities
);

export const selectInventoryStatus = createSelector(
  selectInventoryState,
  (state: InventoryState) => state.status
);

export const selectInventoryError = createSelector(
  selectInventoryState,
  (state: InventoryState) => state.error
);
