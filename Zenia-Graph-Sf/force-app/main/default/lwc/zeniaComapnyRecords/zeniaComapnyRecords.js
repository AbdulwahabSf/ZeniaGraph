import { LightningElement, api, track, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import similarCompanyList from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.similarCompanyList';
import saveLeads from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.saveLeads';
import displayContacts from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.displayContacts';
import showContacts from 'c/customModel';
import { CurrentPageReference } from 'lightning/navigation';

export default class ZeniaComapnyRecords extends LightningElement {
    
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
     // console.log('quick Action Name'+quickActionPath);
      let envValue = quickActionPath.split("zeniadev__")[1].split("_EnvSimilarity")[0]; 
       this.Env = envValue;
    }
    }


    get showSimilarCompany() {
        return this.data.length > 0 && this.graph_url != '';
    }
    
     get displaySource() {
        return this.Env == 'graph' ? true : false;
    }

    connectedCallback() {
        setTimeout(() => {
            this.init();
        }, 1000);
    }

    init() {
        //  console.log('this.leadIds = ', JSON.stringify(this.leadIds));
        //  console.log('this.recordId = ', this.recordId);

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
      // console.log('environment',this.Env);
       //  this.isLoading = true;
        //  console.log('this.leadIdList = ', JSON.stringify(this.leadIdList));
        // call similarCompanyList
        similarCompanyList({ leadIds: this.leadIdList , Env : this.Env }).then(response => {
            try{
             //   console.log('response = ', JSON.stringify(response));
                this.leads = response.Leads;
                this.leadsData = response.FilteredLeads;
                this.data = [];
            
                if(response && response.SimilarCompanyResponse) {
                    let similarCompanyResponse = JSON.parse(response.SimilarCompanyResponse);
                    //   console.log('similarCompanyResponse is',JSON.stringify(similarCompanyResponse));
                    
                    let leadNames = [];
                    this.leads.forEach(function (lead) {
                        leadNames.push(lead.Company);
                    });
                   // console.log('leadNames = ', JSON.stringify(leadNames));
                    
                    if(similarCompanyResponse.data) {
                        this.data = similarCompanyResponse.data.getSimilarCompaniesByName[0].records;
                        this.graph_url = similarCompanyResponse.data.getSimilarCompaniesByName[0].graph_url;
                        
                        this.data.forEach(function (srcvalue) {
                            if(srcvalue.source){
                         const str = srcvalue.source.toLowerCase();
                           // console.log('str',str);
                            if (str == 'linkedin') {
                                srcvalue.source = 'LinkedIn';
                            } else if (str == 'dbpedia') {
                                srcvalue.source = 'DBPedia';
                            } else if (str == 'salesforce') {
                                srcvalue.source = 'Salesforce'
                            }                       
                            }
                        //    srcvalue.showAdd = false;
                            srcvalue.showUpdate = false;
                          //  srcvalue.showRecord = true;
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
                            /* let persons = [];
                            if(srcvalue.persons) {
                                persons = JSON.parse(srcvalue.persons);

                                persons.forEach((item, index1) => {
                                //  console.log('item = ', item);
                                    item.index = (index1 + 1);
                                    item.firstname = item['first name'];
                                    item.lastname = item['last name'];
                                });
                            }
                            srcvalue.persons = persons;
                            srcvalue.hasContacts = (persons.length > 0 ? true : false);
                            srcvalue.selectedRowClass = '';*/
                        }); 
                     //  console.log('this.data = ', JSON.stringify(this.data));
                
                    } 
                } 
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
                //  console.log('this.leads = ', JSON.stringify(this.leads));
                //  console.log('this.data = ', JSON.stringify(this.data));

            }catch(err) {
                this.showEmptyErr = true;
                console.log('err = ' + err);
            }
            this.isLoading = false;
        }).catch(error => {
            console.log('Error', JSON.stringify(error));
        });
    }

    handleRowSelection(event) {
        let selectedRows = event.detail.selectedRows;
        //  console.log('selectedRows = ', JSON.stringify(selectedRows));

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
        // this.handleGoBack();
    }

    addCompanyRecord(event) {
        //  console.log('event.target.dataset.id = ', event.target.dataset.id);

        let leadList = [];
        //let contactList = [];

        let selectedIndex = event.target.dataset.id;
        let selectedData = this.data[event.target.dataset.id];
        console.log('selectedData = ', JSON.stringify(selectedData));
        
        if(selectedData) {
            leadList.push({
                "Id": (selectedData.id ? selectedData.id : null),
                "LastName": selectedData.name,
                "zeniadev__Vector_Score__c": selectedData.vector_score, 
                "Company": selectedData.name, 
                "zeniadev__Datasource__c": selectedData.source, 
              //  "zeniadev__Datasource__c": '', 
                "zeniadev__SICCode__c": selectedData.SIC.toString(), 
                "zeniadev__Niacs_Code__c": selectedData.NAICS.toString(), 
                "Industry": selectedData.industry
            });

            /*if(selectedData.persons && selectedData.persons.length > 0) {
                selectedData.persons.forEach((item, index1) => {
                    contactList.push({
                        "FirstName": item.firstname,
                        "LastName": item.lastname, 
                        "Email": item.email,
                        "Phone": item.phone,
                        "zeniadev__Is_Primary__c": item.primary,
                        "zeniadev__Designation__c": item.designation
                    });
                });
            }*/
            
            // console.log('leadList = ', JSON.stringify(leadList));
            // console.log('contactList = ', JSON.stringify(contactList));

            if(leadList.length > 0) {
                // call saveLeads
                saveLeads({ leads: leadList })
                    .then(result => {
                        console.log('result = ' + JSON.stringify(result));

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
                        console.log('error#' + JSON.stringify(error));
                    });
            }
        }
    }
    
    displayContactDetails(event){
        //  let contacts = this.data[event.target.dataset.id].contacts;
       // this.isLoading = true;
        let compname = this.data[event.target.dataset.id];
        displayContacts({ Company: compname.name }).then(response => {
            console.log(JSON.stringify(response));
            let contacts = response;
            console.log(contacts);
          this.isLoading = false;
            const result = showContacts.open({
                size: 'small', //small, medium, or large default :medium
                // description: 'Accessible description of modal\'s purpose',
                content: contacts,
            });
        }).catch(error => {
             console.log('error#' + JSON.stringify(error));
        });
        
    }

    //FOR HANDLING THE HORIZONTAL SCROLL OF TABLE MANUALLY
    tableOuterDivScrolled(event) {
        this._tableViewInnerDiv = this.template.querySelector(".tableViewInnerDiv");
        if (this._tableViewInnerDiv) {
            if (!this._tableViewInnerDivOffsetWidth || this._tableViewInnerDivOffsetWidth === 0) {
                this._tableViewInnerDivOffsetWidth = this._tableViewInnerDiv.offsetWidth;
            }
            this._tableViewInnerDiv.style = 'width:' + (event.currentTarget.scrollLeft + this._tableViewInnerDivOffsetWidth) + "px;" + this.tableBodyStyle;
        }
        this.tableScrolled(event);
    }

    tableScrolled(event) {
        
    }
 
    //#region ***************** RESIZABLE COLUMNS *************************************/
    handlemouseup(e) {
       
    }
 
    handlemousedown(e) {
       
    }
 
    handlemousemove(e) {
      
    }
 
    handledblclickresizable() {
        
     
    }


}