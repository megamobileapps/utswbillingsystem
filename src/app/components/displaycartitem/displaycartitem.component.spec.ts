import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaycartitemComponent } from './displaycartitem.component';

describe('DisplaycartitemComponent', () => {
  let component: DisplaycartitemComponent;
  let fixture: ComponentFixture<DisplaycartitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaycartitemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplaycartitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
