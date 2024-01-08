import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectinvoiceComponent } from './directinvoice.component';

describe('DirectinvoiceComponent', () => {
  let component: DirectinvoiceComponent;
  let fixture: ComponentFixture<DirectinvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectinvoiceComponent]
    });
    fixture = TestBed.createComponent(DirectinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
