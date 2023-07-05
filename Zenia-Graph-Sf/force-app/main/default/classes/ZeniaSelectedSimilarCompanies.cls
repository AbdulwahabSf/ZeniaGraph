public class ZeniaSelectedSimilarCompanies {
   @AuraEnabled(cacheable=true)
    public static LisT<Lead> getSelectedLead(List<Id> ids){
        
            return [Select Company,Name,City,Status,Phone,Email,Datasource__c from Lead WHERE ID IN:ids];
    } 
}