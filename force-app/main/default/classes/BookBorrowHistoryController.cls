public with sharing class BookBorrowHistoryController {

    @AuraEnabled(cacheable=true)
    public static List<BorrowWrapper> getBorrowHistory(Id bookId) {
        
        List<Borrowing_Record__c> borrows = [
            SELECT Id,
                   Member__r.Name,
                   Borrow_Date__c,
                   Due_date__c,
                   Return_Date__c
            FROM Borrowing_Record__c
            WHERE Book__c = :bookId
            ORDER BY Borrow_Date__c DESC
        ];
        
        List<BorrowWrapper> result = new List<BorrowWrapper>();
        
        for(Borrowing_Record__c b : borrows){
            
            BorrowWrapper bw = new BorrowWrapper();
            bw.id = b.Id;
            bw.memberName = b.Member__r.Name;
            bw.borrowDate = b.Borrow_Date__c;
            bw.dueDate = b.Due_Date__c;
            bw.returnDate = b.Return_Date__c;
            
            if(b.Return_Date__c != null){
                bw.status = 'Returned';
                bw.statusClass = 'green';
            }
            else if(b.Due_Date__c < Date.today()){
                bw.status = 'Overdue';
                bw.statusClass = 'red';
            }
            else{
                bw.status = 'Active';
                bw.statusClass = 'yellow';
            }
            
            result.add(bw);
        }
        
        return result;
    }
    
    public class BorrowWrapper{
        @AuraEnabled public Id id;
        @AuraEnabled public String memberName;
        @AuraEnabled public Date borrowDate;
        @AuraEnabled public Date dueDate;
        @AuraEnabled public Date returnDate;
        @AuraEnabled public String status;
        @AuraEnabled public String statusClass;
    }
}