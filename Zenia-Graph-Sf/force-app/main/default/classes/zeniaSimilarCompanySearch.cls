public class zeniaSimilarCompanySearch {
   
    @AuraEnabled
    public static string similarCompanySearch(String searchQuery){
        string zeniaResponse =  getsimilarCompanyResponse(searchQuery);
       
        return zeniaResponse;
    } 
    
    public static string getsimilarCompanyResponse(String searchQuery){
    
        string financialServices = 'Financial Services';
        String altrQuery = searchQuery.replace('Financial Services', '\''+financialServices+'\'' );

        String jsonBody = '{"query":"query sparqlGPTSearch($input:String!)\\r\\n{\\r\\n    sparqlGPTSearch(input:$input)\\r\\n    {\\r\\n        graph_url\\r\\n        records\\r\\n    } \\r\\n}","variables":{"input":"'+altrQuery+'"}}';  
   
        zeniaGraphConfigData.zeniaConfigMdtWrapper zeniaMDT = zeniaGraphConfigData.getCustomMdtInstance();  
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(zeniaMDT.endpoint);
        req.setMethod(zeniaMDT.method);
        req.setHeader('Content-Type', zeniaMDT.header);
        req.setBody(jsonBody);
        req.setTimeout(30000);
        HttpResponse res = h.send(req);
        return res.getBody();
    }
}