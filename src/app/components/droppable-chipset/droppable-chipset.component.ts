import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-droppable-chipset',
  templateUrl: './droppable-chipset.component.html',
  styleUrls: ['./droppable-chipset.component.css']
})
export class DroppableChipsetComponent {
  droppedItems: string[] = [];

  onItemDropped(event: CdkDragDrop<string[]>) {
    console.log('onItemDropped called')
    if (event.previousContainer !== event.container) {
      // Item dropped in a different container
      this.droppedItems.push(event.item.data);
      event.item.data = '';
    }
  }
}
