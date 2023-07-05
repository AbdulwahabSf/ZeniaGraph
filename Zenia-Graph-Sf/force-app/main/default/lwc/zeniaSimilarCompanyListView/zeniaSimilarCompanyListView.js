import { LightningElement,api } from 'lwc';
import similarCompanyList from '@salesforce/apex/zeniaSimilarCompanyListResponseHandler.similarCompanyList';

export default class ZeniaSimilarCompanyListView extends LightningElement {

    @api leadIds;
    loding = false;
    @api recordId
    errorMessage
    @api leadList;
    data
    error
    response
    showError = false;
    showData = true;

    columns = [
        { label: 'Name', fieldName: 'name' },
        { label: 'Industry', fieldName: 'industry' },
        { label: 'NAICS', fieldName: 'NAICS' },
        { label: 'SIC', fieldName: 'SIC' },
        { label: 'Source', fieldName: 'source' },
        { label: 'Vector Score', fieldName: 'vector_score' }
    ];

    connectedCallback(){
        this.loding = true;
        setTimeout(()=>{
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
                console.log('Test');
                if (this.response.data) {
                    console.log('data coming')
                    //window.open(this.response.data.getSimilarCompaniesByName[0].graph_url, '_blank');
                    this.data = this.response.data.getSimilarCompaniesByName[0].records;
                    console.log('table data', JSON.stringify(this.data));
                }
                this.loding = false;
            }).catch(error => {
                console.log('Error',JSON.stringify( error));
            });  
        if(this.leadIds.length <=0){
            this.showError = true;
            this.showData = false;
        }
    },0)
    }

    // Method to go back on lead list view on click of goback button
    goToListView() {
        this.loding = true;
        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
        this.loding = false;
    }

    showKnowledgeGraph(){
        this.loding = true;
        similarCompanyList({leadIds : this.leadList}).then(response=> {
            console.log('Working...')
            //console.log('test',JSON.stringify(response));
            //var res =JSON.parse(response);
            //console.log('res',res.data)
            console.log('Working');
            this.response = JSON.parse(response);
            console.log('Response',JSON.stringify(this.response ))
            console.log('Test');
            if (this.response.data) {
                console.log('data coming')
                window.open(this.response.data.getSimilarCompaniesByName[0].graph_url, '_blank');
            }
        }).catch(error => {
            console.log('Error',JSON.stringify( error));
        });  
        this.loding = false;

    }
    }