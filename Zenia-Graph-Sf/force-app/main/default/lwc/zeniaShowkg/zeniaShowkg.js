import { LightningElement, track, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import showkgcompany from '@salesforce/apex/zeniaShowKgResponseHandler.showkgcompany';

export default class ZeniaShowkg extends LightningElement {
    @api recordId;

    response;
    @api leadIds;
    @api leadList;
    @track showData = true;
    showError = false;
    connectedCallback() {
        setTimeout(() => {
            console.log('this.recordId', this.recordId);
            if (this.leadIds && this.leadIds.length > 0) {
                this.leadList = this.leadIds.split(',');
            } else if(this.recordId){
                this.leadList = [];
                this.leadList.push(this.recordId);
            }


            console.log('SELECTED IDS', JSON.stringify(this.leadList));
            if (this.leadList && this.leadList.length > 0) {
                showkgcompany({ leadIds: this.leadList }).then(response => {
                    this.response = JSON.parse(response);
                    console.log('response', this.response.data);
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
                this.showData = false;
                this.showError = true;
            }
        }, 100);

    }
    goToListView() {
        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
    }
}