import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import graphResponse from '@salesforce/apex/generateApiPayloadResponse.getGraphPayload';
import saveLeads from '@salesforce/apex/generateApiPayloadResponse.saveLeads';
import getshowkgresponse from '@salesforce/apex/generateApiPayloadResponse.getshowkgresponse';

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
    plusOpp = '+20';
    posEmpNumber = '+50000';
    growthQuar = '+5%';
    growthYrly = '+3%';
    negOpp = '-20';
    negEmpNumber = '-60000';
    negGrowthQuar = '-5%';
    negGrowthYrly = '-2%';
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

    @track sicOptions = [];
    @track naicOptions = [];
    @track industryOptions = [];
    @track headquarterOptions = [];
    @track employeesOptions = [];
    @track qrGrowthOptions = [];
    @track anGrowthOptions = [];
    @track statusOptions = [];
  
    @track selSIC = [];
    @track selIndustry = [];
    @track selNAICS = [];
    @track selHeadquarters = [];

    selStatus = '';
    selNoOfEmployees = '';
    selQuarterlyGrowth = '';
    selAnnualGrowth = '';

    @track pageNo = 1;
    @track pageSize = 10;

    // NoOfEmployees variables
    @track empBetweenFrom;
    @track empBetweenTo;
    @track empFrom;

    // QuarterlyGrowth variables
    @track qtrGrowthBetweenFrom;
    @track qtrGrowthBetweenTo;
    @track qtrGrowthFrom;

    // AnnualGrowth variables
    @track annGrowthBetweenFrom;
    @track annGrowthBetweento;
    @track annGrowthFrom;

    @track companyName = [];
    response;

    @track value;
    @track allValues = [];
    @track eventValue;
    
     @track options = [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Finished', value: 'Finished' },
    ];

    operatorOptions = [
        { label: '--None--', value: '' },
        { label: 'Between', value: 'Between' },
        { label: 'Greater Than', value: 'Greater Than' },
        { label: 'Less Than', value: 'Less Than' },
        { label: 'Equal to', value: 'Equal to' },
        { label: 'Greater Than Equal To', value: 'Greater Than Equal To' },
        { label: 'Less Than Equal To', value: 'Less Than Equal To' }
    ];

    get tableData() {
        return this.searchable.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize);
    }

    get lastPage() {
         return Math.ceil(this.searchable.length / this.pageSize);
    }
      
    get disablePrev() {
        return this.pageNo == 1;
    }

    get disableNext() {
        return this.pageNo == Math.ceil(this.searchable.length / this.pageSize);
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

      get eventOptions() {
        return [
          { label: '--None--', value: '' },
          { label: 'liveodsccom', value: 'liveodsccom' }
        ];
    }


    get showNoOfEmployeesBetween() {
        return this.selNoOfEmployees == 'Between';
    }

    get showNoOfEmployeesNotBetween() {
        return this.selNoOfEmployees && this.selNoOfEmployees != 'Between';
    }

    get showQuarterlyGrowthBetween() {
        return this.selQuarterlyGrowth == 'Between';
    }

    get showQuarterlyGrowthNotBetween() {
        return this.selQuarterlyGrowth && this.selQuarterlyGrowth != 'Between';
    }

    get showAnnualGrowthBetween() {
        return this.selAnnualGrowth == 'Between';
    }

    get showAnnualGrowthNotBetween() {
        return this.selAnnualGrowth && this.selAnnualGrowth != 'Between';
    }

    get selSICCount() {
        return this.selSIC && this.selSIC.length > 0 ? ('(' + this.selSIC.length + ' selected)') : '';
    }

    get selIndustryCount(){
        return this.selIndustry && this.selIndustry.length > 0 ? ('(' + this.selIndustry.length + ' selected)') : '';

    }
     get selNAICSCount(){
        return this.selNAICS && this.selNAICS.length > 0 ? ('(' + this.selNAICS.length + ' selected)') : '';

    }
     get selHeadQrCount(){
        return this.selHeadquarters && this.selHeadquarters.length > 0 ? ('(' + this.selHeadquarters.length + ' selected)') : '';

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

    handleEventChange(event){
        this.eventValue = event.detail.value;
    }

    handleChange(event) {
        let source = event.target.dataset.id;
        let checked = event.target.checked;

        if (source == 'linkedin') {
            this.isLinkedIn = checked;
        } else if (source == 'dbpedia') {
            this.isDBPedia = checked;
        } else if (source == 'zoominfo') {
            this.isZoomInfo = checked;
        }
    }


    handleToggle(event) {
        this.checked = !this.checked;
        if (this.checked == true) {

            this.isAdvanceArea = 'slds-show';
            this.isBasicArea = 'slds-hide';
            this.initialvalue = '<p><strong style="font-size: 16px;">ACTIVE</strong></p><p><span style="font-size: 16px;"> ' + this.plusOpp + ' years operating business</span></p><p><span style="font-size: 16px;">' + this.posEmpNumber + ' employees</span></p><p><span style="font-size: 16px;">' + this.growthQuar + ' growth quarterly</span></p><p><span style="font-size: 16px;">' + this.growthYrly + ' growth yearly</span></p><p><strong style="font-family: sans-serif; font-size: 16px;">INACTIVE</strong></p><p><span style="font-family: sans-serif; font-size: 16px;">' + this.negOpp + ' years operating business</span></p><p><span style="font-family: sans-serif; font-size: 16px;"> ' + this.negEmpNumber + ' employees</span></p><p><span style="font-family: sans-serif; font-size: 16px;">' + this.negGrowthQuar + ' growth quarterly</span></p><p><span style="font-family: sans-serif; font-size: 16px;">' + this.negGrowthYrly + ' growth yearly</span></p><p><strong style="font-family: sans-serif; font-size: 16px;">OTHERS</strong></p><p><span style="font-family: sans-serif; font-size: 16px;">Any other leads which are not Active or Inactive</span></p>';

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
        this.initialvalue = '';


    }

    handlePrevious() {
        this.isModalOpen = 'slds-show';
        this.showData = 'slds-hide';
        this.initialvalue = this.initialvalue;
    }
   
    submitDetails() {
   
     this.sicOptions = [];
     this.industryOptions = [];
     this.naicOptions = [];
     this.statusOptions = [];
     this.headquarterOptions = [];
     this.selIndustry = [];
     this.selNAICS = [];
     this.selSIC = [];
     this.selHeadquarters = [];
     
        let results = [];
        this.showSpinner = true;

        if (this.initialvalue) {
            this.defaultTextVal = this.remove_tags(this.initialvalue);
        } else {
            this.defaultTextVal = this.staticQuery;
        }

        let options = [];

        let selectedDataSources = [];
       
        
        graphResponse({ leadIds: this.leadIds.split(','), queryData: this.defaultTextVal, dataSources: selectedDataSources, naicValue: this.NaicKey, sicValue: this.SicKey ,eventName: this.eventValue})            
        .then(result => {
           this.leads = result;
                this.sicOptions.push({ label: '--None--', value: '' });
                this.naicOptions.push({ label: '--None--', value: '' });
                this.industryOptions.push({ label: '--None--', value: '' });
                this.headquarterOptions.push({ label: '--None--', value: '' });
                this.employeesOptions.push({ label: '--None--', value: '' });
                this.statusOptions.push({ label: '--None--', value: '' });
    
               
                let sicRecs = [], naicRecs = [], industryRecs = [], headquarterRecs = [], noofEmployeesRecs = [], qrGrowthRecs = [], anGrowthRecs = [], statusRecs = [];

                this.leads.forEach((item, index) => {
                    this.defaultChecked = item.defaultChecked;

                    let sicCodes = (item.SicCode && item.SicCode != '' ? item.SicCode.split(', ') : []);
                    sicCodes.forEach((item1) => {
                        if (item1 && item1 != '' && !sicRecs.includes(item1)) {
                            this.sicOptions.push({ label: item1, value: item1 });
                            sicRecs.push(item1);
                        }
                    });

                    let naicCodes = (item.NaicCode && item.NaicCode != '' ? item.NaicCode.split(', ') : []);
                    naicCodes.forEach((item1) => {
                        if (item1 && item1 != '' && !naicRecs.includes(item1)) {
                            this.naicOptions.push({ label: item1, value: item1 });
                            naicRecs.push(item1);
                        }
                    });

                    let industries = (item.industry && item.industry != '' ? item.industry.split(', ') : []);
                    industries.forEach((item1) => {
                        if (item1 && item1 != '' && !industryRecs.includes(item1)) {
                            this.industryOptions.push({ label: item1, value: item1 });
                            industryRecs.push(item1);
                        }
                    });

                    if (item.headquarters && item.headquarters != '' && !headquarterRecs.includes(item.headquarters)) {
                        this.headquarterOptions.push({ label: item.headquarters, value: item.headquarters });
                        headquarterRecs.push(item.headquarters);
                    }

                    if (item.no_of_employees && item.no_of_employees != '' && !noofEmployeesRecs.includes(item.no_of_employees)) {
                        this.employeesOptions.push({ label: item.no_of_employees, value: item.no_of_employees });
                        noofEmployeesRecs.push(item.no_of_employees);
                    }
                    if (item.quarterly_growth && item.quarterly_growth != '' && !qrGrowthRecs.includes(item.quarterly_growth)) {
                        this.qrGrowthOptions.push({ label: item.quarterly_growth, value: item.quarterly_growth });
                        qrGrowthRecs.push(item.quarterly_growth);
                    }
                    if (item.annual_growth && item.annual_growth != '' && !anGrowthRecs.includes(item.annual_growth)) {
                        this.anGrowthOptions.push({ label: item.annual_growth, value: item.annual_growth });
                        anGrowthRecs.push(item.headquarters);
                    }
                    if (item.Status && item.Status != '' && !statusRecs.includes(item.Status)) {
                        this.statusOptions.push({ label: item.Status, value: item.Status });
                        statusRecs.push(item.Status);
                    }

                });

                this.searchable = [];

                this.leads.forEach((item, index) => {
                    //if (index < this.pageSize)
                        this.searchable.push(item);
                });

                this.showSpinner = false;

            }).catch(error => {
               // console.log('error#' + JSON.stringify(error));
                this.showSpinner = false;
            });

        this.showData = 'slds-show';
        this.isModalOpen = 'slds-hide';
    }

    handleFilterChange(event) {
        let name = event.target.name;
        let value = event.target.value;

        if (name == 'SIC') {
            if(!this.selSIC.includes(value)){
                this.selSIC.push(value);
            }
            event.target.value = '';
        }else  if (name == 'NAICS') {
             if(!this.selNAICS.includes(value)){
                this.selNAICS.push(value);
            }
             event.target.value = '';
          
        }else if (name == 'Industry') {
            if(!this.selIndustry.includes(value)){
                this.selIndustry.push(value);
            }
             event.target.value = '';
        } else if (name == 'Headquarters') {
            if(!this.selHeadquarters.includes(value)){
                this.selHeadquarters.push(value);
            }
             event.target.value = '';
        } else if (name == 'NoOfEmployees') {
            this.selNoOfEmployees = value;

            if (!this.selNoOfEmployees) {
                this.empBetweenFrom = null;
                this.empBetweenTo = null;
                this.empFrom = null;
            } else if (this.selNoOfEmployees == 'Between') {
                this.empFrom = null;
            } else {
                this.empBetweenFrom = null;
                this.empBetweenTo = null;
            }
        } else if (name == 'QuarterlyGrowth') {
            this.selQuarterlyGrowth = value;

            if (!this.selQuarterlyGrowth) {
                this.qtrGrowthBetweenFrom = null;
                this.qtrGrowthBetweenTo = null;
                this.qtrGrowthFrom = null;
            } else if (this.selQuarterlyGrowth == 'Between') {
                this.qtrGrowthFrom = null;
            } else {
                this.qtrGrowthBetweenFrom = null;
                this.qtrGrowthBetweenTo = null;
            }
        } else if (name == 'AnnualGrowth') {
            this.selAnnualGrowth = value;

            if (!this.selAnnualGrowth) {
                this.annGrowthBetweenFrom = null;
                this.annGrowthBetweento = null;
                this.annGrowthFrom = null;
            } else if (this.selAnnualGrowth == 'Between') {
                this.annGrowthFrom = null;
            } else {
                this.annGrowthBetweenFrom = null;
                this.annGrowthBetweento = null;
            }
        } else if (name == 'Status') {
            this.selStatus = value;
        }

        this.filterData();
    }

    handleRemove(event){
        let id = event.target.dataset.id;
        let name = event.target.name;

        if (id == 'SIC') {
            this.selSIC.splice(this.selSIC.indexOf(name), 1);
            this.refs.sicCmp.value = '';
        }else if(id == 'NAICS'){
            this.selNAICS.splice(this.selNAICS.indexOf(name),1);
            this.refs.naicCmp.value = '';
        }else if(id == 'Industry'){
            this.selIndustry.splice(this.selIndustry.indexOf(name),1);
            this.refs.indCmp.value = '';
        } if(id == 'headquarter'){
            this.selHeadquarters.splice(this.selHeadquarters.indexOf(name),1);
            this.refs.headCmp.value = '';
        }

        this.filterData();
    }

    handleOperatorvalues(event) {
        let id = event.target.dataset.id;
        let name = event.target.name;
        let value = event.target.value;

        if (id == 'NoOfEmployees') {
            if (name == 'empBetweenFrom') {
                this.empBetweenFrom = value;
            } else if (name == 'empBetweenTo') {
                this.empBetweenTo = value;
            } else if (name == 'empFrom') {
                this.empFrom = value;
            }
        } else if (id == 'QuarterlyGrowth') {
            if (name == 'qtrGrowthBetweenFrom') {
                this.qtrGrowthBetweenFrom = value;
            } else if (name == 'qtrGrowthBetweenTo') {
                this.qtrGrowthBetweenTo = value;
            } else if (name == 'qtrGrowthFrom') {
                this.qtrGrowthFrom = value;
            }
        } else if (id == 'AnnualGrowth') {
            if (name == 'annGrowthBetweenFrom') {
                this.annGrowthBetweenFrom = value;
            } else if (name == 'annGrowthBetweenTo') {
                this.annGrowthBetweenTo = value;
            } else if (name == 'annGrowthFrom') {
                this.annGrowthFrom = value;
            }
        }

        this.filterData();
    }

    filterData() {
        
        try {
            let searchable = [];

            this.leads.forEach((item, index) => {
                let isValid = true;

                if (this.selSIC && this.selSIC.length > 0 && (!item.SicCode || !this.validateMultiSelect(item.SicCode, this.selSIC)))
                    isValid = false;
                if (this.selNAICS && this.selNAICS.length > 0 && (!item.NaicCode || !this.validateMultiSelect(item.NaicCode, this.selNAICS))) 
                    isValid = false;
                if (this.selIndustry && this.selIndustry.length > 0 && (!item.industry || !this.validateMultiSelect(item.industry, this.selIndustry))) 
                    isValid = false;
                if (this.selHeadquarters && this.selHeadquarters.length > 0 && (!item.headquarters || !this.validateMultiSelect(item.headquarters, this.selHeadquarters))) 
                    isValid = false;
                if (this.selStatus && (!item.Status || !item.Status.includes(this.selStatus)))
                    isValid = false;

                isValid = this.validateOperatorFilters(isValid, this.selNoOfEmployees, this.empBetweenFrom, this.empBetweenTo, this.empFrom, item.no_of_employees, 'INTEGER');
                isValid = this.validateOperatorFilters(isValid, this.selQuarterlyGrowth, this.qtrGrowthBetweenFrom, this.qtrGrowthBetweenTo, this.qtrGrowthFrom, item.quarterly_growth, 'FLOAT');
                isValid = this.validateOperatorFilters(isValid, this.selAnnualGrowth, this.annGrowthBetweenFrom, this.annGrowthBetweento, this.annGrowthFrom, item.annual_growth, 'FLOAT');

                //if (isValid && searchable.length < this.pageSize)
                if (isValid)
                    searchable.push(item);
            });

            this.searchable = searchable;
            this.pageNo = 1;
        } catch (err) {
            console.log('err = ' + err);
        }
    }

    validateMultiSelect(value, selValues) {
        let isValid = false;

        selValues.forEach((item) => {
            if(value.includes(item)) {
                isValid = true;
            }
        });
        return isValid;
    }

    validateOperatorFilters(isValid, operator, betweenFromValue, betweenToValue, fromValue, actualValue, type) {
        
        if(type == 'INTEGER') {
            if (operator == 'Between' && betweenFromValue && betweenToValue
                && (!actualValue || !(parseInt(betweenFromValue) <= parseInt(actualValue) && parseInt(betweenToValue) >= parseInt(actualValue))))
                isValid = false;

            if (operator && operator != 'Between' && fromValue) {
                if (!actualValue
                    || (operator == 'Greater Than' && !(parseInt(fromValue) < parseInt(actualValue)))
                    || (operator == 'Less Than' && !(parseInt(fromValue) > parseInt(actualValue)))
                    || (operator == 'Equal to' && !(parseInt(fromValue) == parseInt(actualValue)))
                    || (operator == 'Greater Than Equal To' && !(parseInt(fromValue) <= parseInt(actualValue)))
                    || (operator == 'Less Than Equal To' && !(parseInt(fromValue) >= parseInt(actualValue)))
                )
                    isValid = false;
            }
        } else if(type == 'FLOAT') {
            if (operator == 'Between' && betweenFromValue && betweenToValue
                && (!actualValue || !(parseFloat(betweenFromValue) <= parseFloat(actualValue) && parseFloat(betweenToValue) >= parseFloat(actualValue))))
                isValid = false;

            if (operator && operator != 'Between' && fromValue) {
                if (!actualValue
                    || (operator == 'Greater Than' && !(parseFloat(fromValue) < parseFloat(actualValue)))
                    || (operator == 'Less Than' && !(parseFloat(fromValue) > parseFloat(actualValue)))
                    || (operator == 'Equal to' && !(parseFloat(fromValue) == parseFloat(actualValue)))
                    || (operator == 'Greater Than Equal To' && !(parseFloat(fromValue) <= parseFloat(actualValue)))
                    || (operator == 'Less Than Equal To' && !(parseFloat(fromValue) >= parseFloat(actualValue)))
                )
                    isValid = false;
            }
        }
        
        return isValid;
    }

    handlePrevNext(event) {
        this.pageNo = event.target.name == 'prev' ? this.pageNo - 1 : this.pageNo + 1;
        //this.searchable = this.leads.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize);
      
    }

    // Select the all rows
    allSelected(event) {
        this.leads.forEach((item, index) => {
            item.defaultChecked = (event.target.checked ? true : false);
        });
    }
    
    handleCheckboxChange(event) {
        // console.log('event.target.dataset.id = ' + event.target.dataset.id);
        //  this.showkgcompanies = event.target.dataset.id;

        this.leads.forEach((item, index) => {
            if (item.company == event.target.dataset.id)
                item.defaultChecked = (event.target.checked ? true : false);
        });
    }

    openShowKg() {
        this.companyName = [];
        this.leads.forEach((item, index) => {
            if (item.defaultChecked) {
                this.companyName.push(item.company);
            }
        });
        //  console.log('company Names are '+this.companyName);
        getshowkgresponse({ companyList: this.companyName }).then(response => {
            this.response = JSON.parse(response);
            console.log('response', this.response.data);
            window.open(this.response.data.showGraphDbKg[0].graph_url, '_blank');
        }).catch(error => {
            console.log('Error', error);
        });
    }

    handleSave() {
        let leads = [];
        this.showSpinner = true;
        this.leads.forEach((item, index) => {
            if (item.defaultChecked) {
                let values = item.Status;
                // console.log('not classified pass ',JSON.stringify(values[0]));
                if (values != 'NOT_CLASSIFIED') {
                    leads.push({
                        // "Id": item.id, "Status": values[1], "zeniadev__Datasource__c": values[0], "zeniadev__SICCode__c": item.SicCode, "zeniadev__Niacs_Code__c": item.NaicCode, "Industry": item.industry
                        "Id": item.id, "Company": item.company, "Status": item.Status, "zeniadev__SICCode__c": item.SicCode, "zeniadev__Niacs_Code__c": item.NaicCode, "Industry": item.industry,
                        "LastName": item.company, "zeniadev__Headquarters__c": item.headquarters,
                        "zeniadev__Annual_Growth__c": item.annual_growth, "zeniadev__No_Of_Employees__c": item.no_of_employees, "zeniadev__Operating_Years__c": item.operating_years, "zeniadev__Quarterly_Growth__c": item.quarterly_growth
                    });
                }
            }
        });

        //console.log('leads for push ' + leads.length);
        // console.log('leads for push ' + JSON.stringify(leads));

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
        if (this.leads) {
            if (this.leads.length == 0) {
                isDisplay = true;
            } else {
                isDisplay = false;
            }
        }
        return isDisplay;
    }

}