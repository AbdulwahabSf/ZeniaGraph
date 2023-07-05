public class zeniaSimilarCompanyListResponseHandler {
    @AuraEnabled
    public static string similarCompanyList(List<String> leadIds){
        system.debug('IDs'+leadIds);
        List<String> leadcompany = new List<String>();
        map<String, String> mapleadcom = new map<String, String>();
         List<Lead> leads = [Select Id, Company, Datasource__c from Lead where Id IN :leadIds];
        
        for(Lead ld : leads){
            leadcompany.add(ld.Company);
            mapleadcom.put('name', ld.Company);
			mapleadcom.put('source',ld.Datasource__c);     
        
        }
        
        String SimilarCompanyResponse = getsimilarCompanyResponse(leadcompany, mapleadcom );
        
        return SimilarCompanyResponse;
    }
    //get custom setting 
    
     public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    
    public static string getsimilarCompanyResponse(list<String> company_lis, Map<String,String> mapleadcom){
        System.debug('source company '+mapleadcom);
        System.debug('CompanyName '+company_lis);
        String jsonBody = '{"query":"query getSimilarCompaniesByName($name: String!, $source: String!)\\r\\n{\\r\\n    getSimilarCompaniesByName(name: $name, source: $source)\\r\\n   {\\r\\n   graph_url,\\r\\n    records{name, NAICS, SIC, industry, source,vector_score}\\r\\n    } \\r\\n}","variables":'+json.serialize(mapleadcom)+'}' ;  
        system.debug('json request body '+jsonBody);
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
                Http h = new Http();
        //"variables":'+json.serialize(mapleadcom)+'}};
                // Instantiate a new HTTP request
                // Specify request properties such as the endpoint, the POST method, etc. 
                HttpRequest req = new HttpRequest();
                req.setEndpoint(zeniacs.Endpoint__c);
                req.setMethod(zeniacs.Method__c);
                req.setHeader('Content-Type', 'application/json');
                req.setBody(jsonBody);
                
                // Send the request, and return a response
                HttpResponse res = h.send(req);
                system.debug('Response body'+res.getBody());
                return res.getBody();
    }

}