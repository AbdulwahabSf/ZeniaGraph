import { LightningElement, api, track } from 'lwc';
import similarCompanySearch from '@salesforce/apex/zeniaSimilarCompanySearch.similarCompanySearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ZeniaSimilarCompanySearch extends LightningElement {

  @track initialvalue = 'find me the companies that have founded after 2020';
  displayContent = false;
  searchQuery;
  queryData = [];
  isLoading = false;
  showKGUrl;
  companyList = [];
  columns = [];
  data = [];
  companyNames;
  showKgCompanies = [];
  noRec = false;

  //voice to text 
   _recognition;

   connectedCallback() {
      window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if ("SpeechRecognition" in window) {
         this._recognition = new webkitSpeechRecognition() || new SpeechRecognition();
         this._recognition.lang = 'en-US';
      }
   }

  submitSearchHandler(event) {

    let userInput = this.template.querySelector('textarea[data-id="userinputText"]');
    if (userInput && userInput.value) {
      let userInp = { content: userInput.value, isAssistant: false }
      this.queryData.push(userInp);
      this.fetchUserInp(userInput.value);
     // userInput.value = '';
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'value missing',
          message: 'Please enter SPARQL Query to proceed!',
          variant: 'error',
          mode: 'pester'
        }));
    }
  }
  
  fetchUserInp(query) {
    this.isLoading = true;
    similarCompanySearch({ searchQuery: query }).then(response => {
      let graphResponse = JSON.parse(response);
       this.showKgUrl = '';
       this.showKgCompanies = [];

      let result = graphResponse.data.sparqlGPTSearch.graph_url;
      if (result != null) {
           this.showKGUrl = graphResponse.data.sparqlGPTSearch.graph_url;
           this.showKgCompanies = graphResponse.data.sparqlGPTSearch.records;
           this.processRecords(this.showKgCompanies);  
           this.isLoading = false;
           this.displayContent = true;
           this.noRec = false;
      } else {
        this.isLoading = false;
        this.displayContent = false;
        this.noRec = true;
      }

    }).catch(error => {
     // console.log('Error', error);
      this.isLoading = false;
    });
  }

  scrollDown() {
    let section = this.template.querySelector('.scroll-section');
    if(section) {
      setTimeout(() => {
        section.scrollTo(0, section.scrollHeight);
      }, 100);
    } 
  }

  openShowKg(){
    var url = this.showKGUrl;
     window.open(url, "_blank");
  }

  get displayContent(){
    return this.graph_url != null;
  }

   handleClick(event) {
      this._recognition.start();
      this._recognition.onresult = (event) => {
         const msg = event.results[0][0].transcript;
         this.handleSpeechRecognized(msg);
      }
   }
    handleSpeechRecognized(msg) {
      this.initialvalue = '';
      this.initialvalue = msg;
    }

   processRecords(records) {
   
    let columns = [];
    let data = [];
    
    if(records && records.length > 0) {
      records.forEach(function (item) {
        for(const key in item) {
          if(item[key] && item[key] != '' && !columns.includes(key)) {
            columns.push(key);
          }
        }
      });

      records.forEach(function (item) {
        let values = [];
        
        for(const key in item) {
          if(columns.includes(key)) {
            values.push((item[key] ? item[key] : ''));
          }
        }
        data.push(values);
      });
    }

    if(columns) {
      columns.forEach((item, index) => {
        let strList = item.split('_');
        
        strList.forEach((str, index1) => {
          strList[index1] = str.charAt(0).toUpperCase() + str.slice(1);
         
        });

        columns[index] = strList.join(' ');
       
      });
    }
    this.columns = columns;
    this.data = data;
  }
}