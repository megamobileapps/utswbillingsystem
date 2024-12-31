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
import { SaleservicesService } from 'src/app/services/saleservices.service';
import { BarcodeService } from 'src/app/services/barcode.service';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from "xlsx";
import { MatSelectChange } from '@angular/material/select';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';


export interface CodeKeyWords {
  name:string;
  value:string;
};

interface barCodeStore {
  id:string;
  key:string;
  labeltype:string;
  data:string[];
};

interface barcodePartStore{
  id:string;
  key:string;
  component:string;
  level:number;
};

@Component({
  selector: 'app-generate-barcode',
  templateUrl: './generate-barcode.component.html',
  styleUrls: ['./generate-barcode.component.css']
})

export class GenerateBarcodeComponent {

  maxLevelOfSelection:number=8;
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
  searchlabel:string='';
  searchProductlabel:string='';
  newlyaddeditem:string="";
  newlyaddedProdId:string="";

  //Filtered Items from search function or when a level item is pushed in the current Barcode generator
  filteredItems1:Array<barcodePartStore[]>=[[],[],[],[],[],[],[],[],[]];
  filteredLabels:Array<barCodeStore>=[];
  filteredProductLabels:Array<barCodeStore>=[];
  selectedProductCode:string='';
  // This is the list used in barcode level in UI for the current barcode values
  done:Array<barcodePartStore[]> = [[],[],[],[],[],[],[],[],[]];
  relationshipholder:Array<barcodePartStore[]> = [[],[],[],[],[],[],[]];
  levelList = [0,1,2,3,4,5,6,7,8];
  kay_value_separator ='###'
  levelnames = ['Category', 'Sub Category','Material','Clr','Design','quantity per packet','Size','Brand','Special']

  // These the barcode parts and can be added by add function in UI
  barcodeparts: Array<barcodePartStore[]> = [[{"id":"1", "key":"1", "level":1, "component":'Item 14-L14'}],
[{"id":"2", "key":"2", "level":2, "component":'21-21'}],
[],
[],
[],
[],
[],
[],
[]
];
  

