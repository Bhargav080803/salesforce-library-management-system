public with sharing class BookController {
    
    @AuraEnabled(cacheable=true)
    public static List<Book__c> getBooks() {
        try {
            return [
                SELECT Id, Name,  Title__c, Author__c, 
                     	ISBN__c, Published_Date__c,Category__c,
                       Availability_Status__c
                FROM Book__c
                ORDER BY Name ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching books: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Book__c getBookById(Id bookId) {
        try {
            List<Book__c> books = [
                SELECT Id, Name,  Title__c, Author__c, 
                     	ISBN__c, Published_Date__c,Category__c,
                       Availability_Status__c
                FROM Book__c
                WHERE Id = :bookId
                LIMIT 1
            ];
            
            return books.isEmpty() ? null : books[0];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching book: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteBook(Id bookId) {
        delete [SELECT Id FROM Book__c WHERE Id = :bookId];
    }
}