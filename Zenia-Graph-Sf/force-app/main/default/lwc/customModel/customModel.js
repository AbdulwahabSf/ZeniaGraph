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
    }

}