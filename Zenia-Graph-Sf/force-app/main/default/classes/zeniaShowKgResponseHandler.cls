public class zeniaShowKgResponseHandler {

    @AuraEnabled
    public static string showkgcompany(List<String> leadIds){
        List<String> leadcompany = new List<String>(); 
        List<Map<String, String>> leadMapList = new List<Map<String, String>>();
        List<Lead> leads = [Select Id, Company, Datasource__c from Lead where Id IN :leadIds];
         string sfvalue = 'salesforce';
        for(Lead ld : leads){
            leadcompany.add(ld.Company);
            Map<String, String> leadMap = new Map<String, String>();
            leadMap.put('name', ld.Company);
             if(String.isBlank(ld.Datasource__c)){
			//leadMap.put('source',sfvalue);
             }else {
               //  leadMap.put('source',ld.Datasource__c);
             }
            leadMapList.add(leadMap);    
        
        }
        
        String ShowKgResponse = getshowkgresponse(leadcompany, leadMapList );
        
        return ShowKgResponse;
    }
    
    //get custom setting 
    
     public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    
    public static string getshowkgresponse(list<String> company_lis, List<Map<String,String>> leadMapList){
        System.debug('source company '+leadMapList);
        System.debug('CompanyName '+company_lis);
           String jsonBody = '{"query":"query showGraphDbKg($company_list: [ShowkgRequest!])\\r\\n{\\r\\n    showGraphDbKg(company_list: $company_list)\\r\\n    {\\r\\n        graph_url\\r\\n    } \\r\\n}","variables":{"company_list":'+json.serialize(leadMapList)+'}}';
        system.debug('jsonBody'+jsonBody);
         Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
                Http h = new Http();

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