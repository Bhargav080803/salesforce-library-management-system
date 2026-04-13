@isTest
public with sharing class LibraryApexTestClass 
{
    @TestSetup
    public static void setUpData(){
        
        Member__c member = new Member__c( Borrow_Count__c = 0);
        insert member;

        Book__c book = new Book__c(Availability_Status__c = 'Available');
        insert book;
    }

    //Scenerio 1: Test Book status Update
    @isTest
    public static void testBookStatusAvailableHandler() 
    {   
        Member__c member = [select id from Member__c limit 1];
        Book__c book = [select id from Book__c limit 1];

        Borrowing_Record__c borrow = new Borrowing_Record__c(Member__c = member.Id, Book__c = book.Id, Borrow_Date__c = Date.today()-10, Due_Date__c = Date.today()-3, Borrow_Status__c = 'Borrowed');
        insert borrow;

        book__c updateBookStatus = [select Availability_Status__c from Book__c where id = :book.id];
        
        System.assertEquals('Borrowed', updateBookStatus.Availability_Status__c);

       borrow.Borrow_Status__c = 'Returned';
        update borrow;

// Re-query to confirm
            Borrowing_Record__c updatedBorrow =
            [SELECT Borrow_Status__c 
            FROM Borrowing_Record__c 
            WHERE Id = :borrow.Id];

System.assertEquals('Returned', updatedBorrow.Borrow_Status__c);


        updateBookStatus = [select Availability_Status__c from Book__c where id = :book.id];

        System.assertEquals('Available', updateBookStatus.Availability_Status__c);
        
    }

    //Scenerio 2: Test Prevent Book Deletion
    @isTest
    public static void testPreventBookDeleteHandler()
    {
        Member__c member = [select id from Member__c limit 1];
        Book__c book = [select id from Book__c limit 1];


        Borrowing_Record__c borrow = new Borrowing_Record__c(Member__c = member.Id, Book__c = book.Id, Borrow_Date__c = Date.today()-10, Due_Date__c = Date.today()-3, Borrow_Status__c = 'Borrowed');
        insert borrow;

        Test.startTest();
        try{
            delete book;
            System.assert(false);
        }catch(Exception e){
            System.assert(e.getMessage().contains('Cannot delete book as it is currently borrowed'));
        }
        Test.stopTest();



    }

    //Scenerio 3: Test Prevent Member Deletion
    @isTest
    public static void testPreventMemberDeletionHandler()
    {
        Member__c member = [select id from Member__c limit 1];
        Book__c book = [select id from Book__c limit 1];

        Borrowing_Record__c borrow = new Borrowing_Record__c(Member__c = member.Id, Book__c = book.Id, Borrow_Date__c = Date.today()-10, Due_Date__c = Date.today()-3, Borrow_Status__c = 'Borrowed');
        insert borrow;

        Test.startTest();
        try{
            delete member;
            System.assert(false);
        }catch(Exception e){
             System.assert(e.getMessage().contains('Cannot delete member with active borrowing records'));
        }
        Test.stopTest();
    }





}