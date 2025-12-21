import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredBillsDialogComponent } from './filtered-bills-dialog.component';

describe('FilteredBillsDialogComponent', () => {
  let component: FilteredBillsDialogComponent;
  let fixture: ComponentFixture<FilteredBillsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilteredBillsDialogComponent]
    });
    fixture = TestBed.createComponent(FilteredBillsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
