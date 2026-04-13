public with sharing class LibraryController {


// ------------------- GET BOOKS -------------------
@AuraEnabled(cacheable=true)
public static List<Book__c> getBooks() {
    return [
        SELECT Id, Name, Title__c, Author__c, Category__c, Availability_Status__c
        FROM Book__c
        ORDER BY Name
    ];
}

// ------------------- GET MEMBERS -------------------
@AuraEnabled(cacheable=true)
public static List<Member__c> getMembers() {
    return [
        SELECT Id, Name, Member_Name__c, Membership_Type__c, Status__c, Borrow_Count__c
        FROM Member__c
        ORDER BY Name
    ];
}

// ------------------- GET AVAILABLE BOOKS -------------------
@AuraEnabled(cacheable=true)
public static List<Book__c> getAvailableBooks() {
    return [
        SELECT Id, Name
        FROM Book__c
        WHERE Availability_Status__c = 'Available'
        ORDER BY Name
    ];
}

// ------------------- BORROW BOOK -------------------
@AuraEnabled
public static void createBorrowRecord(Id memberId, Id bookId)
{
    try {

        if(memberId == null || bookId == null){
            throw new AuraHandledException('Member and Book are required');
        }

        Book__c book = [
            SELECT Id, Availability_Status__c
            FROM Book__c
            WHERE Id = :bookId
            LIMIT 1
        ];

        if(book.Availability_Status__c == null ||
           !book.Availability_Status__c.equalsIgnoreCase('Available')){
            throw new AuraHandledException('Book is not available');
        }

        Borrowing_Record__c borrow = new Borrowing_Record__c(
            Member__c = memberId,
            Book__c = bookId,
            Borrow_Date__c = Date.today(),
            Due_Date__c = Date.today().addDays(7),
            Borrow_Status__c = 'Borrowed',
            Is_Returned__c = false
        );

        insert borrow;

        // ✅ Use correct picklist value
        book.Availability_Status__c = 'Borrowed';
        update book;

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

// ------------------- RETURN BOOK -------------------
@AuraEnabled
public static void returnBook(Id borrowId)
{
    Borrowing_Record__c borrow = [
        SELECT Id, Book__c
        FROM Borrowing_Record__c
        WHERE Id = :borrowId
        LIMIT 1
    ];

    borrow.Borrow_Status__c = 'Returned';
    borrow.Is_Returned__c = true;
    update borrow;

    // Make Book Available Again
    Book__c book = [
        SELECT Id, Availability_Status__c
        FROM Book__c
        WHERE Id = :borrow.Book__c
        LIMIT 1
    ];

    book.Availability_Status__c = 'Available';
    update book;
}

// ------------------- ACTIVE BORROWS -------------------
@AuraEnabled(cacheable=true)
public static List<Borrowing_Record__c> getActiveBorrows(Id memberId){

    if(memberId == null){
        return new List<Borrowing_Record__c>();
    }

    return [
        SELECT Id,
               Name,
               Borrow_Date__c,
               Due_Date__c,
               Borrow_Status__c,
               Book__r.Name,
               Book__r.Title__c,
               Book__r.Author__c
        FROM Borrowing_Record__c
        WHERE Member__c = :memberId
        AND Borrow_Status__c = 'Borrowed'
        ORDER BY Borrow_Date__c DESC
    ];
}


}