@isTest
public class ZeniaSelectedSimilarCompaniesTest {

    static testMethod void testgetSelectedLead() {
        list<String> nleadIds = new list<String>();
        List<lead> leadIds = [select id from lead limit 1 ];
        
        for(lead ld : leadIds){
            nleadIds.add(ld.id);
        }
        ZeniaSelectedSimilarCompanies.getSelectedLead(nleadIds);
    }
}