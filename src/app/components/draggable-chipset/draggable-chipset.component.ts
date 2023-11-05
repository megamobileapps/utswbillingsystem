import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

@Component({
  selector: 'app-draggable-chipset',
  templateUrl: './draggable-chipset.component.html',
  styleUrls: ['./draggable-chipset.component.css']
})
export class DraggableChipsetComponent {
  draggableItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  droppedItems: string[] = ['Item 5', 'Item 6', 'Item 7', 'Item 8'];

 
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
