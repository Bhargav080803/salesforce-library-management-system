public with sharing class MemberController {

    @AuraEnabled(cacheable=true)
    public static Integer getTotalMembers() {
        return [SELECT COUNT() FROM Member__c];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getActiveMembers() {
        return [
            SELECT COUNT()
            FROM Member__c
            WHERE Status__c = 'Active'
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getInactiveMembers() {
        return [
            SELECT COUNT()
            FROM Member__c
            WHERE Status__c = 'Inactive'
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getBorrowingMembers() {

        AggregateResult ar = [
            SELECT COUNT_DISTINCT(Member__c) total
            FROM Borrowing_Record__c
            WHERE Borrow_Status__c = 'Borrowed'
        ];

    return (Integer) ar.get('total');
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Member__c> getMemberTable() {
        return [
            SELECT Id,
                   Name,
                   Member_Name__c,
                   Email__c,
                   Phone__c,
                   Borrow_Count__c,
                   Status__c
            FROM Member__c
        ];
    }

    @AuraEnabled
    public static void deleteMember(Id memberId) {
        delete [SELECT Id FROM Member__c WHERE Id = :memberId];
    }
}