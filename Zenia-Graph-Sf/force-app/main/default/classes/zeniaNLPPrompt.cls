public class zeniaNLPPrompt {
    
    @AuraEnabled
    public static string getClassifiedData(String inputText){
        Map<String,String> inputMap = new Map<String,String>();
        inputMap.put('input',inputText);
        String zeniaResponse =  getClassifiedDataFromInputText(inputMap);
        return zeniaResponse;
    }

    @AuraEnabled
    public static string getClassifiedDataFromInputText(map<String,String> inputText){
        string graphQlJs = '{"query":"query getGraphResultsByNLPQuery($input:String!)\\r\\n{\\r\\n    getGraphResultsByNLPQuery(input:$input)\\r\\n    {\\r\\n        graph_url\\r\\n        records\\r\\n    } \\r\\n}" ,"variables":'+JSON.serialize(inputText)+'}';
        zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.endpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header); 
        req.setBody(graphQlJs);
        HttpResponse res = h.send(req);
        return res.getBody();
    }
}