@isTest
public class zeniaSerachSimilarNLPTest implements HttpCalloutMock {
    
    @testSetup static void setup() {
        Zenia_API_Service__c zasObj = new Zenia_API_Service__c();
        zasObj.Endpoint__c = 'test';
        zasObj.Header__c = 'application/json';
        zasObj.Method__c = 'POST';
        zasObj.NLPEndpoint__c = 'http://52.91.71.253/embedding/api/getClassifiedDataFromInputText';
        
        insert zasObj;
    }
    
    static testMethod void testsimilarCompanySearch(){
        
        string searchQuery = 'find me the revenue, profit, description, headquarters, last revenue, last quarter revenue and name for Apple';
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new zeniaSerachSimilarNLPTest());  
        map<string,string> searchResults = zeniaSerachSimilarNLP.getClassifiedData(searchQuery);
        List<zeniaSerachSimilarNLP> wrapperList = new  List<zeniaSerachSimilarNLP>();
        Test.stopTest();
    }
    
    public HTTPResponse respond(HTTPRequest request) {
        HttpResponse response = new HttpResponse();   
        response.setHeader('Content-Type', 'application/json');
        response.setBody('{"entities":["Apple"],"attribute":["revenue","profit","description","headquarters","lastrevenue","lastquarterrevenue","name"]}');
        response.setStatusCode(200);
        return response; 
    }
}