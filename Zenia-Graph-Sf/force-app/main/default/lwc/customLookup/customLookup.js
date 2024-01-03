import { LightningElement, api, wire, track } from 'lwc';
import frameRequest from '@salesforce/apex/ZeniaSicNaicSearch.frameRequest';

export default class CustomLookup extends LightningElement {

    // Private var to track @api var
    _showLabel;
    _label;
    _searchPlaceholder = 'Search...';

    searchTerm;
    isLoading = false;
    selectedItemId;
    selectedItemName;

    inputClass;
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';

    @track records;


    handleClick(event) {
        if (!this.searchTerm)
            this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    handleItemClick(event) {
        console.log('inside handleItemClick' + event.currentTarget.dataset.id);

        this.selectedItemId = event.currentTarget.dataset.id;
        this.selectedItemName = event.currentTarget.dataset.name;

        // fire event
        this.dispatchEvent(new CustomEvent('lookupitemselected', { detail: this.selectedItemId }));

        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleChange(event) {
        let name = event.target.name;
        let value = event.target.value;

        // console.log('name = ' + name);
        // console.log('value = ' + value);

        if (name = 'searchInput') {
            if (this.searchTerm != value)
                this.isLoading = true;
            this.searchTerm = value;
           
            if (value) {
                this.callFrameRequest();
            }
        }
    }

    @track result;
    @track fres;
    callFrameRequest() {
        //console.log('inside callFrameRequest');

        // call frameRequest
        frameRequest({ value: this.searchTerm, code: (this._searchPlaceholder == 'Search for NAICS' ? 'NAICS' : 'SIC') })
            .then(result => {

                this.result = JSON.parse(result);
                console.log('json parse result', this.result);

                this.records = JSON.parse(result);

                this.isLoading = false;

            })
            .catch(error => {
               console.log('error in frameRequest = ' + JSON.stringify(error));
                this.result = undefined;
                this.isLoading = false;
            });
    }

    handleBlur(event) {
        setTimeout(() => {
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
        }, 200);
    }

    handleRemove() {
        this.selectedItemId = '';
        this.selectedItemName = '';
    }

    @api
    get showLabel() {
        return this._showLabel;
    }

    set showLabel(value) {
        this._showLabel = value;
    }

    @api
    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    @api
    get searchPlaceholder() {
        return this._searchPlaceholder;
    }

    set searchPlaceholder(value) {
        this._searchPlaceholder = value;
    }
}