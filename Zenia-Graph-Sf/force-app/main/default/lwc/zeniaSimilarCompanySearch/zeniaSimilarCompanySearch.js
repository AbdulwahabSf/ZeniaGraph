import { LightningElement, api, track } from 'lwc';
import similarCompanySearch from '@salesforce/apex/zeniaSimilarCompanySearch.similarCompanySearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ZeniaSimilarCompanySearch extends LightningElement {

  initialvalue = 'find me the companies that have founded after 2020';
  displayContent = false;
  searchQuery;
  queryData = [];
  isLoading = false;
  showKGUrl;
  companyList = [];
  companyNames;
  showKgCompanies = [];
  submitSearchHandler(event) {

    let userInput = this.template.querySelector('lightning-textarea[data-id="userinputText"]');
    if (userInput && userInput.value) {
      // console.log('text area is ',userInput.value);
     // this.displayContent = true;
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
    // let assistantInput  = {isAssistant = true};  
    similarCompanySearch({ searchQuery: query }).then(response => {
      console.log('response' + response);
      let graphResponse = JSON.parse(response);
       this.showKgUrl = '';
       this.showKgCompanies = [];
      // this.companyList = [];
      if (graphResponse.data.sparqlGPTSearch.graph_url) {
        // window.open(graphResponse.data.sparqlGPTSearch.graph_url, '_blank');
       // console.log('response is ', graphResponse);
          this.showKGUrl = graphResponse.data.sparqlGPTSearch.graph_url;
          console.log('this.showKgUrl = '+ this.showKGUrl);
           this.showKgCompanies = graphResponse.data.sparqlGPTSearch.records;
          console.log('showKgCompanies ='+this.showKgCompanies);
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

    // let section = this.template.querySelector('scroll-section');
    // section.scrollTo(0, section.scrollHeight);
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

}