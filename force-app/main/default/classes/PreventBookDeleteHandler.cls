public with sharing class PreventBookDeleteHandler {

    public static void PreventBookDelete(List<Book__c> bookList) {

        
            set<Id> bookId = new set<Id>();

            for(Book__c b : bookList)
            {
                bookId.add(b.Id);
            }

            List<Borrowing_Record__c> activeBorrows = [SELECT Id, Book__c FROM Borrowing_Record__c WHERE Book__c IN :bookId AND Borrow_Status__c = 'Borrowed'];
            set<Id> activeBookId = new Set<Id>();

            for(Borrowing_Record__c br : activeBorrows)
            {
                activeBookId.add(br.Book__c);
            }

            for(Book__c b : bookList)
            {
                if(activeBookId.contains(b.Id))
                {
                    b.addError('Cannot delete book as it is currently borrowed');
                }
            }

    }
}