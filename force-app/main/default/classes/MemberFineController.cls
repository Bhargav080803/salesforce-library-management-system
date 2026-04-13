public with sharing class MemberFineController {

    @AuraEnabled(cacheable=true)
    public static Decimal getTotalFine(Id memberId) {
        
        AggregateResult result = [
            SELECT SUM(Fine__c) totalFine
            FROM Borrowing_Record__c
            WHERE Member__c = :memberId
            AND Fine__c > 0
        ];
        
        Decimal totalFine = (Decimal) result.get('totalFine');
        return totalFine == null ? 0 : totalFine;
    }
}