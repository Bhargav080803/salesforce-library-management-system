public with sharing class IsBookReturnedHandler {

    public static void isCheckBoxTrue(List<Borrowing_Record__C> borrowingRecordList)
    {
        List<Borrowing_Record__C> listToDelete = new List<Borrowing_Record__C>();

        for(Borrowing_Record__C borrowingRecord : borrowingRecordList)
        {
            if(borrowingRecord.Is_Book_Returned__c == true)
            {
                listToDelete.add(borrowingRecord);
            }

        }
        delete listToDelete;
    }
 }
    
