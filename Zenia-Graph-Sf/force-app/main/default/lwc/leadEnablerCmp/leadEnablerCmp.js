import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import graphResponse from '@salesforce/apex/generateApiPayloadResponse.getGraphPayload';
import saveLeads from '@salesforce/apex/generateApiPayloadResponse.saveLeads';


export default class LeadEnablerCmp extends NavigationMixin(LightningElement) {

    @api leadIds;
    @track isModalOpen = 'slds-show';
    @track showData = 'slds-hide';
    @track data = [];
    @track CompanyInfo;
    @track leads = [];
    @track initialvalue = '';
    @track displaySIC = false;
    @track displayNIAC = false;
    @track NaicKey;
    @track SicKey;
    @track showSpinner = true;
    @track classifyValue = 'None';
    @track defaultTextVal;
    plusOpp = '+40';
    posEmpNumber = '+50';
    growthQuar = '+2%';
    growthYrly = '+3%';
    negOpp = '-160';
    negEmpNumber = '-60000';
    negGrowthQuar = '-5%';
    negGrowthYrly = '-1%';
    OperatingBusiness = 'years operating business';
    employees = 'employees';
    growthQuarterly = 'growth quarterly';
    growthYearly = 'growth yearly';
    OthersText = 'Any other leads which are not Active or Inactive';
    @track isAdvanceArea = 'slds-hide';
    @track isBasicArea = 'slds-show';
    isLinkedIn = true;
    isDBPedia = true;
    isZoomInfo = true;
    @track checked = false;
    @track defaultChecked;
    @track searchable = [];
    staticQuery = 'ACTIVE:\\n' + this.plusOpp + ' years operating business\\n' + this.posEmpNumber + ' employees\\n' + this.growthQuar + ' growth quarterly\\n' + this.growthYrly + ' growth yearly\\nINACTIVE:\\n' + this.negOpp + ' years operating business\\n' + this.negEmpNumber + ' employees\\n' + this.negGrowthQuar + ' growth quarterly\\n' + this.negGrowthYrly + ' growth yearly\\nOthers:\\nAny other leads which are not Active or Inactive';

 
    @track pageNo = 1;
    @track pageSize = 10;    

    get lastPage() {
        return  Math.ceil(this.leads.length / this.pageSize);
    }

    get disablePrev() {
        return this.pageNo == 1;
    }

    get disableNext() {
        return this.pageNo == Math.ceil(this.leads.length / this.pageSize);
    }

    remove_tags(html) {
        var html = html.replaceAll("<p>", "||p||").replaceAll("</p>", "||||p||||");
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        html = tmp.textContent || tmp.innerText;
        html = html.replaceAll("||p||", "").replaceAll("||||p||||", "\\n");
        return html.replaceAll("||||", "\\n")
    }


    get classifyoptions() {
        return [
            { label: 'NAICS Code', value: 'NAICS' },
            { label: 'SIC Code', value: 'SIC' },
            { label: 'None', value: 'None' },
        ];
    }

