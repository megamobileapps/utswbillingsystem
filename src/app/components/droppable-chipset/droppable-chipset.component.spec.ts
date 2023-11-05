import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroppableChipsetComponent } from './droppable-chipset.component';

describe('DroppableChipsetComponent', () => {
  let component: DroppableChipsetComponent;
  let fixture: ComponentFixture<DroppableChipsetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DroppableChipsetComponent]
    });
    fixture = TestBed.createComponent(DroppableChipsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
