import { LightningElement, api, wire } from 'lwc';
import getBorrowHistory from '@salesforce/apex/BookBorrowHistoryController.getBorrowHistory';

export default class BookBorrowHistory extends LightningElement {

    @api recordId;
    borrowRecords;

    @wire(getBorrowHistory, { bookId: '$recordId' })
    wiredBorrows({ data, error }) {
        if (data) {
            this.borrowRecords = data;
        } else if (error) {
            console.error(error);
        }
    }
}