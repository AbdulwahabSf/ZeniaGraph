@isTest
public class zeniaShowKgResponseHandlerTest {

    @testSetup static void setup() {
        Zenia_API_Service__c zasObj = new Zenia_API_Service__c();
        zasObj.Endpoint__c = 'test';
        zasObj.Header__c = 'application/json';
        zasObj.Method__c = 'POST';
        insert zasObj;
    }
    
     static testMethod void testshowkgcompany(){
        list<Id> nleadIds = new list<Id>();
        List<lead> leadIds = [select id,company from lead limit 1 ];
        
        for(lead ld : leadIds){
            nleadIds.add(ld.id);
        }
         
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new generateApiPayloadResponseTest());  
        String sicl = zeniaShowKgResponseHandler.showkgcompany(nleadIds);
        Test.stopTest();
    }

    
    
     public HTTPResponse respond(HTTPRequest request) {
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setBody('');
        response.setStatusCode(200);
        return response; 
    }
}