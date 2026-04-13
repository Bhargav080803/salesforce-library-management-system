public with sharing class BorrowingDashboardController {

    @AuraEnabled(cacheable=true)
    public static List<Borrowing_Record__c> getBorrowings() {
        return [
            SELECT Id, Name,
                   Member__r.Name,
                   Book__r.Name,
                   Borrow_Date__c,
                   Due_Date__c,
                   Return_Date__c,
                   Borrow_Status__c,
                   Fine__c
            FROM Borrowing_Record__c
            ORDER BY Borrow_Date__c DESC
        ];
    }

    @AuraEnabled
    public static void deleteBorrowing(Id borrowingId) {
        delete [SELECT Id FROM Borrowing_Record__c WHERE Id = :borrowingId];
    }
}