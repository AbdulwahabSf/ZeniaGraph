public class zeniaShowKgResponseHandler {

    @AuraEnabled
    public static string showkgcompany(List<String> leadIds){
        List<String> leadcompany = new List<String>(); 
        List<Map<String, String>> leadMapList = new List<Map<String, String>>();
        List<Lead> leads = [Select Id, Company, Datasource__c from Lead where Id IN :leadIds];
        
        for(Lead ld : leads){
            leadcompany.add(ld.Company);
            Map<String, String> leadMap = new Map<String, String>();
            leadMap.put('name', ld.Company);
            leadMapList.add(leadMap);    
        }
        
        String ShowKgResponse = getshowkgresponse(leadcompany, leadMapList); 
        return ShowKgResponse;
    }

    public static string getshowkgresponse(list<String> company_list, List<Map<String,String>> leadMapList){
     
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
}