@RestResource(urlMapping='/lead/*')
global class ZeniaRestApiLead {
     @HttpPost
    global static map<String,String> createLead( String company,String industry, String status, String datasource, String lastName, String sicCode, String niacCode ){
           Id ldids;
           
            Lead lds = new Lead();
            lds.Company= company;
            lds.industry= industry;
            lds.Status = status; 
            lds.Datasource__c = datasource;
            lds.SICCode__c =sicCode;
            lds.Niacs_Code__c =niacCode;
            lds.LastName = lastName;
            insert lds;
            ldids = lds.Id;
            system.debug('ID IS = '+ ldids);
        Map<String,String> mapRes = new Map<string,String>();
        mapres.put('id',ldids);
        mapres.put('status','Success');
        return mapRes;
        	
    }   
    }