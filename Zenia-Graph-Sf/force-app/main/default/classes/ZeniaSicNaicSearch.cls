public class ZeniaSicNaicSearch {
    
    //get custom setting 
    
    public static Zenia_API_Service__c getCustomSettingInstance(){
        return Zenia_API_Service__c.getInstance();
    }
    
    @AuraEnabled
    public static string frameRequest(String value, String code){
        
        Map<String, String> mapclassy = new Map<String,String>();        
        mapclassy.put('field',code);
        mapclassy.put('value',value);
        
        String classfyResponse = ZeniaCodeRes(mapclassy);
        
        return classfyResponse;
    }
    
   
    @AuraEnabled 
    public static String ZeniaCodeRes(map<String, String>  mapclassy){
        string result;
        string fresult ;
        system.debug('code request '+mapclassy);
        
        Zenia_API_Service__c zeniacs = getCustomSettingInstance();
        
           
        Http h = new Http();
        
        // Instantiate a new HTTP request
        // Specify request properties such as the endpoint, the POST method, etc. 
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniacs.CodeEndpoint__c);
        req.setMethod(zeniacs.Method__c);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(mapclassy));
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        system.debug('Response body'+res.getBody());
        result = res.getBody();
        if(string.isNotBlank(result)) {
             fresult = res.getBody();
        }
        return fresult;
    }
        
}