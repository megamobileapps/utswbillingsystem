import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldItemsSummaryComponent } from './sold-items-summary.component';

describe('SoldItemsSummaryComponent', () => {
  let component: SoldItemsSummaryComponent;
  let fixture: ComponentFixture<SoldItemsSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SoldItemsSummaryComponent]
    });
    fixture = TestBed.createComponent(SoldItemsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
