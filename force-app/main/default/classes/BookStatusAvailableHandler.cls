public with sharing class BookStatusAvailableHandler {

    public static void BookStatusAvailableHandler(List<Borrowing_Record__c> newBorrowList, Map<Id, Borrowing_Record__c> oldMap) 
    {
        set<Id> booksToMakeAvailable = new set<Id>();

        for(Borrowing_Record__c br : newBorrowList)
        {
            Borrowing_Record__c oldBr = oldMap.get(br.Id);
            if(oldBr.return_date__c == null && br.return_date__c != null)
            {
                booksToMakeAvailable.add(br.Book__c);
            }
        }

        updateBooks(booksToMakeAvailable, 'Available');
    }


    public static void updateBooks(set<Id> bookIds, String status)
    {
        if(bookIds.isEmpty())
            return;

        List<Book__c> booksToUpdate = [SELECT Id, Availability_Status__c FROM Book__c WHERE Id IN :bookIds];
        
        for(Book__c b : booksToUpdate)
        {
            b.Availability_Status__c = status;
        }

        update booksToUpdate;
    }

    public static void updateBorrowStatus(List<Borrowing_Record__c> borrowList)
    {
        for(Borrowing_Record__c br : borrowList)
        {
            br.Borrow_Status__c = 'Returned';
        }
    }
}