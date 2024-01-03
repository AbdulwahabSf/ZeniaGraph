import { LightningElement, track } from 'lwc';
import NlpSearchPrompt from '@salesforce/apex/zeniaNLPPrompt.getClassifiedData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ZeniaNLPPrompt extends LightningElement {

  @track initialvalue = 'find me the profit, current year revenue and last quarterly revenue for Apple';
  displayContent = false;
  isLoading = false;
  showKGUrl;
  showKgCompanies = [];
  columns = [];
  data = [];
  noRec = false;


  //voice to text 
  _recognition;

  connectedCallback() {
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if ("SpeechRecognition" in window) {
      this._recognition = new webkitSpeechRecognition() || new SpeechRecognition();
      this._recognition.lang = 'en-US';
      //this._recognition.continuous = true;

    }
  }

  handleClick(event) {
  
    this._recognition.start();
    //When a result has been successfully recognized, the result event fires
    this._recognition.onresult = (event) => {
      const msg = event.results[0][0].transcript;
      this.handleSpeechRecognized(msg);
    }
  }
  handleSpeechRecognized(msg) {
    this.initialvalue = '';
    this.initialvalue = msg;
    
  }

  submitSearchHandler(event) {

    let userInput = this.template.querySelector('textarea[data-id="userinputText"]');
    if (userInput && userInput.value) {
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
    NlpSearchPrompt({ inputText: query }).then(response => {
      let graphResponse = JSON.parse(response);
      this.showKgUrl = '';
      this.showKgCompanies = [];
      let result = graphResponse.data.getGraphResultsByNLPQuery.graph_url;
      if (result != null) {
        this.showKGUrl = graphResponse.data.getGraphResultsByNLPQuery.graph_url;
        this.showKgCompanies = graphResponse.data.getGraphResultsByNLPQuery.records;
        this.processRecords(this.showKgCompanies);
        this.displayContent = true;
        this.isLoading = false;
        this.noRec = false;
      } else {
        this.isLoading = false;
        this.noRec = true;
        this.displayContent = false;
      }
    }).catch(error => {
     // console.log('Error', error);
      this.isLoading = false;
    });
  }

  openShowKg() {
    var url = this.showKGUrl;
    window.open(url, "_blank");
  }

  processRecords(records) {

    let columns = [];
    let data = [];

    if (records && records.length > 0) {
      records.forEach(function (item) {
        for (const key in item) {
          if (item[key] && item[key] != '' && !columns.includes(key)) {
            columns.push(key);
          }
        }
      });

      records.forEach(function (item) {
        let values = [];

        for (const key in item) {
          if (columns.includes(key)) {
            values.push((item[key] ? item[key] : ''));
          }
        }
        data.push(values);
      });
    }

    if (columns) {
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