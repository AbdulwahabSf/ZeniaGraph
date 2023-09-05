import { LightningElement } from 'lwc';
import NlpSearchPrompt from '@salesforce/apex/zeniaNLPPrompt.getClassifiedData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ZeniaNLPPrompt extends LightningElement {

  initialvalue = 'find me the profit, current year revenue and last quarterly revenue for Apple';
  displayContent = false;
  isLoading = false;
  showKGUrl;
  showKgCompanies = [];
  columns = [];
  data = [];

  submitSearchHandler(event) {

    let userInput = this.template.querySelector('lightning-textarea[data-id="userinputText"]');
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
      console.log('response' + response);
      let graphResponse = JSON.parse(response);
      this.showKgUrl = '';
      this.showKgCompanies = [];
      // this.companyList = [];
      if (graphResponse.data.getGraphResultsByNLPQuery.graph_url) {
        this.showKGUrl = graphResponse.data.getGraphResultsByNLPQuery.graph_url;
        // console.log('this.showKgUrl = '+ this.showKGUrl);
        this.showKgCompanies = graphResponse.data.getGraphResultsByNLPQuery.records;
        // console.log('showKgCompanies ='+this.showKgCompanies);
        this.processRecords(graphResponse.data.getGraphResultsByNLPQuery.records);

        this.isLoading = false;
        this.displayContent = true;
      } else {
        this.isLoading = false;
        this.displayContent = false;
      }

    }).catch(error => {
      console.log('Error', error);
      this.isLoading = false;
    });
  }

  openShowKg() {
    var url = this.showKGUrl;
    window.open(url, "_blank");
  }

  processRecords(records) {
    console.log('inside processRecords');
    let columns = [];
    let data = [];
    
    if(records && records.length > 0) {
      records.forEach(function (item) {
        for(const key in item) {
          console.log('key = ' + key + ', value = ' + item[key]);

          if(item[key] && item[key] != '' && !columns.includes(key)) {
            columns.push(key);
          }
        }
      });

      records.forEach(function (item) {
        let values = [];
          
        for(const key in item) {
          console.log('key = ' + key + ', value = ' + item[key]);

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
          console.log('str = ' + str);
        });

        columns[index] = strList.join(' ');
        console.log('item = ' + item);
      });
    }

    this.columns = columns;
    this.data = data;
    
    console.log('this.columns = ' + JSON.stringify(this.columns));
    console.log('this.data = ' + JSON.stringify(this.data));
  }


}