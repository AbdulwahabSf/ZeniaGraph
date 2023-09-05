@isTest
public class generateApiPayloadResponseTest implements HttpCalloutMock {

    @testSetup static void setup() {
        Zenia_API_Service__c zasObj = new Zenia_API_Service__c();
        zasObj.Endpoint__c = 'test';
        zasObj.Header__c = 'application/json';
        zasObj.Method__c = 'POST';
        insert zasObj;
        
        Lead leadObj = new Lead();
        leadObj.Company= 'Apple';
        leadObj.industry= 'Banking';
        leadObj.Status = 'Active' ;
        leadObj.Datasource__c = 'Linkedin';
        leadObj.SICCode__c = '8765';
        leadObj.Niacs_Code__c = '876543';
        leadObj.LastName = 'Ab';
        insert leadObj;
    }
    
    static testMethod void testGetGraphPayload(){
        list<Id> nleadIds = new list<Id>();
        List<lead> leadIds = [select id from lead limit 1 ];
        
        for(lead ld : leadIds){
            nleadIds.add(ld.id);
        }
        
        String queryData = 'ACTIVE\n+40 years operating business\n+50 employees\n+10 mil in investment funding\n+2% growth quarterly\n+3% growth yearly\nINACTIVE\n-160 year operating business\n-60000 employees\n-5 mil in investment funding\n-5% growth quarterly\n-1% growth yearly\nOthers\nAny other leads which are not Active or Inactive';
        list<String> datasource = new list<String> { 'Linkedin', 'Zoominfo' };
        //list<String> companylist = new list<String> { 'Apple', 'welltower' };
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new generateApiPayloadResponseTest());  
        List<generateApiPayloadResponse.LeadWrapper> lwList = generateApiPayloadResponse.getGraphPayload(nleadIds, queryData, datasource, '872632', '7653');
        Test.stopTest();
    }
    
    static testMethod void testSaveLeads() {
        List<lead> leads = [select id from Lead];
        
        generateApiPayloadResponse.saveLeads(leads);
    }
    
    public HTTPResponse respond(HTTPRequest request) {
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setBody('{"data":{"getCompaniesByStatus":[{"name":"Apple","industry":"RealEstate","status":"ACTIVE","source":"linkedin","profit":"336100000","SIC":"6141,6765","NAICS":"522291,871691"}]}}');
        response.setStatusCode(200);
        return response; 
    }
        
}