public class zeniaExtendListViews {
    public List<Lead> getIDs;
    public String leadIds{get;set;}
    
    public zeniaExtendListViews(ApexPages.StandardSetController controller){
        System.debug('Get Selected');
        getIDs = controller.getSelected();
        leadIds = '';  
        for(Lead ld : getIDs){
            leadIds += ld.Id + ','; 
            System.debug('Lead ID : '+leadIds);
        }
        leadIds = leadIds.removeEnd(','); 
        
    } 
}