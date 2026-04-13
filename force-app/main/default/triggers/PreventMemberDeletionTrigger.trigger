trigger PreventMemberDeletionTrigger on Member__c (before delete) {
    if(trigger.isDelete)
    {
        PreventMemberDeletionHandler.preventMemberDeletion(Trigger.old);
    }

}