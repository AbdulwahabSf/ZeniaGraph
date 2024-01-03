public class generateApiPayloadResponse {
    
    @AuraEnabled
    public static List<LeadWrapper> getGraphPayload(List<String> leadIds, String queryData, List<String> dataSources, 
                                                    String naicValue , String sicValue, String eventName) {
                                                 
        Map<String, Lead> leadCompanyIdMap = new Map<String, Lead> ();
        Map<String, Lead> defaultCompanyIdMap = new Map<String, Lead> ();
           
        List<String> eventlist = new List<String>();
        if(eventName != null)
        eventlist.add(eventName);
        if(leadIds.size() > 0){    
            List<Lead> leads = [Select Id, Company from Lead where Id = :leadIds];
            for(Lead ldObj : leads) {
                leadCompanyIdMap.put(ldObj.Company, ldObj);
            }
        }         
        List<Lead> leadList = [Select Id, Company from Lead ];
        for(Lead ldObj : leadList) {
            defaultCompanyIdMap.put(ldObj.Company, ldObj); 
            
        }  
        String zeniaResponse = getGraphResponse(dataSources, queryData, new List<String> (leadCompanyIdMap.keySet()), naicValue, sicValue, eventlist);       
        Map<String, Object> resMap = (Map<String, Object>)JSON.deserializeUntyped(zeniaResponse);
        Map<String, Object> dataMap = (Map<String, Object>)resMap.get('data');
        Map<String, LeadWrapper> ldObjMap = new Map<String, LeadWrapper> ();
        
        for(Object leadResult : (List<Object>)dataMap.get('getCompaniesByStatus')) {
            Map<String, Object> leadMap = (Map<String, Object>)leadResult;
            boolean defaultchecked = true;
            String company = (String)leadMap.get('name');
            String source = (String)leadMap.get('source');
            String status = (String)leadMap.get('status');
            String operating_years = (String)leadMap.get('operating_years');
            String no_of_employees = (String)leadMap.get('no_of_employees');
            String annual_growth = (String)leadMap.get('annual_growth');
            String quarterly_growth = (String)leadMap.get('quarterly_growth');
            String headquarters = (string)leadMap.get('headquarters');
            String SicCode = (string)leadMap.get('SIC');
            String NaicCode = (String)leadMap.get('NAICS');
            String Industry = (String)leadMap.get('industry');
             
            if(Industry == 'Financial services'){
                Industry = 'Financial Services';
            }     
            if(leadCompanyIdMap.containsKey(company)) {            
                if(!ldObjMap.containsKey(company)) {
                    LeadWrapper ldObj = new LeadWrapper();
                    ldObj.id =  leadCompanyIdMap.get(company).Id;
                    ldObj.company = company;
                    ldObj.SicCode = string.valueof(SicCode);
                    ldObj.NaicCode = string.valueof(NaicCode);
                    ldObj.industry = industry;
                    ldObj.defaultChecked = defaultchecked;
                    ldObj.operating_years = operating_years;
                    ldObj.no_of_employees = no_of_employees;
                    ldObj.quarterly_growth = quarterly_growth;
                    ldObj.annual_growth = annual_growth;
                    ldObj.Status = status;
                    ldObj.headquarters = headquarters;
                    ldObj.options = new List<String> { status };
                        ldObjMap.put(company, ldObj);
                } else {
                    ldObjMap.get(company).options.add(status);
                }
            } else  {
                LeadWrapper ldObj = new LeadWrapper();
                ldObj.id = defaultCompanyIdMap.containsKey(company) ? defaultCompanyIdMap.get(company).Id : null;
                ldObj.company = company;
                ldObj.SicCode = string.valueof(SicCode);
                ldObj.NaicCode = string.valueof(NaicCode);
                ldObj.industry = industry;
                ldObj.defaultChecked = defaultchecked;
                ldObj.operating_years = operating_years;
                ldObj.no_of_employees = no_of_employees;
                ldObj.quarterly_growth = quarterly_growth;
                ldObj.annual_growth = annual_growth;
                ldObj.Status = status;
                ldObj.headquarters = headquarters;
                ldObj.options = new List<String> { status };
                    ldObjMap.put(company, ldObj);
            } 
        }
        return ldObjMap.values();
    }
    
    @AuraEnabled
    public static String saveLeads(List<Lead> leads) {
        try{
            if(!leads.isEmpty()){
                upsert leads;
            }
            
            return 'Success';
        } catch(Exception ex) { return 'Error: ' + ex.getMessage(); }
        
    }
     
    public static String getGraphResponse(list<String> DataSource, String queryData, list<String> CompanyList, string naicValue , string sicValue, list<string> eventlist ){
        // Set NAIC OR SIC Value 
        string naiccode = (string.isNotBlank(naicValue)? naicValue : '' );
        string siccode = (string.isNotBlank(sicValue)? sicValue : '' );
        String Source = json.serialize(DataSource);
        String company = json.serialize(CompanyList);
        String events =  eventlist != null ? json.serialize(eventlist) : '';
        String jsonBody ;
        
       zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  

        jsonBody = '{"query":"query getCompaniesByStatus($company_list: [String!], $query: String!, $case_type: String!, $codes: CodesCategory, $events:[String])\\r\\n {\\r\\n   getCompaniesByStatus(company_list: $company_list, query: $query, case_type: $case_type, codes: $codes, events:$events)\\r\\n {\\r\\n       name\\r\\n       industry\\r\\n        status\\r\\n        operating_years\\r\\n        annual_growth\\r\\n        quarterly_growth\\r\\n        no_of_employees\\r\\n       headquarters\\r\\n        SIC\\r\\n       NAICS\\r\\n  }\\r\\n}","variables":{"query":"'+queryData+'","company_list":'+company+',"case_type":"classify","events":'+events+',"codes":{"sic_code":"'+siccode+'","naics_code":"'+naiccode+'"}}}';
        Http h = new Http();
        
        // Instantiate a new HTTP request
        // Specify request properties such as the endpoint, the POST method, etc. 
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.endpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header);
        req.setBody(jsonBody);
        req.setTimeout(30000);
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        return res.getBody();
    }
    
    //return showKG URL 
    @AuraEnabled
    public static string getshowkgresponse(List<String> companyList){
        List<Map<String,String>> leadMapList = new List<Map<String, String>>();
        for(String com : companyList){
            Map<String, String> leadMap = new Map<String, String>();
            leadMap.put('name', com);   
            leadMapList.add(leadMap);
        }              
        String jsonBody = '{"query":"query showGraphDbKg($company_list: [ShowkgRequest!])\\r\\n{\\r\\n    showGraphDbKg(company_list: $company_list)\\r\\n    {\\r\\n        graph_url\\r\\n    } \\r\\n}","variables":{"company_list":'+json.serialize(leadMapList)+'}}';
      
        zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  
        
        Http h = new Http();     
        // Instantiate a new HTTP request
        // Specify request properties such as the endpoint, the POST method, etc. 
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.endpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header);
        req.setBody(jsonBody);
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);  
        return res.getBody();
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
        public String firstName;
        @AuraEnabled
        public String lastName;
        @AuraEnabled
        public String designation;
        @AuraEnabled
        public String email;
        @AuraEnabled
        public boolean isPrimary;
        @AuraEnabled 
        public boolean defaultChecked;
        @AuraEnabled
        public String Status;
        @AuraEnabled
        public List<String> options;
        @AuraEnabled
        public String operating_years;
        @AuraEnabled
        public String no_of_employees;
        @AuraEnabled
        public String annual_growth;
        @AuraEnabled
        public string headquarters;
        @AuraEnabled
        public String quarterly_growth;
    }
}