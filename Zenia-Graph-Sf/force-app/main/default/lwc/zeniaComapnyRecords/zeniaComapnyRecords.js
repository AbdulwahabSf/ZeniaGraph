import { LightningElement, wire, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import similarCompanyList from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.similarCompanyList';
import getSelectedLead from '@salesforce/apex/ZeniaSelectedSimilarCompanies.getSelectedLead';


export default class ZeniaComapnyRecords extends LightningElement {
    isLoading = true;
    @api recordId;
    @api listView;
    @api leadIds;
    @api leadList;
    showButton = true;
    showData = true;
    showError = false;
    showError1 = false;
    selectedCompanies = [];
    selectedRecordData;
    response;
    data = [];

    errorMessage = 'Please Select A Record';

    columns = [
        { label: 'Company', fieldName: 'Company' },
        { label: 'Contact Person', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Location', fieldName: 'City' },
        { label: 'Email', fieldName: 'Email', type: 'Email' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'DataSource', fieldName: 'Datasource__c' }
    ];
    listViewColumns = [
        { label: 'Name', fieldName: 'name' },
        { label: 'Industry', fieldName: 'industry' },
        { label: 'NAICS', fieldName: 'NAICS' },
        { label: 'SIC', fieldName: 'SIC' },
        { label: 'Source', fieldName: 'source' },
        { label: 'Vector Score', fieldName: 'vector_score' }
    ];

    connectedCallback() {
        setTimeout(() => {
            if(this.listView == true){
                console.log('its a List view page');
                this.leadList = [];
                if (this.leadIds && this.leadIds.length > 0) {
                    this.leadList = this.leadIds.split(',');
                } else if(this.recordId){
                    this.leadList = [];
                    this.leadList.push(this.recordId);
                }
                similarCompanyList({leadIds : this.leadList}).then(response=> {
                    this.response = JSON.parse(response);
                    console.log('Response',JSON.stringify(this.response ))
                    if (this.response.data) {
                        this.data = this.response.data.getSimilarCompaniesByName[0].records;
                        console.log('table data', JSON.stringify(this.data));
                    }
                    this.isLoading = false;
                }).catch(error => { 
                    console.log('Error',error);
                });  
            if(this.leadIds.length <=0){
                this.showError = true;
                this.showData = false;
            }

            if (this.leadList.length > 1) {
                getSelectedLead({ ids: this.leadList }).then(response => {
                    this.selectedRecordData = response;
                    console.log('recordData..', JSON.stringify(this.selectedRecordData));
                }).catch(error => {
                    console.log('ERROR', error);
                });
                this.showError1 = true;
                this.showData = false;
                this.showError = false;
            }
            }
            else{
                console.log('its not a List view page');
                console.log('this.recordId', this.recordId);
                this.leadList = [];
                if (this.leadIds && this.leadIds.length > 0) {
                    this.leadList = this.leadIds.split(',');
                } else if(this.recordId){
                    this.leadList = [];
                    this.leadList.push(this.recordId);
                }
    
                console.log('SELECTED IDS', JSON.stringify(this.leadList));
                if (this.leadList.length <= 0) {
                    this.showData = false;
                    this.showError = true;
                    this.isLoading = false;
                }
                if (this.leadList.length > 1) {
                    getSelectedLead({ ids: this.leadList }).then(response => { 
                        this.selectedRecordData = response;
                        console.log('recordData..', JSON.stringify(this.selectedRecordData));
                    }).catch(error => {
                        console.log('ERROR', error);
                    });
                    this.showError1 = true;
                    this.showData = false;
                    this.showError = false;
                    this.isLoading = false;
                }
                if (this.leadList.length <= 1) {
    
                    similarCompanyList({leadIds : this.leadList}).then(response => {
                        this.response = JSON.parse(response);
                        console.log('Working')
                        console.log('response', this.response.data);
                        window.open(this.response.data.getSimilarCompaniesByName[0].graph_url, '_blank');
                        if (this.leadIds && this.leadIds.length > 0) {
                            this.goToListView();
                        } else {
                            this.dispatchEvent(new CloseActionScreenEvent());
                        }
                    }).catch(error => {
                        console.log('Error..', error);
                    });
                }

            }

        }, 100);
    }
    handleSelectCompany() {
        this.selectedCompanies = [];

        this.showButton = false;
        var selectedCompanies = this.template.querySelector("lightning-datatable").getSelectedRows();
        this.selectedCompanies = selectedCompanies;
        if (selectedCompanies.length <= 0) {
            this.showButton = true;
        }
        else if (selectedCompanies.length > 1) {
            this.showButton = true;
        }
    }

    goToSearch() {
        this.showError1 = false;
        this.showData = true;
        var selectedId = this.selectedCompanies[0].Id;
        console.log('selectedRecords...', JSON.stringify(this.selectedCompanies));
        if(this.listView == true){
            this.showData = true;
            similarCompanyList({leadIds : selectedId}).then(response=> {
                this.response = JSON.parse(response);
                console.log('Response',JSON.stringify(this.response ));
                if (this.response.data) {
                    console.log('data coming')
                    this.data = this.response.data.getSimilarCompaniesByName[0].records;
                    console.log('table data', JSON.stringify(this.data));
                }
                this.loding = false;
            }).catch(error => { 
                console.log('Error',error);
            });  

        }
        else{
            similarCompanyList({leadIds : selectedId}).then(response => {
            this.response = JSON.parse(response);
            console.log('response', this.response);
            if (this.response.data) {
                window.open(this.response.data.getSimilarCompaniesByName[0].graph_url, '_blank');
                if (this.leadIds && this.leadIds.length > 0) {
                    this.goToListView();
                } else {
                    this.dispatchEvent(new CloseActionScreenEvent());
                }

            } else {
                this.showError = true;
                this.errorMessage = this.response.errors[0].message;
            }

        }).catch(error => {
            console.log('Error', error);
        });
    }

    }

    // Method to go back on lead list view on click of goback button
    goToListView() {
        this.isLoading = true;
        this.showError = false
        this.showError1 = false;
        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
        this.isLoading = false;
    }
    showKnowledgeGraph(){
        this.isLoading = true;
        similarCompanyList({leadIds : this.leadList}).then(response=> {
            console.log('Working');
            this.response = JSON.parse(response);
            console.log('Response',JSON.stringify(this.response ))
            if (this.response.data) {
                console.log('data coming')
                window.open(this.response.data.getSimilarCompaniesByName[0].graph_url, '_blank');
                if (this.leadIds && this.leadIds.length > 0) {
                    this.goToListView();
                } else {
                    this.dispatchEvent(new CloseActionScreenEvent());
                }
            }
        }).catch(error => {
            console.log('Error', error);
        });  
        this.isLoading = false;

    }
}