public class zeniaNLPPrompt {
    
    @AuraEnabled
    public static string getClassifiedData(String inputText){
        Map<String,String> inputMap = new Map<String,String>();
        inputMap.put('input',inputText);
        String zeniaResponse =  getClassifiedDataFromInputText(inputMap);
        return zeniaResponse;
    }
    
    // get custom setting 
    public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    
    @AuraEnabled
    public static string getClassifiedDataFromInputText(map<string,string> inputText){
        string graphQlJs = '{"query":"query getGraphResultsByNLPQuery($input:String!)\\r\\n{\\r\\n    getGraphResultsByNLPQuery(input:$input)\\r\\n    {\\r\\n        graph_url\\r\\n        records\\r\\n    } \\r\\n}" ,"variables":'+JSON.serialize(inputText)+'}';
        system.debug('graphsho0000'+graphQlJs);
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniacs.Endpoint__c);
        req.setMethod(zeniacs.Method__c);
        req.setHeader('Content-Type', 'application/json'); 
        req.setBody(graphQlJs);
        HttpResponse res = h.send(req);
        system.debug('response = '+res.getBody());
        return res.getBody();
    }
    
}