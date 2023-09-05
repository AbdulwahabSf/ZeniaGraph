import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class LWCModal extends LightningModal {
    @api content;
    contactDetails = [];

    get showContacts() {
         return this.contactDetails.length > 0;
    }


    handleClose() {
        this.close('close popup');
    }
    connectedCallback() {
        this.contactDetails = this.content;
    //      this.contactDetails.map((FirstName, index) => {
    //       return {FirstName, sno: index + 1};
    //   });
        //   console.log('content contact data ',this.contactDetails);
    }

}