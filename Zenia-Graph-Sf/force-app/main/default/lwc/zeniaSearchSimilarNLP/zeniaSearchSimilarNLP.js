import { LightningElement, api, track } from 'lwc';
import getClassifiedData from '@salesforce/apex/zeniaSerachSimilarNLP.getClassifiedData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ZeniaSimilarCompanySearch extends LightningElement {

  initialvalue = 'find me the revenue, profit, description, headquarters, last revenue, last quarter revenue and name for Apple';
  @track displayContent = false;
  searchQuery;
  data;
  @track queryData = [];
  isLoading = false;

  sematicURL;
  showKgUrl = '';
  redisUrl = '';
  graphDbUrl = '';

  isAssistant;

  connectedCallback() {
    this.queryData = [];
  }

  submitSearchHandler(event) {
    this.scrollDown();
      
    let userInput = this.template.querySelector('lightning-textarea[data-id="userinputText"]');

    if (userInput && userInput.value) {
      console.log('text area is ',userInput.value);
      
      this.displayContent = true;
      
      this.queryData.push({ 
        contentshow: true, content: userInput.value, isAssistant: false 
      });
      
      this.fetchUserInp(userInput.value);

      userInput.value = '';
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
    //console.log('user Input ',query);
    getClassifiedData({ inputText: query }).then(response => {
      
      try {
        console.log('response' + JSON.stringify(response));
    
        this.showKgUrl = '';
        this.redisUrl = '';
        this.graphDbUrl = '';

        if(response.ShowKgUrl) {
          let showKgUrl = JSON.parse(response.ShowKgUrl);

          if(showKgUrl?.data?.showKgWithAttributes?.graph_url) {
              this.showKgUrl = showKgUrl.data.showKgWithAttributes.graph_url;
          }
        }
        console.log('this.showKgUrl = ' + this.showKgUrl);

        if(response.RedisUrl) {
          let redisUrl = JSON.parse(response.RedisUrl);

          if(redisUrl?.data?.getSimilarCompaniesByName?.length > 0) {
              this.redisUrl = redisUrl.data.getSimilarCompaniesByName[0].graph_url;
          }
        }
        console.log('this.redisUrl = ' + this.redisUrl);

        if(response.GraphDbUrl) {
          let graphDbUrl = JSON.parse(response.GraphDbUrl);

          if(graphDbUrl?.data?.getSimilarCompaniesByName?.length > 0) {
              this.graphDbUrl = graphDbUrl.data.getSimilarCompaniesByName[0].graph_url;
          }
        }
        console.log('this.graphDbUrl = ' + this.graphDbUrl);

        this.isLoading = false;
        
        if(this.showKgUrl != '' || this.redisUrl != '' || this.graphDbUrl != '') {
          console.log('Found URLs');
          this.queryData.push({ 
            content: '', isAssistant: true,
            showKgUrl: (this.showKgUrl ? this.showKgUrl : null),
            redisUrl: (this.redisUrl ? this.redisUrl : null),
            graphDbUrl: (this.graphDbUrl ? this.graphDbUrl : null)
          });
        } else {
          console.log('Not found URLs');
          this.queryData.push({ 
            contentshow: false, isAssistant: false
          });
        }

        this.scrollDown();
      } catch(error) {
        console.log('error = ' + error);
      }

    }).catch(error => {
      console.log('Error', error);
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

}