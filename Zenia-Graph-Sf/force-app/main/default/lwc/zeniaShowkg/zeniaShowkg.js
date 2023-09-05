import { LightningElement, track, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import showkgcompany from '@salesforce/apex/zeniaShowKgResponseHandler.showkgcompany';

export default class ZeniaShowkg extends LightningElement {
    @api recordId;
    response;
    @api leadIds;
    @api leadIdList;
    isLoading = true;
    showError = false;
    showEmptyErr = false;

    connectedCallback() {
        setTimeout(() => {
            this.init();
        }, 1000);
        
    }

     init() {

     //  console.log('this.recordId = ', this.recordId);

       this.leadIdList = [];
       if (this.leadIds && this.leadIds.length > 0) {
            this.leadIdList = this.leadIds.split(',');
        } else if(this.recordId) {
            this.leadIdList.push(this.recordId);
        }
       if(this.leadIdList.length > 0 ) {
            this.isLoading = false;
            this.initHandler();
        }

        if(this.leadIdList.length == 0){
            this.showError = true;
            this.isLoading = false;
        }

    }


    initHandler() {
           
           // console.log('SELECTED IDS', JSON.stringify(this.leadIdList));
            if (this.leadIdList && this.leadIdList.length > 0) {
                showkgcompany({ leadIds: this.leadIdList }).then(response => {
                    this.response = JSON.parse(response);
                    console.log('response', this.response.data);
                     this.isLoading = false;
                     
                    window.open(this.response.data.showGraphDbKg[0].graph_url, '_blank');
    
                    if (this.leadIds && this.leadIds.length > 0) {
                        this.goToListView();
                    } else {
                        this.dispatchEvent(new CloseActionScreenEvent());
                    }

                }).catch(error => {
                    console.log('Error', error);
                });
                
            } else {
                this.showEmptyErr = true;
                this.showData = false;
                this.showError = true;
            }
        }

    goToListView() {
    if(!this.recordId){
        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
    }else{
          this.dispatchEvent(new CloseActionScreenEvent());
    }
    }
}