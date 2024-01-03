@isTest
public class zeniaSimilarCompanySearchTest implements HttpCalloutMock{
    
    static testMethod void testsimilarCompanySearch(){
        
        string searchQuery = 'find the names and abstract of companies in the Financial Services industry with more than 200,00 employees';

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new zeniaSimilarCompanySearchTest());  
        string searchResults = zeniaSimilarCompanySearch.similarCompanySearch(searchQuery);
        Test.stopTest();
    }
    
    
    public HTTPResponse respond(HTTPRequest request) {
        
        HttpResponse response = new HttpResponse();   
        response.setHeader('Content-Type', 'application/json');
        response.setBody('{"data":{"sparqlGPTSearch": [{"graph_url": "http://54.167.3.82:7200/graphs-visualizations?query=PREFIX%20dbp%3A%20%3Chttp%3A//dbpedia.org/property/%3E%20PREFIX%20foaf%3A%20%3Chttp%3A//xmlns.com/foaf/0.1/%3E%20PREFIX%20xsd%3A%20%3Chttp%3A//www.w3.org/2001/XMLSchema%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A//www.w3.org/2000/01/rdf-schema%23%3E%20PREFIX%20dbr1%3A%20%3Chttps%3A//www.linkedin.com/company/%3E%20PREFIX%20dbr%3A%20%3Chttp%3A//dbpedia.org/resource/%3E%20PREFIX%20dbr2%3A%20%3Chttps%3A//www.zoominfo.com/company/%3E%20PREFIX%20dbr3%3A%20%3Chttps%3A//www.salesforce.com/company/%3E%20PREFIX%20dbo%3A%20%3Chttp%3A//dbpedia.org/ontology/%3E%20CONSTRUCT%20%7B%20%3Fcompany%20a%20dbo%3AOrganisation%3B%20dbo%3Asource%20%3Fdata%20.%20%3Fdata%20dbo%3Ascore%20%3Fscore%20.%20%7D%20WHERE%20%7B%20VALUES%20%28%3Flink%20%3Fvalue%29%20%7B%20%28%3Chttps%3A//www.linkedin.com/company/Microsoft%3Edbr%3A-0.0000%20%29%20%28%3Chttps%3A//www.zoominfo.com/company/Microsoft%3Edbr%3A-0.0000%20%29%20%28%3Chttps%3A//www.linkedin.com/company/Autodesk%3Edbr%3A0.2669%20%29%20%28%3Chttps%3A//www.zoominfo.com/company/Autodesk%3Edbr%3A0.2669%20%29%20%28%3Chttps%3A//www.linkedin.com/company/Amazon_%28company%29%3Edbr%3A0.2870%20%29%20%28%3Chttps%3A//www.linkedin.com/company/Amazon%3Edbr%3A0.2870%20%29%20%28%3Chttps%3A//www.salesforce.com/company/Amazon%3Edbr%3A0.2870%20%29%20%28%3Chttps%3A//www.zoominfo.com/company/Amazon%3Edbr%3A0.2870%20%29%20%28%3Chttps%3A//www.linkedin.com/company/Snowflake%3Edbr%3A0.2876%20%29%20%28%3Chttps%3A//www.linkedin.com/company/Cisco%3Edbr%3A0.3019%20%29%20%7D%20bind%28%3Flink%20as%20%3Fdata%29%20bind%28%3Fvalue%20as%20%3Fscore%29%20%3Fcompany%20a%20dbo%3AOrganisation%20%3B%20dbo%3Asource%20%3Fdata%20.%20FILTER%20%28%3Fdata%20IN%20%28%3Chttps%3A//www.linkedin.com/company/Microsoft%3E%2C%20%3Chttps%3A//www.zoominfo.com/company/Microsoft%3E%2C%20%3Chttps%3A//www.linkedin.com/company/Autodesk%3E%2C%20%3Chttps%3A//www.zoominfo.com/company/Autodesk%3E%2C%20%3Chttps%3A//www.linkedin.com/company/Amazon_%28company%29%3E%2C%20%3Chttps%3A//www.linkedin.com/company/Amazon%3E%2C%20%3Chttps%3A//www.salesforce.com/company/Amazon%3E%2C%20%3Chttps%3A//www.zoominfo.com/company/Amazon%3E%2C%20%3Chttps%3A//www.linkedin.com/company/Snowflake%3E%2C%20%3Chttps%3A//www.linkedin.com/company/Cisco%3E%29%29%20%7D&sameAs&inference"}]}}');
        response.setStatusCode(200);
        
        return response; 
        
    }
}