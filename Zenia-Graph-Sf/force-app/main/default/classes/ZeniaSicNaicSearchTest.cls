@isTest
global class ZeniaSicNaicSearchTest implements HttpCalloutMock{
    
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