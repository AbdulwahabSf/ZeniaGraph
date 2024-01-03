import { LightningElement, api, track, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import similarCompanyList from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.similarCompanyList';
import saveLeads from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.saveLeads';
import displayContacts from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.displayContacts';
import showContacts from 'c/customModel';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class ZeniaComapnyRecords extends NavigationMixin(LightningElement) {
    
    fixedWidth = "width:15rem;";

    isLoading = false;
    @api recordId;
    @api listView;
    @api Env;
    @api leadIds;
    @track leadIdList;
    @track leads = [];
    @track data = [];
    graph_url = '';
    @track selectedRows = [];
    showError = false;
    showResponseTable = false;
    showTable = false;
    @track leadsData;
    @track contactData = [];
   currentPageReference = null; 
   showEmptyErr = false;
    @track pageNo = 1;
    @track pageSize = 10;
    @track searchable = [];

    @track sicOptions = [];
    @track naicOptions = [];
    @track industryOptions = [];
    @track vectorScoreOptions = [];

   @track selSIC = [];
   @track selNAICS = [];
   @track selIndustry = [];
   @track selVectorScore;
   
   @track vectorBwFrom;
   @track vectorBwTo;
   @track vectorFrom;

    operatorOptions = [
        { label: '--None--', value: '' },
        { label: 'Between', value: 'Between' },
        { label: 'Greater Than', value: 'Greater Than' },
        { label: 'Less Than', value: 'Less Than' },
        { label: 'Equal to', value: 'Equal to' },
        { label: 'Greater Than Equal To', value: 'Greater Than Equal To' },
        { label: 'Less Than Equal To', value: 'Less Than Equal To' }
    ];
    get tableData() {
        return this.searchable.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize);
    }
   get lastPage() {
       return Math.ceil(this.searchable.length / this.pageSize);
    }
     get disablePrev() {
        return this.pageNo == 1;
    }
      get disableNext() {
       return this.pageNo == Math.ceil(this.searchable.length / this.pageSize);
    }

    columns = [
        { label: 'Company', fieldName: 'Company' },
        { label: 'Contact Person', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Location', fieldName: 'City' },
        { label: 'Email', fieldName: 'Email', type: 'Email' },
        { label: 'Status', fieldName: 'Status' },
        // { label: 'DataSource', fieldName: 'Datasource__c' }
    ];

  @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference){
     if (currentPageReference.type === "standard__quickAction") {
      let quickActionPath = currentPageReference.attributes.apiName;
      let envValue = quickActionPath.split("zeniadev__")[1].split("_EnvSimilarity")[0]; 
       this.Env = envValue;
    }
    }
    
      get showVectorBetween() {
        return this.selVectorScore == 'Between';
    }

    get showVecotorRange() {
        return this.selVectorScore && this.selVectorScore != 'Between';
    }

    get showSimilarCompany() {
        return this.data.length > 0 && this.graph_url != '';
    }
    
     get displaySource() {
        return this.Env == 'graph' ? true : false;
    }

      get selSICCount() {
        return this.selSIC && this.selSIC.length > 0 ? ('(' + this.selSIC.length + ' selected)') : '';
    }

    get selIndustryCount(){
        return this.selIndustry && this.selIndustry.length > 0 ? ('(' + this.selIndustry.length + ' selected)') : '';

    }
     get selNAICSCount(){
        return this.selNAICS && this.selNAICS.length > 0 ? ('(' + this.selNAICS.length + ' selected)') : '';

    }

    connectedCallback() {
        setTimeout(() => {
            this.init();
        }, 1000);
    }

    init() {
        this.leadIdList = [];
        if (this.leadIds && this.leadIds.length > 0) {
            this.leadIdList = this.leadIds.split(',');
        } else if(this.recordId) {
            this.leadIdList.push(this.recordId);
        }

        if(this.leadIdList.length > 0) {
            this.initHandler();
        }
        else this.showError = true;
    }

    initHandler() {
        this.showResponseTable = false;
        this.showTable = false;

        similarCompanyList({ leadIds: this.leadIdList , Env : this.Env }).then(response => {
            try{
                         
                this.leads = response.Leads;
                this.leadsData = response.FilteredLeads;
                this.data = [];
            
                if(response && response.SimilarCompanyResponse) {

                          this.sicOptions.push({ label: '--None--', value: '' });
                          this.naicOptions.push({ label: '--None--', value: '' });
                          this.industryOptions.push({ label: '--None--', value: '' });
                          this.vectorScoreOptions.push({ label: '--None--', value: '' });
                       
                    let similarCompanyResponse = JSON.parse(response.SimilarCompanyResponse);
                    let leadNames = [];
                    this.leads.forEach(function (lead) {
                        leadNames.push(lead.Company);
                    });
  
                    if(similarCompanyResponse.data) {
                         let sicRecs = [], naicRecs = [], industryRecs = [], vectorRecs = [] ; 
                        this.data = similarCompanyResponse.data.getSimilarCompaniesByName[0].records;
                        this.graph_url = similarCompanyResponse.data.getSimilarCompaniesByName[0].graph_url;
                       
                        this.data.forEach(function (srcvalue) {
                            srcvalue.showUpdate = false;
                            srcvalue.id = '';
                            leadNames.forEach(function (leadName) {
                                if(leadName != srcvalue.name){
                                    srcvalue.showAdd = true;
                                } 
                            });
                             leadNames.forEach(function (leadName) {
                                 if(leadName == srcvalue.name) {
                                  srcvalue.showAdd = false;
                                }
                            });
                            srcvalue.hasContacts = true;

                        }); 
                        this.data.forEach((item, index) => {

                        let sicCodes = (item.SIC && item.SIC != '' ? item.SIC.split(',') : []);
                        sicCodes.forEach((item1) => {
                        if(item1 && item1 != '' && !sicRecs.includes(item1)) {
                            this.sicOptions.push({ label: item1, value: item1 });
                            sicRecs.push(item1);
                         }
                           });

                       let naicCodes = (item.NAICS && item.NAICS != '' ? item.NAICS.split(',') : []);
                          naicCodes.forEach((item1) => {
                         if(item1 && item1 != '' && !naicRecs.includes(item1)) {
                           this.naicOptions.push({ label: item1, value: item1 });
                           naicRecs.push(item1);
                        }    
                   });

                   let industries = (item.industry && item.industry != '' ? item.industry.split(',') : []);
                    industries.forEach((item1) => {
                       if(item1 && item1 != '' && !industryRecs.includes(item1)) {
                          this.industryOptions.push({ label: item1, value: item1 });
                            industryRecs.push(item1);
                       }
                  });
                  if(item.vector_score && item.vector_score != '' && !vectorRecs.includes(item.vector_score)) {
                         this.vectorScoreOptions.push({ label: item.vector_score , value: item.vector_score  });
                          vectorRecs.push(item.vector_score);
                     }
                     });
                    } 
                } 
                 this.searchable = [];

                this.data.forEach((item, index) => {
                  //  if (index < this.pageSize)
                        this.searchable.push(item);
                });


                if(this.data.length > 0) {
                     this.showResponseTable = true;
                     
                }else {
                    this.showEmptyErr = true;
                }

                if(this.leadIdList.length == 1){
                    this.showResponseTable = true;

                }else{ 
                    this.showTable = true;
                    this.showResponseTable = false;
                    this.showEmptyErr = false;
                    
                }

            }catch(err) {
                this.showEmptyErr = true;
                this.showResponseTable = false;
               // console.log('err = ' + err);
            }
            this.isLoading = false;
        }).catch(error => {
          //  console.log('Error', JSON.stringify(error));
        });
    }
  
    handleFilterChange(event) {
        let name = event.target.name;
        let value = event.target.value;

        if(name == 'SIC') {
          if(!this.selSIC.includes(value)){
                this.selSIC.push(value);
            }
            event.target.value = '';
        } else if(name == 'NAICS') {
             if(!this.selNAICS.includes(value)){
                this.selNAICS.push(value);
            }
             event.target.value = '';
        } else if(name == 'Industry') {
             if(!this.selIndustry.includes(value)){
                this.selIndustry.push(value);
            }
             event.target.value = '';
        } else if(name == 'VectorScore') {
             this.selVectorScore = value;
            if (!this.selVectorScore) {
                this.vectorBwFrom = null;
                this.vectorBwTo = null;
                this.vectorFrom = null;
            } else if (this.selVectorScore == 'Between') {
                this.vectorFrom = null;
            } else {
                this.vectorBwFrom = null;
                this.vectorBwTo = null;
            }
        }
        
        this.filterData();
    }

     handleRemove(event){
        let id = event.target.dataset.id;
        let name = event.target.name;

        if (id == 'SIC') {
            this.selSIC.splice(this.selSIC.indexOf(name), 1);
            this.refs.sicCmp.value = '';
        }else if(id == 'NAICS'){
            this.selNAICS.splice(this.selNAICS.indexOf(name),1);
            this.refs.naicCmp.value = '';
        }else if(id == 'Industry'){
            this.selIndustry.splice(this.selIndustry.indexOf(name),1);
            this.refs.indCmp.value = '';
        }

        this.filterData();
    }

 

   filterData() {
  
    
        try{
            let searchable = [];

            this.data.forEach((item, index) => {
                let isValid = true;
                if (this.selSIC && this.selSIC.length > 0 && (!item.SIC || !this.validateMultiSelect(item.SIC, this.selSIC)))
                    isValid = false;
                if (this.selNAICS && this.selNAICS.length > 0 && (!item.NAICS || !this.validateMultiSelect(item.NAICS, this.selNAICS))) 
                    isValid = false;
                if (this.selIndustry && this.selIndustry.length > 0 && (!item.industry || !this.validateMultiSelect(item.industry, this.selIndustry))) 
                    isValid = false;

                  isValid = this.validateOperatorFilters(isValid, this.selVectorScore, this.vectorBwFrom, this.vectorBwTo, this.vectorFrom, item.vector_score, 'FLOAT');    
                
               // if(isValid && searchable.length < this.pageSize)
                if (isValid)
                    searchable.push(item);
            });
            
            this.searchable = searchable;
             this.pageNo = 1;
         
        }catch(err) {
           // console.log('err = ' + err);
        }
    }

    validateOperatorFilters(isValid, operator, betweenFromValue, betweenToValue, fromValue, actualValue, type) {

        if(type == 'INTEGER') {
            if (operator == 'Between' && betweenFromValue && betweenToValue
                && (!actualValue || !(parseInt(betweenFromValue) <= parseInt(actualValue) && parseInt(betweenToValue) >= parseInt(actualValue))))
                isValid = false;

            if (operator && operator != 'Between' && fromValue) {
                if (!actualValue
                    || (operator == 'Greater Than' && !(parseInt(fromValue) < parseInt(actualValue)))
                    || (operator == 'Less Than' && !(parseInt(fromValue) > parseInt(actualValue)))
                    || (operator == 'Equal to' && !(parseInt(fromValue) == parseInt(actualValue)))
                    || (operator == 'Greater Than Equal To' && !(parseInt(fromValue) <= parseInt(actualValue)))
                    || (operator == 'Less Than Equal To' && !(parseInt(fromValue) >= parseInt(actualValue)))
                )
                    isValid = false;
            }
        } else if(type == 'FLOAT') {
            if (operator == 'Between' && betweenFromValue && betweenToValue
                && (!actualValue || !(parseFloat(betweenFromValue) <= parseFloat(actualValue) && parseFloat(betweenToValue) >= parseFloat(actualValue))))
                isValid = false;

            if (operator && operator != 'Between' && fromValue) {
                if (!actualValue
                    || (operator == 'Greater Than' && !(parseFloat(fromValue) < parseFloat(actualValue)))
                    || (operator == 'Less Than' && !(parseFloat(fromValue) > parseFloat(actualValue)))
                    || (operator == 'Equal to' && !(parseFloat(fromValue) == parseFloat(actualValue)))
                    || (operator == 'Greater Than Equal To' && !(parseFloat(fromValue) <= parseFloat(actualValue)))
                    || (operator == 'Less Than Equal To' && !(parseFloat(fromValue) >= parseFloat(actualValue)))
                )
                    isValid = false;
            }
        }
        return isValid;
    }
    handleRowSelection(event) {
        let selectedRows = event.detail.selectedRows;

        let leadIdList = [];
        if(selectedRows.length > 0) {
            
            selectedRows.forEach(function (item) {
                leadIdList.push(item.Id);
            });

            this.leadIdList = leadIdList;
            this.initHandler();
        }
    }
    

    handleGoBack() {
        if(!this.recordId){
            window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
         } else {
            this.dispatchEvent(new CloseActionScreenEvent());
    
    }
    }

    handleShowSimilarCompany() {
        window.open(this.graph_url, '_blank');
      
    }

    addCompanyRecord(event) {
   try{
        let leadList = [];
        //let contactList = [];

        let selectedIndex = event.target.dataset.id;
        let selectedData = this.data[event.target.dataset.id];
        
        if(selectedData) {
            leadList.push({
                "Id": (selectedData.id ? selectedData.id : null),
                "LastName": selectedData.name,
                "zeniadev__Vector_Score__c": selectedData.vector_score, 
                "Company": selectedData.name, 
                "zeniadev__Datasource__c": selectedData.source,                
                "zeniadev__SICCode__c": selectedData.SIC != null ? selectedData.SIC.toString() : '', 
                "zeniadev__Niacs_Code__c": selectedData.NAICS != null ? selectedData.NAICS.toString() : '' ,
                "Industry": selectedData.industry
            });

            if(leadList.length > 0) {
                // call saveLeads
                saveLeads({ leads: leadList })
                    .then(result => {
                   //     console.log('result = ' + JSON.stringify(result));

                        const evt = new ShowToastEvent({
                            title: 'Success',
                            message: 'Lead Added Successfully',
                            variant: 'success'
                        });
                        this.dispatchEvent(evt);

                        this.data.forEach((item, index) => {
                        
                            if (index == selectedIndex) {
                                item.showAdd = false;
                                item.showUpdate = false;
                                item.selectedRowClass = 'bg-color-green';
                
                               // item.hasContacts = (result.length > 0 ? true : false);
                                
                                if(item.hasContacts) {
                                    item.contacts = result;

                                    item.contacts.forEach((con, index1) => {
                                        con.index = index1 + 1;
                                    });
                                }
                                //console.log('index match' + item.hasContacts);
                            } else if (item.name == selectedData.name) {
                                if(item.showAdd) {
                                    item.showAdd = false;
                                    item.showUpdate = true;
                                    item.id = result[0].Id;
                                }
                            }
                        });
                    
                    }).catch(error => {
                       // console.log('error#' + JSON.stringify(error));
                    });
            }
        }
   } catch (err) {
           // console.log('err = ' + err);
        }
    }
    
    displayContactDetails(event){
     
        let compname = this.data[event.target.dataset.id];
        displayContacts({ Company: compname.name }).then(response => {
          let contacts = response;
          this.isLoading = false;
            const result = showContacts.open({
                size: 'small', 
                content: contacts,
            });
        }).catch(error => {
           //  console.log('error#' + JSON.stringify(error));
        });
        
    }

    
    validateMultiSelect(value, selValues) {
        let isValid = false;

        selValues.forEach((item) => {
            if(value.includes(item)) {
                isValid = true;
            }
        });
        return isValid;
    }
     handlePrevNext(event) {       
        this.pageNo = event.target.name == 'prev' ? this.pageNo - 1 : this.pageNo + 1;
    }

    handleOperatorvalues(event) {
        let id = event.target.dataset.id;
        let name = event.target.name;
        let value = event.target.value;

        if (id == 'vectorScore') {
            if (name == 'vectorBwFrom') {
                this.vectorBwFrom = value;
            } else if (name == 'vectorBwTo') {
                this.vectorBwTo = value;
            } else if (name == 'vectorFrom') {
                this.vectorFrom = value;
            }
        }
        this.filterData();
    }

}