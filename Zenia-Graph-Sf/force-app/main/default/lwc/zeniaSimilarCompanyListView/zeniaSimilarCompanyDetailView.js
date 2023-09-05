import { LightningElement,api, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import similarCompanyList from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.similarCompanyList';

export default class zeniaSimilarCompanyDetailView extends LightningElement {

    isLoading = false;
    @api recordId; 
    @api leadList;
    @api listView;
    @api leadIds;
    data = [];
    @api showTable;
    showData = false;
    showError = false;
    @track leadsData;
     
        columns = [
        { label: 'Company', fieldName: 'Company' },
        { label: 'Contact Person', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Location', fieldName: 'City' },
        { label: 'Email', fieldName: 'Email', type: 'Email' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'DataSource', fieldName: 'Datasource__c' }
    ];

     connectedCallback() {
        setTimeout(() => {
            this.init();
        }, 1000);
        
    }

    init() {
        console.log('this.recordId = ', this.recordId);
 
     this.leadIdList = [];
       if (this.leadIds && this.leadIds.length > 0) {
            this.leadIdList = this.leadIds.split(',');
        } else if(this.recordId) {
            this.leadIdList.push(this.recordId);
        }
       if(this.leadIdList.length <= 1) {
            this.initHandler();
            this.isLoading = false;
        }
        
        if(this.leadIdList.length > 1){
             this.initHandler();
             this.isLoading = false;
             this.showData = true;

        }

        if(this.leadIdList.length == 0){
            this.showError = true;
            this.showData = false;
            this.isLoading = false;
        }
       
    }

    initHandler() {

        this.isLoading = true;
      //  console.log('this.leadIdList = ', JSON.stringify(this.leadIdList));

        // call similarCompanyList
        similarCompanyList({ leadIds: this.leadIdList }).then(response => {
            
          //  console.log('response = ', JSON.stringify(response));
             this.leadsData = response.FilteredLeads;
             console.log('filtered records ',this.leadsData);
            if(response && response.SimilarCompanyResponse) {
                let similarCompanyResponse = JSON.parse(response.SimilarCompanyResponse);
              
               // console.log('leadNames = ', JSON.stringify(leadNames));
                 
                if(similarCompanyResponse.data) {
                    this.isLoading = false;
                    this.graph_url = similarCompanyResponse.data.getSimilarCompaniesByName[0].graph_url;
                    window.open(this.graph_url, '_blank');
                   
                }   

                  if (this.leadIds && this.leadIds.length > 0) {
                        this.goToListView();
                    } else {
                        this.dispatchEvent(new CloseActionScreenEvent());
                    }
            }
        }).catch(error => {
            console.log('Error', error);
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

    goToListView() {
        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
    }

      handleGoBack() {
        if(!this.recordId)
            window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
        else
            this.dispatchEvent(new CloseActionScreenEvent());
    }
    }