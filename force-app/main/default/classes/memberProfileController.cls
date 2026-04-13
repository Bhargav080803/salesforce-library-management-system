public with sharing class memberProfileController {

    @AuraEnabled(cacheable=true)
public static Map<String, Object> getLoggedInMemberPhoto() {

    Id userId = UserInfo.getUserId();

    Member__c member = [
        SELECT Id,
               Name,
               Member_Name__c,
               Email__c,
               Phone__c,
               Status__c,
               Borrow_Count__c,
               Membership_Type__c
               
        FROM Member__c
        WHERE User__c = :userId
        LIMIT 1
    ];

    User u = [
        SELECT FullPhotoUrl
        FROM User
        WHERE Id = :userId
    ];

    return new Map<String, Object>{
        'member' => member,
        'photoUrl' => u.FullPhotoUrl
    };
}



@AuraEnabled(cacheable=true)
public static Map<String, Integer> getMemberSummary() {

    Id userId = UserInfo.getUserId();

    Member__c member = [
        SELECT Id
        FROM Member__c
        WHERE User__c = :userId
        LIMIT 1
    ];

    Map<String, Integer> summary = new Map<String, Integer>();

    summary.put('borrowed', [
        SELECT COUNT()
        FROM Borrowing_Record__c
        WHERE Member__c = :member.Id
        AND Borrow_Status__c = 'Borrowed'
    ]);

    summary.put('overdue', [
        SELECT COUNT()
        FROM Borrowing_Record__c
        WHERE Member__c = :member.Id
        AND Borrow_Status__c = 'Overdue'
    ]);

    summary.put('reserved', [
        SELECT COUNT()
        FROM Reservation__c
        WHERE Member__c = :member.Id
    ]);

    summary.put('returned', [
        SELECT COUNT()
        FROM Borrowing_Record__c
        WHERE Member__c = :member.Id
        AND Borrow_Status__c = 'Returned'
    ]);

    return summary;
}


@AuraEnabled(cacheable=true)
public static List<Borrowing_Record__c> getRecentBorrowedBooks() {

    Id userId = UserInfo.getUserId();

    Member__c member = [
        SELECT Id
        FROM Member__c
        WHERE User__c = :userId
        LIMIT 1
    ];

    return [
        SELECT Id,
               Book__r.Name,
               Book_Title__c,
               Borrow_Date__c,
               Due_date__c,
               Borrow_Status__c
        FROM Borrowing_Record__c
        WHERE Member__c = :member.Id
        ORDER BY CreatedDate DESC
        LIMIT 5
    ];
}

}