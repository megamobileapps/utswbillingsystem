import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { BarcodeComponent } from './barcode-component.actions';
import * as BarcodeComponentActions from './barcode-component.actions';

export interface BarcodeComponentState extends EntityState<BarcodeComponent> {
  status: 'pending' | 'loading' | 'success' | 'error';
  error: any;
}

export const barcodeComponentAdapter: EntityAdapter<BarcodeComponent> = createEntityAdapter<BarcodeComponent>({
  selectId: (barcodeComponent: BarcodeComponent) => barcodeComponent.id,
});

export const initialState: BarcodeComponentState = barcodeComponentAdapter.getInitialState({
  status: 'pending',
  error: null,
});

export const barcodeComponentReducer = createReducer(
  initialState,
  on(BarcodeComponentActions.loadBarcodeComponents, (state): BarcodeComponentState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(BarcodeComponentActions.loadBarcodeComponentsSuccess, (state, { barcodeComponents }): BarcodeComponentState =>
    barcodeComponentAdapter.setAll(barcodeComponents, { ...state, status: 'success', error: null })
  ),
  on(BarcodeComponentActions.loadBarcodeComponentsFailure, (state, { error }): BarcodeComponentState => ({
    ...state,
    status: 'error',
    error: error,
  }))
);