    handleRadioChange(event) {
        const selectedOption = event.detail.value;
        this.classifyValue = selectedOption;
        if (selectedOption == 'SIC') {
            this.displaySIC = true;
            this.displayNIAC = false;

        } else if (selectedOption == 'NAICS') {
            this.displayNIAC = true;
            this.displaySIC = false;

        } else if (selectedOption == 'None') {
            this.displayNIAC = false;
            this.displaySIC = false;

        }
    }

    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = 'slds-show';
    }

    closeModal() {
        // to close modal set isModalOpen tarck value as false

        this.isModalOpen = 'slds-hide';
        this.showData = 'slds-hide';
        window.open('/lightning/o/Lead/list?filterName=Recent', '_self');

    }

    get selectedValues() {
        return this.value.join(',');
    }

    handleLookupItemSelected(event) {
        var source = event.target.dataset.id;
        const searchKey = event.detail;

        if (source == 'NIAC') {
            this.NaicKey = searchKey;

        } else if (source == 'SIC') {
            this.SicKey = searchKey;
        }
    }

    handleChange(event) {
        let source = event.target.dataset.id;
        let checked = event.target.checked;

        if (source == 'linkedin') {
            this.isLinkedIn = checked;
        } else if (source == 'dbpedia') {
            this.isDBPedia = checked;
        } else if (source == 'zoominfo'){
            this.isZoomInfo = checked;
        }
    }


    // Select the all rows
    allSelected(event) {
        this.leads.forEach((item, index) => {
            item.defaultChecked = (event.target.checked ? true : false);
        });
    }


    handleToggle(event) {
        this.checked = !this.checked;
        if (this.checked == true) {

            this.isAdvanceArea = 'slds-show';
            this.isBasicArea = 'slds-hide';
            this.initialvalue = '<p><strong style="font-size: 16px;">ACTIVE</strong></p><p><span style="font-size: 16px;"> '+ this.plusOpp +' years operating business</span></p><p><span style="font-size: 16px;">'+ this.posEmpNumber +' employees</span></p><p><span style="font-size: 16px;">'+ this.growthQuar +' growth quarterly</span></p><p><span style="font-size: 16px;">'+ this.growthYrly +' growth yearly</span></p><p><strong style="font-family: sans-serif; font-size: 16px;">INACTIVE</strong></p><p><span style="font-family: sans-serif; font-size: 16px;">'+ this.negOpp +' years operating business</span></p><p><span style="font-family: sans-serif; font-size: 16px;"> '+ this.negEmpNumber +' employees</span></p><p><span style="font-family: sans-serif; font-size: 16px;">'+ this.negGrowthQuar +' growth quarterly</span></p><p><span style="font-family: sans-serif; font-size: 16px;">'+ this.negGrowthYrly +' growth yearly</span></p><p><strong style="font-family: sans-serif; font-size: 16px;">OTHERS</strong></p><p><span style="font-family: sans-serif; font-size: 16px;">Any other leads which are not Active or Inactive</span></p>';

        } else if (this.checked == false) {

            this.isAdvanceArea = 'slds-hide';
            this.isBasicArea = 'slds-show ';
        }
    }



    handleDefaultText() {

        this.initialvalue = event.target.value;
        this.defaultTextVal = this.remove_tags(this.initialvalue);

    }


    HandleCriteriaChange(event) {

        let criteriaval = event.target.dataset.id;

        if (criteriaval == "plusOpp") {
            this.plusOpp = event.target.value;
        } else if (criteriaval == "posEmpNumber") {
            this.posEmpNumber = event.target.value;
        } else if (criteriaval == "growthQuar") {
            this.growthQuar = event.target.value;
        } else if (criteriaval == "growthYrly") {
            this.growthYrly = event.target.value;
        } else if (criteriaval == "negOpp") {
            this.negOpp = event.target.value;
        } else if (criteriaval == "negEmpNumber") {
            this.negEmpNumber = event.target.value;
        } else if (criteriaval == "negGrowthQuar") {
            this.negGrowthQuar = event.target.value;
        } else if (criteriaval == "negGrowthYrly") {
            this.negGrowthYrly = event.target.value;
        }

        this.staticQuery = 'ACTIVE:\\n' + this.plusOpp + ' years operating business\\n' + this.posEmpNumber + ' employees\\n' + this.growthQuar + ' growth quarterly\\n' + this.growthYrly + ' growth yearly\\nINACTIVE:\\n' + this.negOpp + ' years operating business\\n' + this.negEmpNumber + ' employees\\n' + this.negGrowthQuar + ' growth quarterly\\n' + this.negGrowthYrly + ' growth yearly\\nOthers:\\nAny other leads which are not Active or Inactive';
        // console.log('static query ', this.staticQuery);
        this.initialvalue = '';


    }

    
    

    handlePrevious() {
        this.isModalOpen = 'slds-show';
        this.showData = 'slds-hide';
        this.initialvalue = this.initialvalue;
    }



    submitDetails() {
       let results = [];

        if (this.initialvalue) {
            this.defaultTextVal = this.remove_tags(this.initialvalue);
        } else {
            this.defaultTextVal = this.staticQuery;
        }

        // console.log('default query', this.defaultTextVal);

        let options = [];

        let selectedDataSources = [];
        if (this.isLinkedIn)
            selectedDataSources.push('linkedin');
        if (this.isDBPedia)
            selectedDataSources.push('dbpedia');
        if (this.isZoomInfo)
            selectedDataSources.push('zoominfo');    
        console.log('query ',this.defaultTextVal);
       //  console.log('dataSource',JSON.stringify(selectedDataSources));

        graphResponse({ leadIds: this.leadIds.split(','), queryData: this.defaultTextVal, dataSources: selectedDataSources, naicValue: this.NaicKey, sicValue: this.SicKey })
            .then(result => {
                console.log('result#' + JSON.stringify(result));
                this.leads = result;
              //  console.log('lead lengths',this.leads.length);

                this.leads.forEach((item, index) => {
                    // item.isSelected = false;
                    item.dataSourceStatus = item.options[0];
                    this.defaultChecked = item.defaultChecked;
                    let options = item.options;
                    item.options = [];
  
                    options.forEach((option, index) => {
                        item.options.push({ label: option, value: option });
                    });

                });

                this.searchable = [];

                this.leads.forEach((item, index) => {
                    if(index < this.pageSize)
                        this.searchable.push(item);
                });
               
                this.showSpinner = false;
                
            }).catch(error => {
                console.log('error#' + JSON.stringify(error));
                this.showSpinner = false;
            });

        this.showData = 'slds-show';
        this.isModalOpen = 'slds-hide';
    }


    handlePrevNext(event) {
        this.pageNo = event.target.name == 'prev' ? this.pageNo - 1 : this.pageNo + 1;

        this.searchable = this.leads.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize);
    }

    handleCheckboxChange(event) {
        //console.log('event.target.dataset.id = ' + event.target.dataset.id);
    
        this.leads.forEach((item, index) => {
            if(item.id == event.target.dataset.id)
                item.defaultChecked = (event.target.checked ? true : false);
        });
        
    
    }

    handleStatusChange(event) {
        this.leads[event.target.dataset.id].dataSourceStatus = event.target.value;
        // console.log('datasource ',this.leads[event.target.dataset.id].dataSourceStatus);
    }


    handleSave() {
        let leads = [];
        this.showSpinner = true;
        this.leads.forEach((item, index) => {
            if (item.defaultChecked) {
                let values = item.dataSourceStatus.split(' | ');
                // console.log('not classified pass ',JSON.stringify(values[0]));
                if (values[0] != 'NOT_CLASSIFIED') {
                    leads.push({
                        // "Id": item.id, "Status": values[1], "zeniadev__Datasource__c": values[0], "zeniadev__SICCode__c": item.SicCode, "zeniadev__Niacs_Code__c": item.NaicCode, "Industry": item.industry
                     "Id": item.id, "Status": values[1], "zeniadev__Datasource__c": '', "zeniadev__SICCode__c": item.SicCode, "zeniadev__Niacs_Code__c": item.NaicCode, "Industry": item.industry, 
                      "zeniadev__Annual_Growth__c": item.annual_growth, "zeniadev__No_Of_Employees__c" : item.no_of_employees, "zeniadev__Operating_Years__c" : item.operating_years, "zeniadev__Quarterly_Growth__c" :item.quarterly_growth

                    });
                }
                //  console.log('leads for push ' + JSON.stringify(this.leads));
            }
        });

        if (leads.length > 0) {
            saveLeads({ leads: leads })
                .then(result => {
                    if (result == 'Success')
                        window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
                    else console.log(result);
                    this.showSpinner = false;
                }).catch(error => {
                    console.log('error#' + JSON.stringify(error));
                });
        } else window.open('/lightning/o/Lead/list?filterName=zeniadev__ZeniaGraphListView', '_self');
    }



     get isDisplayNoRecords() {
        var isDisplay = true;
        if(this.leads){
            if(this.leads.length == 0){
                isDisplay = true;
            }else{
                isDisplay = false;
            }
        }
        return isDisplay;
    }

}