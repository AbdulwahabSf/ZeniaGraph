@isTest
global class ZeniaSicNaicSearchTest implements HttpCalloutMock{
    
    @testSetup static void setup() {
        Zenia_API_Service__c zasObj = new Zenia_API_Service__c();
        zasObj.CodeEndpoint__c = 'test';
        zasObj.Header__c = 'application/json';
        zasObj.Method__c = 'POST';
        insert zasObj;
    }
    
    static testMethod void testframeRequest(){
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new generateApiPayloadResponseTest());  
        string sicl = ZeniaSicNaicSearch.frameRequest('7323','27653');
        Test.stopTest();
    }
    
    
    public HTTPResponse respond(HTTPRequest request) {
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setBody('["721110","722513","711219"]');
        response.setStatusCode(200);
        return response; 
    }
}