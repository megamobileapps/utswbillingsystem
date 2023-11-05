import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableChipsetComponent } from './draggable-chipset.component';

describe('DraggableChipsetComponent', () => {
  let component: DraggableChipsetComponent;
  let fixture: ComponentFixture<DraggableChipsetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DraggableChipsetComponent]
    });
    fixture = TestBed.createComponent(DraggableChipsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
