import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Barcode } from './barcode.actions';
import * as BarcodeActions from './barcode.actions';

export interface BarcodeState extends EntityState<Barcode> {
  status: 'pending' | 'loading' | 'success' | 'error';
  error: any;
}

export const barcodeAdapter: EntityAdapter<Barcode> = createEntityAdapter<Barcode>({
  selectId: (barcode: Barcode) => barcode.id,
});

export const initialState: BarcodeState = barcodeAdapter.getInitialState({
  status: 'pending',
  error: null,
});

export const barcodeReducer = createReducer(
  initialState,
  on(BarcodeActions.loadBarcodes, (state): BarcodeState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(BarcodeActions.loadBarcodesSuccess, (state, { barcodes }): BarcodeState =>
    barcodeAdapter.setAll(barcodes, { ...state, status: 'success', error: null })
  ),
  on(BarcodeActions.loadBarcodesFailure, (state, { error }): BarcodeState => ({
    ...state,
    status: 'error',
    error: error,
  }))
);
