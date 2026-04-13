public with sharing class BooksDashboardController {

    @AuraEnabled(cacheable=true)
    public static List<Book__c> getBooks() {
        return [
            SELECT Id, Name,
                   Title__c,
                   Author__c,
                   Category__c,
                   Availability_Status__c,
                   Published_Date__c
            FROM Book__c
            ORDER BY CreatedDate DESC
        ];
    }
}