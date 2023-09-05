public class zeniaSerachSimilarNLP {
    
    @AuraEnabled
    public static map<string,string> getClassifiedData(String inputText){
        Map<String,String> inputMap = new Map<String,String>();
        inputMap.put('input',inputText);
        map<string,string> similarMap = new Map<String,String>();
         Map<String,String> NlpMapResult = new Map<String,String>();
        list<string> attrlist = new list<string>();
        String zeniaResponse =  getClassifiedDataFromInputText(inputMap);
        zeniaSerachSimilarNLP nlpParser = (zeniaSerachSimilarNLP)JSON.deserialize(zeniaResponse, zeniaSerachSimilarNLP.class);
        
        system.debug('nlpparser '+nlpParser);
        for(string comp : nlpParser.attribute){
            attrlist.add(comp);
        }     
        
        List<Map<String, object>> compList = new List<Map<String, object>>();
        
        for(object entity : nlpParser.entities){
            compList.add(new Map<String, object> {
              //  'name' => entity, 'source' => 'salesforce'
                  'name' => entity
            });
            
                     
           for(string entitydb : nlpParser.entities){
             similarMap.put('name', entitydb);
             similarMap.put('source','salesforce');      
        }
        
        system.debug('company list '+JSON.serialize(compList));
           
        //  system.debug('zeniaResponseShowKg '+zeniaResponseShowKg);
       
        if(!attrlist.isEmpty()){
            //get showkg URL 
            String zeniaResponseShowKg = getShowKGWithAttribtues(compList, attrlist);    
            //get similar company url for Redis 
            String zeniaResSimilarCompRedis = getsimilarCompRes(similarMap,'redis');
            // system.debug('zeniaResponseSimilarCompany'+zeniaResSimilarCompRedis);
            
            //get similar company url for graphDb 
            String zeniaResSimilarCompGraphDb = getsimilarCompRes(similarMap,'graph');
            //   system.debug('zeniaResponseSimilarCompany'+zeniaResSimilarCompGraphDb);
            
            NlpMapResult.put('ShowKgUrl',zeniaResponseShowKg);
            NlpMapResult.put('RedisUrl',zeniaResSimilarCompRedis);
            NlpMapResult.put('GraphDbUrl',zeniaResSimilarCompGraphDb);
        }
        }
        return NlpMapResult;
    }
    
    @AuraEnabled
    public static string getClassifiedDataFromInputText(map<string,string> inputMap){
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniacs.NLPEndpoint__c);
        req.setMethod(zeniacs.Method__c);
        req.setHeader('Content-Type', 'application/json'); 
        req.setBody(JSON.serialize(inputMap));
        HttpResponse res = h.send(req);
        return res.getBody();
    }
    
    @AuraEnabled
    public static string getShowKGWithAttribtues(List<Map<String, object>> companyList, list<string> attributeList){
        string graphQlJs = '{"query":"query showKgWithAttributes($company_list: [ShowkgRequest!]!, $attributes_list: [String!]!) \\r\\n{\\r\\n  showKgWithAttributes(company_list: $company_list, attributes_list: $attributes_list) \\r\\n  {\\r\\n    graph_url\\r\\n    \\r\\n  }\\r\\n}\\r\\n","variables":{"company_list":'+json.serialize(companyList)+',"attributes_list":'+json.serialize(attributeList)+'}}';
       system.debug('graphsho0000'+graphQlJs);
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniacs.Endpoint__c);
        req.setMethod(zeniacs.Method__c);
        req.setHeader('Content-Type', 'application/json'); 
        req.setBody(graphQlJs);
        HttpResponse res = h.send(req);
        return res.getBody();
    }
    
    @AuraEnabled
    public static string getsimilarCompRes(Map<String,String> mapleadcom, string Env){
        mapleadcom.put('similar_source',Env);
        String jsonBody = '{"query":"query getSimilarCompaniesByName($name: String!, $source: String!, $similar_source:String)\\r\\n{\\r\\n    getSimilarCompaniesByName(name:$name, source:$source, similar_source:$similar_source)\\r\\n   {\\r\\n   graph_url,\\r\\n    records{name, NAICS, SIC, industry, source,vector_score,persons}\\r\\n    } \\r\\n}","variables":'+json.serialize(mapleadcom)+'}' ;  
        
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniacs.Endpoint__c);
        req.setMethod(zeniacs.Method__c);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(jsonBody);
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        return res.getBody();
    }

    // get custom setting 
    public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    @AuraEnabled
    public list<String> entities;
    
    @AuraEnabled
    public list<String> attribute;
    
    @AuraEnabled
    public List<Company_list> company_list;
    
    @AuraEnabled
    public List<String> attributes_list;
    
    public class Company_list {
        public String name;
        public String source;
    }
}