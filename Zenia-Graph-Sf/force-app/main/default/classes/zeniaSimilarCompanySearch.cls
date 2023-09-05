public class zeniaSimilarCompanySearch {
   
    @AuraEnabled
    public static string similarCompanySearch(String searchQuery){
        string zeniaResponse =  getsimilarCompanyResponse(searchQuery);
       
        return zeniaResponse;
    } 
    
    //get custom setting 
    public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    public static string getsimilarCompanyResponse(String searchQuery){
     //   System.debug('search Query '+searchQuery);
        string financialServices = 'Financial Services';
        String altrQuery = searchQuery.replace('Financial Services', '\''+financialServices+'\'' );
        
        system.debug('final query search query is '+altrQuery);
        
        String jsonBody = '{"query":"query sparqlGPTSearch($input:String!)\\r\\n{\\r\\n    sparqlGPTSearch(input:$input)\\r\\n    {\\r\\n        graph_url\\r\\n        records\\r\\n    } \\r\\n}","variables":{"input":"'+altrQuery+'"}}';  
        system.debug('json request body '+jsonBody);
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
        Http h = new Http();
        // Instantiate a new HTTP request
        // Specify request properties such as the endpoint, the POST method, etc. 
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniacs.Endpoint__c);
        req.setMethod(zeniacs.Method__c);
        req.setHeader('Content-Type', 'application/json'); 
        req.setBody(jsonBody);
        req.setTimeout(30000);
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        system.debug('Response body'+res.getBody());
        return res.getBody();
    }
}