trigger IsBookReturnedTrigger on Borrowing_Record__c (After  update) {

    if(trigger.isUpdate)
    {
        IsBookReturnedHandler.isCheckBoxTrue(trigger.new);
    }
    

}