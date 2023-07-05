public class generateApiPayloadResponse {
    
    @AuraEnabled
    public static List<LeadWrapper> getGraphPayload(List<String> leadIds, String queryData, List<String> dataSources, String naicValue , String sicValue) {
        List<Lead> leads = [Select Id, Company from Lead where Id = :leadIds];
        Map<String, Lead> leadCompanyIdMap = new Map<String, Lead> ();
        for(Lead ldObj : leads) {
            leadCompanyIdMap.put(ldObj.Company, ldObj);
        }
        
        String zeniaResponse = getGraphResponse(dataSources, queryData, new List<String> (leadCompanyIdMap.keySet()), naicValue, sicValue );
        // System.debug('zeniaResponse = ' + zeniaResponse);
        
        Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(zeniaResponse);
        Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
        
        Map<String, LeadWrapper> ldObjMap = new Map<String, LeadWrapper> ();
        
        for(Object leadResult : (List<Object>)dataMap.get('getCompaniesByStatus')) {
            Map<String, Object> leadMap = (Map<String, Object>)leadResult;
            
            String company = (String)leadMap.get('name');
            String source = (String)leadMap.get('source');
            Integer SicCode = (Integer)leadMap.get('SIC');
            Integer NaicCode = (Integer)leadMap.get('NAICS');
            String Industry = (String)leadMap.get('industry');
            
            //system.debug('siccode is '+SicCode);
            String sourceStatus = '';
            
            if(leadCompanyIdMap.containsKey(company)) {
                sourceStatus = (String.isNotBlank(source) ? source + ' | ' :  '')  +  (String)leadMap.get('status');
                
                if(!ldObjMap.containsKey(company)) {
                    LeadWrapper ldObj = new LeadWrapper();
                    ldObj.id =  leadCompanyIdMap.get(company).Id;
                    ldObj.company = company;
                    ldObj.SicCode = string.valueof(SicCode);
                    ldObj.NaicCode = string.valueof(NaicCode);
                    ldObj.industry = industry;
                    ldObj.options = new List<String> { sourceStatus };
                        ldObjMap.put(company, ldObj);
                } else {
                    ldObjMap.get(company).options.add(sourceStatus);
                }
            }
        }
        return ldObjMap.values();
    }
    
    @AuraEnabled
    public static String saveLeads(List<Lead> leads) {
        try{
            update leads;
            return 'Success';
        } catch(Exception ex) { return 'Error: ' + ex.getMessage(); }
    }
    
    public static String getGraphResponse(list<String> DataSource, String queryData, list<String> CompanyList, string naicValue , string sicValue ){
        // Set NAIC OR SIC Value 
        string naiccode = (string.isNotBlank(naicValue)? naicValue : '' );
        string siccode = (string.isNotBlank(sicValue)? sicValue : '' );
        
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();
        String Source = json.serialize(DataSource);
        String company = json.serialize(CompanyList);
        String jsonBody ;
        
        jsonBody = '{"query":"query getCompaniesByStatus($company_list: [String!], $query: String!, $case_type: String!, $source: [String!], $codes: CodesCategory) {\\r\\n   getCompaniesByStatus(company_list: $company_list, query: $query, case_type: $case_type, source: $source, codes: $codes) {\\r\\n       name\\r\\n       industry\\r\\n        status\\r\\n        source\\r\\n       profit\\r\\n        SIC\\r\\n       NAICS\\r\\n  }\\r\\n}","variables":{"query":'+json.serialize(queryData)+',"company_list":'+company+',"source":'+Source+',"case_type":"classify","codes":{"sic_code":"'+siccode+'","naics_code":"'+naiccode+'"}}}';
        
        // System.debug('json request body is '+jsonBody);
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
        //  system.debug('Response body'+res.getBody());
        
        return res.getBody();
    }
    
    //get custom setting 
    public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    public class LeadWrapper {
        @AuraEnabled
        public String id;
        @AuraEnabled
        public String company;
        @AuraEnabled
        public String SicCode;
        @AuraEnabled
        public String NaicCode;
        @AuraEnabled
        public String industry;
        @AuraEnabled
        public List<String> options;
    }
    
}