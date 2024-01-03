public class ZeniaSicNaicSearch {
     
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
        
        zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  

        Http h = new Http();        
        // Instantiate a new HTTP request
        // Specify request properties such as the endpoint, the POST method, etc. 
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.SICEndpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header);
        req.setBody(JSON.serialize(mapclassy));
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        result = res.getBody();
        if(string.isNotBlank(result)) {
             fresult = res.getBody();
        }
        return fresult;
    }
        
}