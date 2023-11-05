import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {LiveAnnouncer} from '@angular/cdk/a11y';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, catchError, concat, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap, throwError } from 'rxjs';
import { InOfficeCat, InOfficePrice } from 'src/app/models/inoffice';
import { UtswGenericfilterPipe } from 'src/app/pipes/utswgenericfilter';
import { SearchStrfilterPipe } from 'src/app/pipes/utswsearchfilter';
import { CategoryfilterPipe } from 'src/app/pipes/utswtopicfilter';
import { DataService } from 'src/app/services/data.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import { genericFilterKey } from 'src/app/models/generic-filter-key';
import { MatChipInputEvent } from '@angular/material/chips';

export interface Vegetable {
  name: string;
};
export interface CodeKeyWords {
  name:string;
  value:string;
};

@Component({
  selector: 'app-generate-barcode',
  templateUrl: './generate-barcode.component.html',
  styleUrls: ['./generate-barcode.component.css']
})

export class GenerateBarcodeComponent {

  maxLevelOfSelection:number=3;
  selectedValue : Array<any>=[];
  minLengthTerm:number=2;
  dataLoading:boolean=false;
  searchDataInput:Array<Subject<string>> = [];//new Array(new Subject<string>());
  data:Observable<any>[]=[];//new Array(new Observable<any>()); 
  catalogueItems:Array<InOfficePrice>=[];
  categories:Array<InOfficeCat>=[];

  selectedCategories:Array<InOfficePrice>=[]
  levelWiseFieldName:Array<string>=['grade','gradelevel2','subId']
  showFieldInDD:string="subject"
  label=''

/* */
  vegetables: Vegetable[] = [
    {name: 'apple'},
    {name: 'banana'},
    {name: 'strawberry'},
    {name: 'orange'},
    {name: 'kiwi'},
    {name: 'cherry'},
  ];

  vegetablesDroppedTo:Vegetable[]=[];
  drop(event: CdkDragDrop<Vegetable[]>) {
    moveItemInArray(this.vegetables, event.previousIndex, event.currentIndex);
  }

  /* */

  /**** */

  draggableItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  droppedItems: string[] = ['Item 15', 'Item 16', 'Item 17', 'Item 18'];
  droppedItems2: string[] = ['Item 25', 'Item 26', 'Item 27', 'Item 28'];
 
  drop2(event: CdkDragDrop<string[]>) {
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

  drop3(event: CdkDragDrop<CodeKeyWords[]>) {
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
  /**** */
  keywords:Array<CodeKeyWords> = [{'name':'angular', 'value':'AN'}, {'name':'how-to', 'value':'HO'}, {'name':'tutorial', 'value':'TU'}, 
  {'name':'accessibility','value':'AC'}];
  selectedKeywords:Array<CodeKeyWords>=[{'name':'angular', 'value':'AN'}]
  formControl = new FormControl(['angular']);

  announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: CodeKeyWords) {
    const index = this.keywords.indexOf(keyword);
    if (index >= 0) {
      this.keywords.splice(index, 1);

      this.announcer.announce(`removed ${keyword}`);
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      const vals = value.split('-');
      if (vals.length != 2){
        alert('Syntax is name-code of two letters');
        
      }else {
        let ins_val = {'name':vals[0], 'value':vals[1]}
        this.keywords.push(ins_val);
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }


  // data1:any[] = [{'name':'option1','value':'option1value1'},
  // {'name':'option2','value':'option1value2'},
  // {'name':'option2','value':'option1value2'}];

  // data:any[]=['option1val', 'option2val','option3val']
  constructor(private http: HttpClient,
    private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private screenSizeService:ScreenSizeService,
    
    private searchstrfltr:UtswGenericfilterPipe) {
      for(let i=0;i<this.maxLevelOfSelection;i++){
        this.searchDataInput.push(new Subject<string>())
      }
    }
  onSelect(index:number, e:any){
    console.log('onselect pressed with event='+JSON.stringify(e));
    console.log('selected value'+JSON.stringify(this.selectedValue));
    this.selectedCategories[index] = e;
  }

  addNew(index:number, e:any){
    console.log('addNew pressed with event='+JSON.stringify(e));
    console.log('addNew value'+JSON.stringify(this.selectedValue));
    this.selectedCategories[index] = e;
  }
  trackByFn(item:any){
    console.log('trackByFn received item='+JSON.stringify(item))
    return item.value;
  }

  ngOnInit() {
    this._dataService.getOfficeRates().subscribe((d) => { 
      this.catalogueItems = d; 
      console.log(d);
      this.getCategories();   
      for (let i=0;i<this.maxLevelOfSelection;i++){
        this.loadData(i);
      }    
    });
    
    
  }
  getCategories():void{
    this._dataService.getInofficeCategories().subscribe((d) => { 
      this.categories = d; 
      console.log(d);       
    });
  }
  loadData(indexOfSelectBox:number=0) {
    console.log(`loadData() called for index ${indexOfSelectBox}`)
    this.data[indexOfSelectBox] = concat(
      of([]), // default items
      this.searchDataInput[indexOfSelectBox]?
        this.searchDataInput[indexOfSelectBox]?.pipe(
          filter(res => {
            return res !== null && res.length >= this.minLengthTerm
          }),
          distinctUntilChanged(),
          debounceTime(800),
          tap(() => this.dataLoading = true),
          switchMap(term => {

            return this.getData(indexOfSelectBox, term).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.dataLoading = false)
            )
          })
        ):of(this.catalogueItems)
    );
  }

  getData(indexOfSelectBox:number, term:string=''):Observable<any> {
    //searchstrfilter
    let totalSpaceToSearch = this.catalogueItems;
    let fltr:genericFilterKey={fieldName:'grade',fieldValue:term}
    if(indexOfSelectBox>0) {
      
      for ( let i =0;i<=indexOfSelectBox;i++){
        fltr.fieldName = this.levelWiseFieldName[i]
        if (i==indexOfSelectBox) {
          fltr.fieldValue = term;
        }else {
          fltr.fieldValue = this.selectedCategories[i][this.levelWiseFieldName[i] as keyof InOfficePrice]?.toString()
        }
        console.log(`getData index=${i} filter=${JSON.stringify(fltr)} totalSpaceToSearch = ${JSON.stringify(totalSpaceToSearch)}`)
        totalSpaceToSearch = this.searchstrfltr.transform(totalSpaceToSearch, fltr) 
      }
    }
    return of(totalSpaceToSearch)
    
   
  }

  getSelectedLabel(){
    this.label="";
    for(let i=0;i<this.maxLevelOfSelection;i++){
      this.label += this.selectedCategories[i]?this.selectedCategories[i][this.levelWiseFieldName[i] as keyof InOfficePrice]+"-":""
    } 
    if(this.label.length>0){
      this.label = this.label.slice(0,-1)
    }
    // window.JsBarcode("#code128", label);
    return this.label;
  }

  clear() {
    console.log('Clear called')
    for(let i=0;i<this.maxLevelOfSelection;i++){
      delete(this.selectedCategories[i]);
    }
    this.label="";
  }
}
