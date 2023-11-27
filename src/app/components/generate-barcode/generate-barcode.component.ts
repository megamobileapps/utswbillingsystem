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
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatSelectionListChange } from '@angular/material/list';



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
  addOnBlur = true;
  readonly separatorKeysCodes =  [ENTER, COMMA] as const;
  search : string ="";
  newlyaddeditem:string="";

  //Filtered Items from search function or when a level item is pushed in the current Barcode generator
  filteredItems1:Array<string[]>=[[],[],[],[],[]];

  // This is the list used in barcode level in UI for the current barcode values
  done:Array<string[]> = [[],[],[],[],[]];
  relationshipholder:Array<string[]> = [[],[],[],[],[]];

  // These the barcode parts and can be added by add function in UI
  barcodeparts: Array<string[]> = [['Item 14-L14','Item 15-L15', 'Item 16-L16', 'Item 17-L17', 'Item 18-L18'],
['21-21','22-22'],
[],
[],
[]
];
  
  // In past these were the label created get from db
  existingLabelList:Array<string[]>=[['11-11','21-21','31-31','41-41','51-51'],['12-12','22-22','32-32','42-42','52-52']];
  
  // reation is from child to parent so that it is easy to search in db later
  //levellabel->uplevel which are comma separated

  levelReationList:Array<Array<string[]>>=[
    // Level 1 is empty
    [],
    //Level 2
    [['21-21','11-11'],
    ['22-22','11-11'],
    ['23-23','11-11']],
    // Level 3
    [['31-31','21-21,22-22,23-23'],
    ['32-32','22-22'],
    ['33-33','23-23']],
    //Level 4
    [['41-41','31-31,32-32,33-33'],
    ['42-42','31-31'],
    ['43-43','31-31']],
    //Level 5
    [['51-51','41-41,42-42,43-43'],
    ['52-52','42-42'],
    ['53-53','43-43']],
  ]

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

  get_relationships_for_level(level=1){
    if(level <0 || level > this.levelReationList.length-1){
      alert('You are asking for out of range Level relationship')
      return [];
    }
    return this.levelReationList[level]
  }
  filter_from_relationaldata(currentLabel='',currentIndex=0){
    console.log('entered filter_from_relationaldata');
    if('' == currentLabel){
      // Get all data
      if(this.filteredItems1.length > (currentIndex+1) && 
          this.barcodeparts.length > (currentIndex+1) ) {
        this.filteredItems1[currentIndex+1] = this.barcodeparts[currentIndex+1]
      }
      
    }else {
      if(this.levelReationList.length > (currentIndex + 1)) {
        for(let levelIndex=0;levelIndex<this.levelReationList[ currentIndex + 1].length;levelIndex++){
          let splitted_data = this.levelReationList[ currentIndex + 1][levelIndex][1].split(',');
          let element_to_push_in_fltr = this.levelReationList[ currentIndex + 1][levelIndex][0];
          if ( splitted_data.includes(currentLabel) == true){
            if(this.filteredItems1.length > (currentIndex+1) ){
              this.filteredItems1[currentIndex+1].push(element_to_push_in_fltr);
            }
           
          }
        }
      }
    }
  }
  existingLabelSelectionChange(event:MatSelectionListChange){
    let selected = event.options.filter(o => o.selected).map(o => o.value);
    console.log('selected label is '+selected ) ;
    for(let i=0;i<selected.length;i++){
      console.log('existingLabelSelectionChange()'+i+' val:'+selected[i]);
      let v = selected[i]
      for ( let vi=0; vi<v.length;vi++){
        this.done[vi][0] = v[vi];
      }
    }
  }
  //existingRelationshipSelectionChange
  existingRelationshipSelectionChange(event:MatSelectionListChange, level=0){
    let selected = event.options.filter(o => o.selected).map(o => o.value);
    console.log('selected Relationship is '+selected ) ;
    if(selected[0].length !=2 ){
      alert('Wrong relationship data, chose another one');
      return;
    }
    if(level-1<0) {
      alert('Wrong relatiohship, index out of bound');
      return;
    }
    //reset
    for(let i =0;i<this.relationshipholder.length;i++){
      this.relationshipholder[i]=[];
    }
      let v:string = selected[0][0];
      this.relationshipholder[level]=[v];
      let rightside = selected[0][1].split(',');
      // this.relationshipholder[level-1]=[];
      for ( let vi=0; vi<rightside.length;vi++){
        let upleveldata = rightside[vi];
        this.relationshipholder[level-1].push(upleveldata);
      }
   
  }
  searchnow(index=0){
     console.log('Search now clicked');
     for ( let ind=0;ind<this.barcodeparts.length;ind++){
      this.filteredItems1[ind] = this.barcodeparts[ind].filter((value)=>value.includes(this.search));
      console.log('Filtered list is '+JSON.stringify(this.filteredItems1[ind]));
     }
  }

  addnow(index=0): void {
    const value = (this.newlyaddeditem || '').trim();

    // Add our keyword
    if (value) {
      const vals = value.split('-');
      if (vals.length != 2){
        alert('Syntax is name-code of two letters');
        
      }else {
        let ins_val = {'name':vals[0], 'value':vals[1]}
        // this.keywords.push(ins_val);
        // this.levellist.push(value)
        if (index > this.barcodeparts.length-1){
          let tempindex=0;
          while(index > (this.barcodeparts.length-1 + tempindex)){
            this.barcodeparts.push([]);
            tempindex += 1;
          }
        }
        this.barcodeparts[index].push(value)
      }
    }

    this.newlyaddeditem='';
  }

  // show label
  getSelectedLabel(){
    this.label="";
    for(let i =0;i<this.done.length;i++){
      let labelArray = this.done[i].map(val=>val.split('-')[1]);      
      for(let i=0;i<labelArray.length;i++){
        this.label += labelArray[i]?labelArray[i]+"-":""
      } 
      
    }
    if(this.label.length>0){
      this.label = this.label.slice(0,-1)
    }
    // window.JsBarcode("#code128", label);
    return this.label;
  }
  savebarcode(){
    console.log('savebarcode clicked');
    let finalLevelComponentsArray=[];
    for(let i =0;i<this.done.length;i++){
     
      if(this.done[i].length>1 || this.done[i].length==0) {
        alert('You can have only one Barcode component per Level');
        return;
      }
      for(let j=0;j<this.done[i].length;j++){
        finalLevelComponentsArray.push(this.done[i][j]?this.done[i][j]+"-":"")
      } 
      
    }
    
    this.existingLabelList.push(finalLevelComponentsArray);
  }
  resetbarcode(){
    console.log('resetbarcode clicked');
    for(let i =0;i<this.done.length;i++){
      this.done[i]=[];
    }
  }

  saverelationship(){
    console.log('saverelatiohship clicked');
    let finalLevelComponentsArray=[];
    let child='';
    let childlevel=-1;
    let isDone=false;
    for(let i = this.relationshipholder.length-1;i >= 0 && isDone==false ;i--){
     
      if(this.relationshipholder[i].length==1) {
        // found child
        child = this.relationshipholder[i][0];
        childlevel=i;
        for(let j=0;j<this.relationshipholder[i-1].length;j++){
          finalLevelComponentsArray.push(this.relationshipholder[i-1][j]?this.relationshipholder[i-1][j]:"")
        }
        isDone = true;
      }
    }
    if(isDone == true && child != '' && finalLevelComponentsArray.length > 0) {
      let parent_joined = finalLevelComponentsArray.join(',');
      this.levelReationList[childlevel].push([child,parent_joined]);
    }else {
      alert('Relationship not properly created');
      return;
    }
    
    
  }
  resetrelationship(){
    console.log('resetrelationship clicked');
    for(let i =0;i<this.relationshipholder.length;i++){
      this.relationshipholder[i]=[];
    }
  }
  
 
  main_drop(event: CdkDragDrop<string[]>, index=0) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      let datavalue=event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.filter_from_relationaldata(datavalue,index)
    }
  }

  drop2(event: CdkDragDrop<string[]>, index=0) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      // this.filter_from_relationaldata(event.previousContainer.data[event.previousIndex],event.currentIndex)
    }
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

  


}
