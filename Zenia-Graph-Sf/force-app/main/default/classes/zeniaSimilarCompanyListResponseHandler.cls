public class zeniaSimilarCompanyListResponseHandler {
    @AuraEnabled
    public static Map<String, Object> similarCompanyList(List<String> leadIds, String Env){
        Map<String, Object> dataMap = new Map<String, Object> ();
        
        List<Lead> leads = [Select Id, Company, Name, Phone, City, Email, Status, Datasource__c from Lead where Id IN :leadIds];
        
        List<Lead> leadList = [select Id, Company from lead];
        dataMap.put('Leads', leadList);
        dataMap.put('FilteredLeads', leads);
        if(leadIds.size() == 1) {
            List<String> leadcompany = new List<String>();
            List<String> LeadAllCompany = new List<String>();
            map<String, String> mapleadcom = new map<String, String>();
            
            String sfvalue = 'salesforce';
           
            for(Lead ld : leads){
                leadcompany.add(ld.Company);
                mapleadcom.put('name', ld.Company);              
                mapleadcom.put('similar_source', Env);
               /* if(String.isBlank(ld.Datasource__c)){
                   mapleadcom.put('source',sfvalue); 
                } else {
                  mapleadcom.put('source',ld.Datasource__c);     
                } */
            }
            
            String SimilarCompanyResponse = getsimilarCompanyResponse(mapleadcom);
            
            dataMap.put('SimilarCompanyResponse', SimilarCompanyResponse);
          
            // dataMap.put('SimilarCompanyResponse', '{"data":{"getSimilarCompaniesByName":[{"records": [{"name":"IBM1","industry":null,"status":"ACTIVE","source":"zoom info"},{"name":"IBM1","industry":null,"status":"INACTIVE","source":"zoom info"},{"name":"IBM1","industry":null,"status":"INACTIVE","source":"linkedin"},{"name":"IBM1","industry":null,"status":"OTHERS","source":"linkedin"},{"name":"IBM1","industry":null,"status":"OTHERS","source":"linkedin"}]}]}}');
            
            //Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(SimilarCompanyResponse);
            //Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
            //list<Object> result =   (list<Object>)dataMap.get('getSimilarCompaniesByName');
        }
        return dataMap;
    }
    
    //Create lead 
    @AuraEnabled
    public static List<Contact> saveLeads(List<Lead> leads) {
        String res = getsimilarCompanyContacts(leads[0].Company);
        
        Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(res);
        Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
        Map<String, Object> conMap = (Map<String, Object>)dataMap.get('GetContactsFromGraphDB');
        List<Object> records = (List<Object>)conMap.get('records');
        
        List<Contact> conObjList = new List<Contact> ();
        
        for(Object record : records) {
            Map<String, Object> contactMap = (Map<String, Object>)record;
            system.debug('contact details'+contactMap);
            Contact conObj = new Contact();
            conObj.FirstName = (String)contactMap.get('first_name');
            conObj.LastName = (String)contactMap.get('last_name');
            conObj.Description = (String)contactMap.get('description');
            conObj.zeniadev__Designation__c = (String)contactMap.get('occupation');
            //conObj.zeniadev__Lead__c = leads[0].Id;
            conObjList.add(conObj);
        }
        
        upsert leads;
        
        if(!conObjList.isEmpty()) {
            for(Contact conObj : conObjList) {
                conObj.zeniadev__Lead__c = leads[0].Id;
            }
            insert conObjList;
        }
                
        /*if(!contacts.isEmpty()) {
            for(Contact con : contacts) {
                con.zeniadev__Lead__c = leads[0].Id;
            }
            insert contacts;
        }*/
        return conObjList;
    }
    
    //get custom setting 
    public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
     @AuraEnabled
    public static string getsimilarCompanyResponse(Map<String,String> mapleadcom){
        System.debug('source company '+mapleadcom);
        
        String jsonBody = '{"query":"query getSimilarCompaniesByName($name: String!,$similar_source:String! )\\r\\n{\\r\\n    getSimilarCompaniesByName(name: $name, similar_source: $similar_source)\\r\\n   {\\r\\n   graph_url,\\r\\n    records\\r\\n {name\\r\\n  NAICS\\r\\n  SIC\\r\\n  industry\\r\\n source\\r\\n vector_score\\r\\n persons\\r\\n}\\r\\n    } \\r\\n}","variables":'+json.serialize(mapleadcom)+'}' ;  
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
   
     @AuraEnabled
    public static string getsimilarCompanyContacts(String Company){
        System.debug('source company '+Company);
        
        String jsonBody = '{"query":"query GetContactsFromGraphDB($company: String!){\\r\\n        GetContactsFromGraphDB(company: $company){\\r\\n          records\\r\\n        }\\r\\n}","variables":{"company":'+json.serialize(Company)+'}}' ;  
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
    
    @AuraEnabled 
    public static List<Contact> displayContacts(string Company){
        String res = getsimilarCompanyContacts(Company);
        
        Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(res);
        Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
        Map<String, Object> conMap = (Map<String, Object>)dataMap.get('GetContactsFromGraphDB');
        List<Object> records = (List<Object>)conMap.get('records');
        
        List<Contact> conObjList = new List<Contact> ();
        
        for(Object record : records) {
            Map<String, Object> contactMap = (Map<String, Object>)record;
            system.debug('contact details'+contactMap);
            Contact conObj = new Contact();
            conObj.FirstName = (String)contactMap.get('first_name');
            conObj.LastName = (String)contactMap.get('last_name');
            conObj.zeniadev__Designation__c = (string)contactMap.get('occupation');
            //conObj.zeniadev__Lead__c = leads[0].Id;
            conObjList.add(conObj);
        }
        return conObjList;
    }
    
    //Return Leads
    public static List<Lead> getLeads() {
        return [select id, company from lead];
    }
    
}