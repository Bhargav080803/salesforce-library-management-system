public with sharing class PreventMemberDeletionHandler {
    public static void preventMemberDeletion(List<Member__c> memberList)
    {
        for(Member__c member:memberList)
        {
            if(member.Borrow_Count__C !=null && member.Borrow_Count__C > 0)
            {
                member.addError('Cannot delete member with active borrowing records');
            }
        }
    }
}