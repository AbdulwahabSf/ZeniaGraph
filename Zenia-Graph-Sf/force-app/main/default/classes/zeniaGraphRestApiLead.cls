@RestResource(urlMapping='/api/CreateLead/*')
global class zeniaGraphRestApiLead {
   @HttpPost
   global static map<String,String> createLead(){
       
       String company,industry,status,datasource,lastName,sicCode,niacCode;
       String fieldName,fieldValue;
       ID ldids ;
       
       RestRequest req = RestContext.request;
       
       RestResponse res = RestContext.response;
       String jsonBody = req.requestBody.toString();
       
       JSONParser parser = JSON.createParser(jsonBody);
      While(parser.nextToken()!=null){
           if(parser.getCurrentToken() != JSONToken.END_OBJECT){
               fieldName = parser.getCurrentName();
               fieldValue = parser.getText();
               
               if(fieldName == 'company' ){
                  company = fieldValue;
               }
               else   if(fieldName == 'industry' ){
                  industry = fieldValue;
               }
               else   if(fieldName == 'status' ){
                  status = fieldValue;
               }
               else   if(fieldName == 'datasource' ){
                  datasource = fieldValue;
               }
               else   if(fieldName == 'lastName' ){
                  lastName = fieldValue;
               }
               else   if(fieldName == 'sicCode' ){
                  sicCode = fieldValue;
               }
               else   if(fieldName == 'niacCode' ){
                  niacCode = fieldValue;
               }
               
           }
       }      
           Lead lds = new Lead();
        if(Schema.sObjectType.Lead.fields.Company.isCreateable()) {
         lds.Company= company;
          }
        if(Schema.sObjectType.Lead.fields.industry.isCreateable()) {
         lds.industry= industry;
          }
       if(Schema.sObjectType.Lead.fields.Status.isCreateable()) {
         lds.Status = status; 
          }
       if(Schema.sObjectType.Lead.fields.Datasource__c.isCreateable()) {
         lds.Datasource__c = datasource;
          }
       if(Schema.sObjectType.Lead.fields.SICCode__c.isCreateable()) {
          lds.SICCode__c =sicCode;
          }
       if(Schema.sObjectType.Lead.fields.Niacs_Code__c.isCreateable()) {
         lds.Niacs_Code__c =niacCode;
          }
       if(Schema.sObjectType.Lead.fields.LastName.isCreateable()) {
         lds.LastName = lastName;
          }
       if (Schema.sObjectType.Contact.isCreateable()) {
         insert lds;     
          }         
        ldids = lds.Id;
        
        Map<String,String> mapRes = new Map<string,String>();
        mapres.put('id',ldids);
        mapres.put('status','Success');
        return mapRes;
        	
    }

}