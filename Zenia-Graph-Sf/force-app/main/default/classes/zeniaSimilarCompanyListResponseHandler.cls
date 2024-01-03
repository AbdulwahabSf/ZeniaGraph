public class zeniaSimilarCompanyListResponseHandler {
    @AuraEnabled
    public static Map<String, Object> similarCompanyList(List<String> leadIds, String Env){
        Integer getDefaultRec = 20;
        Map<String, Object> dataMap = new Map<String, Object> ();
        List<Lead> leads = [Select Id, Company, Name, Phone, City, Email, Status, Datasource__c from Lead where Id IN :leadIds];      
        List<String> leadcompany = new List<String>();
        map<String, Object> mapleadcom = new map<String, Object>();
        List<Lead> leadList = [select Id, Company from lead];
          
        dataMap.put('Leads', leadList);
        dataMap.put('FilteredLeads', leads);
        
        if(leadIds.size() == 1) { 
            for(Lead ld : leads){
                leadcompany.add(ld.Company);
                mapleadcom.put('name', ld.Company);              
                mapleadcom.put('similar_source', Env);
                mapleadcom.put('top_k',getDefaultRec);
              
            }
            String SimilarCompanyResponse = getsimilarCompanyResponse(mapleadcom); 
            dataMap.put('SimilarCompanyResponse', SimilarCompanyResponse);
       
        }
        return dataMap;
    }
    
    //Create lead 
    @AuraEnabled
    public static List<Contact> saveLeads(List<Lead> leads) {
        String response = getsimilarCompanyContacts(leads[0].Company);
      
        Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(response);
        Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
        Map<String, Object> conMap = (Map<String, Object>)dataMap.get('GetContactsFromGraphDB');
        List<Object> records = (List<Object>)conMap.get('records');
        
        List<Contact> conObjList = new List<Contact> ();
        
        for(Object record : records) {
            Map<String, Object> contactMap = (Map<String, Object>)record;
            Contact conObj = new Contact();
            conObj.FirstName = (String)contactMap.get('first_name');
            conObj.LastName = (String)contactMap.get('last_name') != '' ? (String)contactMap.get('last_name') : 'Mr' ;
            conObj.Description = (String)contactMap.get('description');
            conObj.zeniadev__Designation__c = (String)contactMap.get('occupation');
            conObjList.add(conObj);
        }
        
        upsert leads;
        if(!conObjList.isEmpty()) {
            for(Contact conObj : conObjList) {
                conObj.zeniadev__Lead__c = leads[0].Id;
            }
            insert conObjList;
        }
        
        return conObjList;
    }
  
     @AuraEnabled
    public static string getsimilarCompanyResponse(Map<String,Object> mapleadcom){
   
        String jsonBody = '{"query":"query getSimilarCompaniesByName($name: String!,$similar_source:String!,$top_k: Int )\\r\\n{\\r\\n    getSimilarCompaniesByName(name: $name, similar_source: $similar_source,top_k: $top_k)\\r\\n   {\\r\\n   graph_url,\\r\\n    records\\r\\n {name\\r\\n  NAICS\\r\\n  SIC\\r\\n  industry\\r\\n source\\r\\n vector_score\\r\\n}\\r\\n    } \\r\\n}","variables":'+json.serialize(mapleadcom)+'}';  
         zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.endpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header);
        req.setBody(jsonBody);
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        return res.getBody();
    }
   
     @AuraEnabled
    public static string getsimilarCompanyContacts(String Company){
 
        String jsonBody = '{"query":"query GetContactsFromGraphDB($company: String!){\\r\\n        GetContactsFromGraphDB(company: $company){\\r\\n          records\\r\\n        }\\r\\n}","variables":{"company":'+json.serialize(Company)+'}}';
        zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.endpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header);
        req.setBody(jsonBody);
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        return res.getBody();
    } 
    
    @AuraEnabled 
    public static List<Contact> displayContacts(string Company){
        String response = getsimilarCompanyContacts(Company);
        
        Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(response);
        Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
        Map<String, Object> conMap = (Map<String, Object>)dataMap.get('GetContactsFromGraphDB');
        List<Object> records = (List<Object>)conMap.get('records');
        
        List<Contact> conObjList = new List<Contact> ();
        
        for(Object record : records) {
            Map<String, Object> contactMap = (Map<String, Object>)record;
            Contact conObj = new Contact();
            conObj.FirstName = (String)contactMap.get('first_name');
            conObj.LastName = (String)contactMap.get('last_name');
            conObj.zeniadev__Designation__c = (string)contactMap.get('occupation');
            conObjList.add(conObj);
        }
        return conObjList;
    }
    
    public static List<Lead> getLeads() {
        return [select id, company from lead];
    }   
}