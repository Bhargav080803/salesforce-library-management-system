import { LightningElement, wire , track} from 'lwc';
import getBooks from '@salesforce/apex/LibraryController.getBooks';
import getMembers from '@salesforce/apex/LibraryController.getMembers';

export default class LibraryManagementSystem extends LightningElement {

    @track BookData;
    @track MemberData;

    selectedMemberId;


    BookColumns = [
        { label: 'Book ID', fieldName: 'Name' },
        { label: 'Title', fieldName: 'Title__c' },
        { label: 'Author', fieldName: 'Author__c' },
        { label: 'Category', fieldName: 'Category__c' }
    ];

    MemberColumns = [
        { label: 'Member ID', fieldName: 'Name' },
        { label: 'Member Name', fieldName: 'Member_Name__c' },
        { label:'Membership Type', fieldName: 'Membership_Type__c'},
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Borrow Count', fieldName: 'Borrow_Count__c' }
    ];

    @wire(getBooks)
    wiredBooks({ data, error }) {
        if (data) {
            this.BookData = data;
            console.log('Books: ', data);
        } else if (error) {
            console.error('Books error: ', error);
        }
    }

    @wire(getMembers)
    wiredMembers({ data, error }) {
        if (data) {
            this.MemberData = data;
            console.log('Members: ', data);
        } else if (error) {
            console.error('Members error: ', error);
        }
    }

    handleMemberSelected(event)
    {
        this.selectedMemberId = event.detail;
        console.log('PARENT RECEIVED member id : ',this.selectedMemberId);
    }
}