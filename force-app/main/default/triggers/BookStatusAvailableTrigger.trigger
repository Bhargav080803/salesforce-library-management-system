trigger BookStatusAvailableTrigger on Borrowing_Record__c (before update) {

    if(Trigger.isBefore && Trigger.isUpdate)
    {
        BookStatusAvailableHandler.BookStatusAvailableHandler(Trigger.new, Trigger.oldMap);
        BookStatusAvailableHandler.updateBorrowStatus(Trigger.new);
    }
    

}