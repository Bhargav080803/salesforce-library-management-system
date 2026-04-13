trigger PreventBookDeleteTrigger on Book__c (before delete) {

    if(Trigger.isBefore && Trigger.isDelete)
    {
        PreventBookDeleteHandler.PreventBookDelete(Trigger.old);
    }

}