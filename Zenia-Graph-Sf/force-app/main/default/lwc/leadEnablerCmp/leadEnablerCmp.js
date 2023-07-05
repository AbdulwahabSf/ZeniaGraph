import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import graphResponse from '@salesforce/apex/generateApiPayloadResponse.getGraphPayload';
import saveLeads from '@salesforce/apex/generateApiPayloadResponse.saveLeads';


export default class LeadEnablerCmp extends NavigationMixin(LightningElement) {

    @api leadIds;
    @api selectedLead;
    @track isModalOpen = true;
    @track showData = false;
    @track data = [];
    @track error;
    @track selectedLeads;
    @track SelecteddataSource = [];
    @track templateText;
    @track companies = [];
    @track CompanyInfo;
    @track leads = [];
    @track sourceValue = [];
    @track initialvalue = 'ACTIVE:\n+40 years operating business\n+50 employees+10 mil in investment funding\n+2% growth quarterly\n+3% growth yearly\nINACTIVE:\n-160 year operating business\n-60000 employees\n-5 mil in investment funding\n-5% growth quarterly\n-1% growth yearly\nOTHERS:\nAny other leads which are not Active or Inactive';
    @track displaySIC = false;
    @track displayNIAC = false;
    @track radiochecked = false;
    @track sicradiochecked = false;
    @track codes =[];
    @track NaicKey;
    @track SicKey;
    @track showSpinner = true;
    

    get radioOptions() {
        return [
            { label: 'One Time', value: 'option1' },
            { label: 'Ongoing', value: 'option2' },
        ];
    }

    get radioOptionsInd() {
        return [
            { label: 'NAICS CODE Filter', value: 'option1' },
            { label: 'Ongoing', value: 'option2' },
            { label: 'None', value: 'option3' }
        ];
    }

    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }

    closeModal() {
        // to close modal set isModalOpen tarck value as false

        this.isModalOpen = false;
        this.showData = false;
        window.open('/lightning/o/Lead/list?filterName=Recent', '_self');

    }

    connectedCallback(){
              this.displayNIAC = false;
              this.displaySIC = false;
    }


    get getoptions() {
        return [
            { label: 'linkedin', value: 'option1' },
            { label: 'zoominfo', value: 'option3' },
        ];
    }
    get selectedValues() {
        return this.value.join(',');
    }

     handleCode(){
         let code = event.target.dataset.id;
         if(code == 'SIC'){
             this.displaySIC = true;
             this.displayNIAC = false;

         }else if(code == 'NAICS'){
             this.displayNIAC = true;
             this.displaySIC = false;

         }else if(code == 'None'){
              this.displayNIAC = false;
              this.displaySIC = false;

              }
    }


    handleLookupItemSelected(event){   
        var source = event.target.dataset.id;   
        const searchKey = event.detail;
       // console.log('searchkey '+searchKey);
        if(source == 'NIAC'){
            this.NaicKey = searchKey;
           
        } else if (source == 'SIC'){
             this.SicKey = searchKey;
             
    
        }

    }


    handleChange(event) {
        let checked = event.target.checked;
        let source = event.target.dataset.id;
        console.log('checked '+checked);
        console.log('checked '+source);
        if(checked && !this.SelecteddataSource.includes(source))
            this.SelecteddataSource.push(source);
        else if(!checked && this.SelecteddataSource.includes(source)) {
           // console.log('index = ' + this.SelecteddataSource.indexOf(source));
            this.SelecteddataSource.splice(this.SelecteddataSource.indexOf(source), 1);
        }
    }


    // Select the all rows
    allSelected(event) {    
        this.leads.forEach((item, index) => {
            item.isSelected = (event.target.checked ? true : false);
        });
    }


    handlePrevious() {
        this.isModalOpen = true;
        this.showData = false;
        //this.template.querySelector('lightning-input').reset();
       
    }

 

     handleDefaultText(){
         this.initialvalue = '';
         var defaulttext = event.target.value;
         this.initialvalue = event.target.value;

     }
      
    submitDetails() {    
        let options = [];
       
        graphResponse({ leadIds: this.leadIds.split(','), queryData: this.initialvalue, dataSources: this.SelecteddataSource , naicValue : this.NaicKey , sicValue : this.SicKey})
            .then(result => {
                console.log('result#' + JSON.stringify(result));
                this.leads = result;
                this.showSpinner = false;
               
                this.leads.forEach((item, index) => {
                    item.isSelected = false;
                    item.dataSourceStatus = item.options[0];

                    let options = item.options;
                    item.options = [];

                    options.forEach((option, index) => {
                        item.options.push({ label: option, value: option });
                    });
                  
                });
            
                console.log('leads = ' + JSON.stringify(this.leads));

            }).catch(error => {
                console.log('error#' + error);
            });
        
        this.showData = true;
        this.isModalOpen = false;
    }


    handleCheckboxChange(event) {
        this.leads[event.target.dataset.id].isSelected = (event.target.checked ? true : false);
    }

    handleStatusChange(event) {
        console.log('event.target.dataset.id = ' + event.target.dataset.id);
        this.leads[event.target.dataset.id].dataSourceStatus = event.target.value;
        console.log('datasource ',this.leads[event.target.dataset.id].dataSourceStatus);
    }

    handleOneTime(event) {
        console.log(event.target.value);
    }

    handleOngoing(event) {
        console.log(event.target.value);
    }



    handleSave() {
        let leads = [];
      this.showSpinner = true;
        this.leads.forEach((item, index) => {
            if (item.isSelected) {
                let values = item.dataSourceStatus.split(' | ');

                if(values[1] != 'NOT_CLASSIFIED') {
                    leads.push({
                        "Id": item.id, "Status": values[1], "zeniadev__Datasource__c": values[0] , "zeniadev__SICCode__c": item.SicCode , "zeniadev__Niacs_Code__c" : item.NaicCode , "Industry": item.industry
                    });
                }
                console.log('leads for push '+JSON.stringify(this.leads));
            }
        });

        if(leads.length > 0) {
            saveLeads({ leads: leads })
                .then(result => {
                    if (result == 'Success')
                        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
                    else console.log(result);
                    this.showSpinner = false;
                }).catch(error => {
                    console.log('error#' + error); 
                });
        } else window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
    }

}