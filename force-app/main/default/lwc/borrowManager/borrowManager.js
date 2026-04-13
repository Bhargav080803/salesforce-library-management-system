import { LightningElement, api, wire } from 'lwc';
import getAvailableBooks from '@salesforce/apex/LibraryController.getAvailableBooks';
import createBorrowRecord from '@salesforce/apex/LibraryController.createBorrowRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getActiveBorrows from '@salesforce/apex/LibraryController.getActiveBorrows';
import returnBook from '@salesforce/apex/LibraryController.returnBook';
import {refreshApex} from '@salesforce/apex';

export default class BorrowManager extends LightningElement {

    @api selectedMemberId;

    wiredBorrowsResult;

    books = [];
    activeBorrows=[];

    selectedBookId;

    connectedCallback()
    {
        console.log('selected member id in Borrow Manager : ',this.selectedMemberId);
    }

    columns=[
     { label:'Book',fieldName:'bookName'},
     {label:'Borrow Date' ,fieldName:'Borrow_Date__c'},
     {label:'Due Date',fieldName:'Due_date__c'},
     {type:'button',
        typeAttributes:{
            label:'Return',
            name:'return',
            variant:'brand'
        }
    }
     
    ];
    
    

    @wire(getAvailableBooks)
    wiredBooks({ data, error })
    {
        console.log('Books from apex', data);
        
        if(data)
        {
            this.books = data.map(book => ({
                label: book.Name,
                value: book.Id
            }));
        }
    }

    
 
@wire(getActiveBorrows,{memberId:'$selectedMemberId'})
wiredBorrows(result) {
    this.wiredBorrowsResult = result;
 
    console.log('wired borrows executed', result);
 
    if(result.data) {
        this.activeBorrows = result.data.map(record => ({
            ...record,
            bookName: record.Book__r?.Name
        }));
    }
 
    if(result.error) {
        console.error(result.error);
    }
}
        

    handleBookChange(event)
    {
        this.selectedBookId = event.detail.value;
    }

    handleBorrow()
    {
        if(!this.selectedMemberId || !this.selectedBookId)
        {
            this.showToast('Error', 'Select member and book', 'error');
            return;
        }

        createBorrowRecord({memberId: this.selectedMemberId,bookId: this.selectedBookId,})
        .then(() => {
            this.showToast('Success', 'Book Borrowed', 'success');
            console.log("data table refreshed handle borrow");
            return refreshApex(this.wiredBorrowsResult);
            
            
            })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        });
    }


   handleRowAction(event) {
    const actionName = event.detail.action.name;
    const borrowId = event.detail.row.Id;
    console.log('Handle row action',actionName,'borrow id :',borrowId);

    if(actionName === 'return') {
        returnBook({ borrowId })
        .then(() => {
            this.showToast('Success', 'Book Returned', 'success');
            console.log("data table refreshed");
            return refreshApex(this.wiredBorrowsResult);
            
        })
        .catch(error => {
    console.error('FULL ERROR OBJECT:', JSON.stringify(error));
    console.error(error);

    let message = 'Unknown error';
    if(error?.body?.message){
        message = error.body.message;
    } else if(error?.message){
        message = error.message;
    }

    this.showToast('Error', message, 'error');
});
    }
}

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }



}