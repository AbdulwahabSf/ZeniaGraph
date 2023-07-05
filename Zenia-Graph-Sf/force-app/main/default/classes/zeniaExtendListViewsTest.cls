@isTest
public class zeniaExtendListViewsTest {
   
    static testMethod void testzeniaExtendListViews() 
    {
        List<Lead> lstLead = new List<Lead>();
         
       Lead leadObj = new Lead();
        leadObj.Company= 'Apple';
        leadObj.industry= 'Banking';
        leadObj.Status = 'Active' ;
        leadObj.Datasource__c = 'Linkedin';
        leadObj.SICCode__c = '8765';
        leadObj.Niacs_Code__c = '876543';
        leadObj.LastName = 'Ab';
        lstLead.add(leadObj);
        insert lstLead; 
       
        Test.startTest();
        ApexPages.StandardSetController stdSetController = new ApexPages.StandardSetController(lstLead);
        zeniaExtendListViews ext = new zeniaExtendListViews(stdSetController);
        Test.stopTest();
    }
}