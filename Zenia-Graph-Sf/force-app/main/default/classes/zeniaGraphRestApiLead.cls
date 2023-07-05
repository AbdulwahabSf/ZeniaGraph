@RestResource(urlMapping='/api/lead')
global class zeniaGraphRestApiLead {
   @HttpPost
   global static map<String,String> createLead(){
       
       String company,industry,status,datasource,lastName,sicCode,niacCode;
       String fieldName,fieldValue;
       ID ldids ;
       
       RestRequest req = RestContext.request;
       
       RestResponse res = RestContext.response;
       
       String jsonBody = req.requestBody.toString();
       system.debug('json body '+jsonBody);
       Map<String,Object> requestData = (Map<String,Object>) JSON.deserializeUntyped(jsonBody);
       
      /* JSONParser parser = JSON.createParser(jsonBody);
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
       }*/      
            Lead lds = new Lead();
            lds.Company= (String) requestData.get('company');
            lds.industry= (String)requestData.get('industry');
            lds.Status = (String)requestData.get('status'); 
            lds.Datasource__c = (String) requestData.get('datasource');
            lds.SICCode__c =(String) requestData.get('sicCode');
            lds.Niacs_Code__c =(String) requestData.get('niacCode');
            lds.LastName = (String) requestData.get('lastName');
            insert lds;
            ldids = lds.Id;
            system.debug('ID IS = '+ ldids);
        Map<String,String> mapRes = new Map<string,String>();
        mapres.put('id',ldids);
        mapres.put('status','Success');
        return mapRes;
        	
    }

}