  // In past these were the label created get from db
  existingLabelList:Array<barCodeStore>=[{"id":"1","key":"1", "labeltype":"utsw","data":['11-11','21-21','31-31','41-41','51-51']},
  {"id":"2","key":"2", "labeltype":"utsw","data":['12-12','22-22','32-32','42-42','52-52']}];
  existingProductLabelList:Array<barCodeStore>=[];
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
    [['61-61','51-51,52-52,53-53'],
    ['62-62','52-52'],
    ['63-63','63-63']],
    [['71-71','61-61,62-62,63-63'],
    ['72-72','72-72'],
    ['73-73','63-63']],
    [['71-71','61-61,62-62,63-63'],
    ['72-72','72-72'],
    ['73-73','63-63']],
    [['71-71','61-61,62-62,63-63'],
    ['72-72','72-72'],
    ['73-73','63-63']],
  ]

  constructor(private http: HttpClient,
    private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private screenSizeService:ScreenSizeService,    
    private searchstrfltr:UtswGenericfilterPipe, 
    private saleService: SaleservicesService,
    
    private barcodeService:BarcodeService, private dialog: MatDialog) {
      for(let i=0;i<this.maxLevelOfSelection;i++){
        this.searchDataInput.push(new Subject<string>())
      }
  }

  prepareLabelFromDataArray(data:any[], labeltype:string="utsw"){
    
    let map1 =  data.map((val)=>{
      if (labeltype == 'product') {
        return val;
      }else{
        if (typeof val != 'string'){
          
          console.log('prepareLabelFromDataArray value is not string.. very strange '+JSON.stringify(val));
          return val.component.split(this.kay_value_separator)[1];
        }
        return val.split(this.kay_value_separator)[1];
      }
    });
    return map1.join('');
  }
  openDialogForDeleteConfirmation(event:any, item:barCodeStore, labeltype="utsw") {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
      data:{
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Delete',
          cancel: 'Cancel'
        }
      }
    });
    

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {  
        // Clicked on delete
        console.log('Clicked on confirmed');   
        if(labeltype == "product"){
          this.barcodeService.deleteBarcode(item).then((res) => {
            console.log('openDialogForDeleteConfirmation: ',res);    
            alert('Successfully deleted');
          })
          .catch((err) => {
            console.log('openDialogForDeleteConfirmation error: ' + err);
            alert('Error while openDialogForDeleteConfirmation');        
          });
        }else if (labeltype =="utsw") {
          this.barcodeService.deleteBarcode(item).then((res) => {
            console.log('openDialogForDeleteConfirmation: ',res);    
            alert('Successfully deleted');
          })
          .catch((err) => {
            console.log('openDialogForDeleteConfirmation error: ' + err);
            alert('Error while openDialogForDeleteConfirmation');        
          });
      }
        
      }else {
        // Cancelled
        console.log('Cancelled click')
      }
    });
  }

  openDialogForDeletePartConfirmation(event:any, item:barcodePartStore) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
      data:{
        message: 'Are you sure want to delete ?',
        buttonText: {
          ok: 'Delete',
          cancel: 'Cancel'
        }
      }
    });
    

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {  
        // Clicked on delete
        console.log('Clicked on confirmed');      
        this.barcodeService.deleteBarcodecomponentAtLevel(item).then((res) => {
          console.log('openDialogForDeleteConfirmation: ',res);    
          alert('Successfully deleted');
        })
        .catch((err) => {
          console.log('openDialogForDeleteConfirmation error: ' + err);
          alert('Error while openDialogForDeleteConfirmation');        
        });
        
      }else {
        // Cancelled
        console.log('Cancelled click')
      }
    });
  }

  revmoveChip(event:any, item:any){
    console.log('removeChip called in generate barcode component '+JSON.stringify(item));
    // event.stopPropagation();
  }
  get_relationships_for_level(level=1){
    if(level <0 || level > this.levelReationList.length-1){
      console.log(`Query for Level ${level+1} Existing levels ${this.levelReationList.length} You are asking for out of range Level relationship`)
      return [];
    }
    return this.levelReationList[level]
  }

  // provide barcodepartstore.component value and return back the barcodepartstore from 
  // db values retrieved at the time of start

  filterBarcodecomponent(component_value:any, level:number=0):barcodePartStore[]{
    if (typeof component_value == 'string')
      return this.barcodeparts[level].filter(value=>value.component==component_value);
    else 
      return this.barcodeparts[level].filter(value=>value.component==component_value.component);
  }

  filter_from_relationaldata(currentLabel:string|null=null,currentIndex=0){
    console.log('entered filter_from_relationaldata');
    let real_this = this;
    if(null == currentLabel){
      // Get all data
      if(this.filteredItems1.length > (currentIndex+1) && 
          this.barcodeparts.length > (currentIndex+1) ) {
        this.filteredItems1[currentIndex+1] = this.barcodeparts[currentIndex+1]
      }
      
    }else {
      if(this.levelReationList.length >= (currentIndex + 1)) {
        
        for(let levelIndex=0;levelIndex<this.levelReationList[ currentIndex ].length;levelIndex++){
          let parent = '';
          let children_value = '';
          let splitted_data = this.levelReationList[ currentIndex ][levelIndex][1].split(','); // children
          let element_to_push_in_fltr = this.levelReationList[ currentIndex ][levelIndex][0]; // parent

          if (element_to_push_in_fltr == currentLabel) {
            splitted_data.forEach((child_val, child_index)=> {
              real_this.filterBarcodecomponent(child_val, child_index).forEach(val => 
                this.filteredItems1[currentIndex+1].push(val)
                )              
            });            
          }
          // if ( splitted_data.includes(currentLabel) == true){
          //   if(this.filteredItems1.length > (currentIndex+1) ){
          //     this.filteredItems1[currentIndex+1].push(element_to_push_in_fltr);
          //   }
           
          // }
        }
      }
    }
  }

  
  existingLabelSelectionChange(event:MatSelectionListChange){
    let selected = event.options.filter(o => o.selected).map(o => o.value);
    console.log('selected label is '+JSON.stringify(selected )) ;
    for(let i=0;i<selected.length;i++){
      console.log('existingLabelSelectionChange() at index='+i+' val:'+JSON.stringify(selected[i]));
      let v = selected[i]
      for ( let vi=0; vi<v.data.length;vi++){
        console.log("existingLabelSelectionChange() "+v.data[vi])

        // search in level data for this component match
        this.filterBarcodecomponent(v.data[vi], vi)
            .forEach(val=>this.done[vi][0]=val)
        this.selectedProductCode='';
        // this.done[vi][0] = v.data[vi];
      }
      if (v.data.length < this.done.length) {
        for(let x=v.data.length; x< this.done.length; x++) {
          this.done[x]=[]
        }
      }
    }
  }

  existingProductLabelSelectionChange(event:MatSelectionListChange){
    let selected = event.options.filter(o => o.selected).map(o => o.value);
    console.log('selected Product label is '+JSON.stringify(selected )) ;
    for(let i=0;i<selected.length;i++){
      console.log('existingLabelSelectionChange() at index='+i+' val:'+JSON.stringify(selected[i]));
      let v = selected[i]
      for ( let vi=0; vi<v.data.length;vi++){
        console.log("existingLabelSelectionChange() "+v.data[vi])
        this.selectedProductCode = v.data[vi];
        
      }
      this.resetbarcode()
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
    if(level<0 || level+1>this.maxLevelOfSelection) {
      alert('Wrong relatiohship, index out of bound');
      return;
    }
    //reset
    for(let i =0;i<this.relationshipholder.length;i++){
      this.relationshipholder[i]=[];
    }
      let v:string = selected[0][0];
      // search in barcode parts for this component from relationship
      //
      this.filterBarcodecomponent(v, level).forEach(val=>this.relationshipholder[level].push(val))
      // this.relationshipholder[level]=[v];
      let rightside = selected[0][1].split(',');
      // this.relationshipholder[level-1]=[];
      for ( let vi=0; vi<rightside.length;vi++){
        let upleveldata = rightside[vi];
        this.filterBarcodecomponent(upleveldata, level+1).forEach(val=>this.relationshipholder[level+1].push(val))
        // this.relationshipholder[level+1].push(upleveldata);
      }
   
  }
  searchnow(index=0){
     console.log('Search now clicked');
     for ( let ind=0;ind<this.barcodeparts.length;ind++){
      this.filteredItems1[ind] = this.barcodeparts[ind].filter((value)=>value.component.toLowerCase().includes(this.search.toLowerCase()));
      console.log('Filtered list is '+JSON.stringify(this.filteredItems1[ind]));
     }
  }

  // prepareLabelFromArray(name_value_array:string[]){
  //   var retVal ='';
  //   name_value_array.forEach(val=>{ 
  //     retVal = retVal + (val.split(this.kay_value_separator)[1]);
  //   });
  //   return retVal;
  // }
  searchexistinglabel(searchfor=''){
    if (searchfor =='') {
      searchfor = this.searchlabel;
    }
    console.log('Searchexistinglabel now clicked');
    this.filteredLabels = this.existingLabelList.filter((value)=> {
                          let label = this.prepareLabelFromDataArray(value.data)
                          return label.toLowerCase().includes(searchfor.toLowerCase())
                      });
     console.log('Filtered Label list is '+JSON.stringify(this.filteredLabels));
     return this.filteredLabels;
   
 }
 //existingProductLabelList
 searchexistingProductlabel(searchfor=''){
  if (searchfor =='') {
    searchfor = this.searchProductlabel;
  }
  console.log('Searchexistinglabel now clicked');
  this.filteredProductLabels = this.existingProductLabelList.filter((value)=> {
                        if(value.labeltype == 'product') {                        
                          let label = this.prepareLabelFromDataArray(value.data, value.labeltype)
                          return label.toLowerCase().includes(searchfor.toLowerCase())
                        }
                        return false;
                    });
   console.log('Filtered Product Label list is '+JSON.stringify(this.filteredProductLabels));
   return this.filteredProductLabels;
 
}

  // get all levels static data from db
  //
  getAllBarcodeComponents(){
    let self = this;
     this.barcodeService.getAllBarcodecomponentAtLevel().subscribe(data => { 
       console.log('getAllBarcodeComponents(): step 1:', JSON.stringify(data));
       //this.barcodeparts[index].push(value)
       self.barcodeparts=[[]];
       for(let i=0;i<data.length;i++){
         console.log('getAllBarcodeComponents(): step 2:', JSON.stringify(data[i]));
         
           if(typeof self.barcodeparts[data[i].level] === 'undefined' ) {
             for(let leveli = 0; leveli < data[i].level+1; leveli++){
               if(typeof self.barcodeparts[leveli] === 'undefined' ) {
                 this.barcodeparts[ leveli ]=[];
             }
           }
         }
         let levelVal:string = data[i].component||'';
         console.log('value prepared for level '+data[i].level+' is ', levelVal)
         self.barcodeparts[data[i].level].push( data[i] )
         
        //  console.log('getAllBarcodeComponents() all keys:', JSON.stringify(keys));
         }
         console.log('getAllBarcodeComponents(): Data after filling ', JSON.stringify(self.barcodeparts));
       
     });
   }

  addnow(index=0): void {
    const value = (this.newlyaddeditem || '').trim();

    // Add our keyword
    if (value) {
      const vals = value.split(this.kay_value_separator);
      if (vals.length != 2){
        alert('Syntax is name###code of two letters');
        
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
        // check if name_value pair already exists or not
        let old_value = this.barcodeparts[index].find(x => x.component.toLowerCase() == value.toLowerCase());
        // check if this is the new code otherwise alert
        let old_value_code = this.barcodeparts[index].find(x => x.component.split(this.kay_value_separator)[1].toLowerCase() == value.split(this.kay_value_separator)[1].toLowerCase());
        if(typeof old_value_code != 'undefined'){
          alert('Code is already in use.  Create new code. Code='+value.split(this.kay_value_separator)[1]);
          return;
        }
        if (typeof old_value == 'undefined') {
          // this.barcodeparts[index].push(value);
          this.barcodeService.addBarcodecomponentAtLevel({level:index, component:value}).then((res) => {
            console.log('addnow: ',res);        
          })
          .catch((err) => {
            console.log('addnow error: ' + err);
            alert('Error while addnow');        
          });
        }else {
          alert('This value already exists in Level.  Input non-existing name_value pair')
        }
      }
    }

    this.newlyaddeditem='';
  }

  //addnewProductId
  // uses searchexistingProductlabel

  addnewProductId(index=0): void {
    const value = (this.newlyaddedProdId || '').trim();

    if (value) {
        let old_value_code = this.existingProductLabelList.find(x => x.data[0].toLowerCase() == value.toLowerCase());
        if(typeof old_value_code != 'undefined'){
          alert('Code is already in use.  Create new ProductId code. Code='+value);
          return;
        }
        if (typeof old_value_code == 'undefined') {
          // this.barcodeparts[index].push(value);
          this.barcodeService.addBarcode({labeltype:'product',bar_code:[value]}).then((res) => {
            console.log('addnewProductId: ',res);        
          })
          .catch((err) => {
            console.log('addnewProductId error: ' + err);
            alert('Error while addnewProductId');        
          });
        }
    }

    this.newlyaddedProdId='';
  }

  // show label
  getSelectedLabel(){
    this.label="";
    if (this.selectedProductCode != null && this.selectedProductCode != '' ) {
      return this.selectedProductCode;
    }else {
      for(let i =0;i<this.done.length;i++){
        let labelArray = this.done[i].map(val=>val.component.split(this.kay_value_separator)[1]);      
        for(let i=0;i<labelArray.length;i++){
          // this.label += labelArray[i]?labelArray[i]+"-":""
          this.label += labelArray[i]?labelArray[i]:""
        } 
        
      }
     
      return this.label;
  }
  }

  //labeltype can be [utsw|product]
  getAllBarcodes(){
    let self = this;
     this.barcodeService.getAllBarcode().subscribe(data => { 
       console.log('getAllBarcodes(): step 1', JSON.stringify(data));
       self.existingLabelList=[];
       self.existingProductLabelList=[];
       for(let i=0;i<data.length;i++){
         console.log('getAllBarcodes(): step 2', JSON.stringify(data[i]));
         if(typeof data[i].labeltype !== 'undefined' && data[i].labeltype == 'product') {
          self.existingProductLabelList.push( {"id":data[i].id,"key":data[i].key,  "labeltype":data[i].labeltype,"data":data[i].bar_code} );        
         }else {         
          self.existingLabelList.push( {"id":data[i].id,"key":data[i].key,  "labeltype":data[i].labeltype??"utsw","data":data[i].bar_code} );        
         }
        }
        self.existingLabelList.sort((a,b)=>self.prepareLabelFromDataArray(a.data).localeCompare(self.prepareLabelFromDataArray(b.data)))
        self.existingProductLabelList.sort((a,b)=>self.prepareLabelFromDataArray(a.data,"product").localeCompare(self.prepareLabelFromDataArray(b.data,"product")))
        console.log('getAllBarcodes(): UTSW label Data after filling ', JSON.stringify(self.existingLabelList));
        console.log('getAllBarcodes(): Product label Data after filling ', JSON.stringify(self.existingProductLabelList));
       
     });
   }

   // Delete selected barcode
   onBarCodeDeleteAction(event:any, item:barCodeStore) {
    console.log('onBarCodeDeleteAction() called'+JSON.stringify(item))
    event.stopPropagation();
   }

   //labeltype can be [utsw|product]
   //
  savebarcode(labeltype:string="utsw"){
    console.log('savebarcode clicked');
    let finalLevelComponentsArray=[];
    let dataForDBStore=[];
    for(let i =0;i<this.done.length;i++){
     
      if(this.done[i].length>1 || this.done[i].length==0) {
        alert('You can have only one Barcode component per Level.  Remove extras from level '+(i+1));
        return;
      }
      for(let j=0;j<this.done[i].length;j++){
        finalLevelComponentsArray.push(this.done[i][j]?this.done[i][j].component.split(this.kay_value_separator)[1]:"");
        dataForDBStore.push(this.done[i][j] && this.done[i][j].component?this.done[i][j].component:'');
      } 
      
    } 
    
    // check if this barcode already exists
    // if exists then alert with error else save
    let searchedResult = this.searchexistinglabel(finalLevelComponentsArray.join(''));
    if (searchedResult.length > 0) {
      alert('This label already exists.. check filtered list');
    }else {
      // this.existingLabelList.push(dataForDBStore);
      
      // Push data in db as well
      this.barcodeService.addBarcode({bar_code:dataForDBStore, labeltype:labeltype}).then((res) => {
        console.log('savebarcode: ',res);        
      })
      .catch((err) => {
        console.log('savebarcode error: ' + err);
        alert('Error while savebarcode');        
      });
    }
  }
  resetbarcode(){
    console.log('resetbarcode clicked');
    for(let i =0;i<this.done.length;i++){
      this.done[i]=[];
    }
  }

  getAllRelationships(){
   let self = this;
    this.barcodeService.getAllBarcodeRelationship().subscribe(data => { 
      console.log('getAllRelationships():', JSON.stringify(data));
      self.levelReationList=[[]];
      for(let i=0;i<data.length;i++){
        console.log('getAllRelationships():', JSON.stringify(data[i]));
        let keys = Object.keys(data[i]);
        keys.forEach(key=>{
          if(typeof self.levelReationList[data[i][key].level] === 'undefined' ) {
            for(let leveli = 0; leveli < data[i][key].level+1; leveli++){
              if(typeof self.levelReationList[leveli] === 'undefined' ) {
                this.levelReationList[leveli]=[];
            }
          }
        }
        let levelVal:string[] = [ data[i][key].parent_value||'' , data[i][key].children_value||''];
        console.log('value prepared for level '+data[i][key].level+' is ', levelVal)
        self.levelReationList[data[i][key].level].push( levelVal )
        })
        console.log('getAllRelationships() all keys:', JSON.stringify(keys));
        }
        console.log('getAllRelationships(): Data after filling ', JSON.stringify(self.levelReationList));
      
    });
  }
  saverelationship(){
    console.log('saverelatiohship clicked');
    let finalLevelComponentsArray=[];
    let child='';
    let parent='';
    let childlevel=-1;
    let parentlevel = -1;
    let isDone=false;
    for(let i = this.relationshipholder.length-1;i >= 0 && isDone==false ;i--){
     
      if(this.relationshipholder[i].length>=1) {
        // found children
        parentlevel=i-1;
        parent = this.relationshipholder[i-1][0].component; //parent will be one level up
        childlevel=i;
        
        for(let j=0;j<this.relationshipholder[i].length;j++){
          //get all children list
          finalLevelComponentsArray.push(this.relationshipholder[i][j]?this.relationshipholder[i][j]:"")
        }
        isDone = true;
      }
    }
    if(isDone == true && parent != '' && finalLevelComponentsArray.length > 0) {
      let children_joined = finalLevelComponentsArray.join(',');
      this.levelReationList[parentlevel].push([parent,children_joined]);

      // Push data in db as well
      this.barcodeService.addBarcodeRelationship({level:parentlevel,children_value:children_joined, parent_value:parent}).then((res) => {
        console.log('saverelationship: ',res);        
      })
      .catch((err) => {
        console.log('saverelationship error: ' + err);
        alert('Error while saverelationship');        
      });
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
  
 
  main_drop(event: CdkDragDrop<any[]>, index=0) {
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
      if (typeof datavalue == 'string')
        this.filter_from_relationaldata(datavalue,index);
      else
        this.filter_from_relationaldata(datavalue.component,index);
    }
  }

  drop2(event: CdkDragDrop<barcodePartStore[]>, index=0) {
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
    this.getAllBarcodeComponents();
    this.getAllBarcodes();
    this.getAllRelationships();
    this._dataService.getOfficeRates().subscribe((d) => { 
      this.catalogueItems = d; 
      console.log(d);
      
      this.getCategories(); 
      this.getPOSData();  
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

  allorigPosInvoiceDataList:Array<any>=[]; 
  posInvoicesRaised={};

  getPOSData(){
    this.saleService.getAllIPOSInvoices().subscribe( posinvdata => {
      console.log("getAllIPOSInvoices data recdeived "+JSON.stringify(posinvdata));
      this.allorigPosInvoiceDataList = posinvdata;
      // massage it to use in our form

      //console.log("type of object"+(type of posinvdata));
      for (let key in posinvdata){
        console.log( 'getPOSData()', key + ": " + posinvdata[key]);
      }
    
      posinvdata.forEach(posinvdataItem => {
          let invoiceno = posinvdataItem.invoiceno;
          let id = posinvdataItem.id;
          // this.posInvoicesRaised[id.trim().toLowerCase()] = posinvdataItem;         
        });// foreach
     
    });
  }

  levelSelectedToUploadFile=0
  onxlsxFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length > 1) {
      alert('Multiple files are not allowed');
      return;
    }
    else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        let data:Array<Array<string>> = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
        // Print the Excel Data
        console.log(data);

        // first line of data is the header part
        let data_to_push = new Map<string, string>();
        for(let csvIndex=1;csvIndex<data.length; csvIndex++){
          if(typeof data[csvIndex][0] === 'undefined' ||  data[csvIndex][0] == '' || typeof data[csvIndex][1] === 'undefined' || data[csvIndex][1] == '') {
            continue;
          }
          let value = `${data[csvIndex][0]}-${data[csvIndex][1]}`;
          console.log(`onxlsxFileChange() level ${this.levelSelectedToUploadFile} value ${value}`);
          if (this.levelSelectedToUploadFile > this.maxLevelOfSelection || this.levelSelectedToUploadFile <0 || typeof value === 'undefined' || value =='' ){
            continue;
          }else {
            if(data[csvIndex][0] != '' && data[csvIndex][1] != '' && data_to_push.has( data[csvIndex][0]) == false  ) {
              data_to_push.set(data[csvIndex][0], data[csvIndex][1]);
            }
          }
        }
        console.log('data to push to db for level is '+data_to_push.values())
        data_to_push.forEach((m_value, m_key)=>{
          if(typeof this.barcodeparts[this.levelSelectedToUploadFile] === 'undefined' ) {
              for(let leveli = 0; leveli < this.levelSelectedToUploadFile+1; leveli++){
                if(typeof this.barcodeparts[leveli] === 'undefined' ) {
                  this.barcodeparts[ leveli ]=[];
              }
            }
          }
          let value = `${m_key}${this.kay_value_separator}${m_value}`;
          // this.barcodeparts[this.levelSelectedToUploadFile].push(value);
          this.barcodeService.addBarcodecomponentAtLevel({level:this.levelSelectedToUploadFile, component:value}).then((res) => {
            console.log('onxlsxFileChange: ',res);        
          })
          .catch((err) => {
            console.log('onxlsxFileChange error: ' + err);
            alert('Error while onxlsxFileChange');        
          });
        });

      }
      reader.readAsBinaryString(target.files[0]);
    }
  }
  leveldatachanged(event:MatSelectChange){
   console.log('leveldatachange() event value='+event.value);
   this.levelSelectedToUploadFile = event.value;
  }

}
