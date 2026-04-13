import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getBooks from '@salesforce/apex/BookController.getBooks';
import deleteBook from '@salesforce/apex/BookController.deleteBook';

const columns = [
    {
        label: 'Book ID',
        fieldName: 'recordUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'Name' },
            target: '_self'
        }
    },
    { label: 'Title', fieldName: 'Title__c' },
    { label: 'Author', fieldName: 'Author__c' },
    { label: 'Category', fieldName: 'Category__c' },
    {
        label: 'Availability',
        fieldName: 'Availability_Status__c',
        type: 'text',
        cellAttributes: {
            class: { fieldName: 'statusClass' }
        }
    },
    { label: 'Published Date', fieldName: 'Published_Date__c', type: 'date' }
];

export default class BooksDashboard extends NavigationMixin(LightningElement) {

    columns = columns;

    // FULL DATA
    @track allRecords = [];

    // PAGINATED DATA
    @track records = [];

    totalBooks = 0;
    availableCount = 0;
    issuedCount = 0;
    reservedCount = 0;

    // Pagination
    pageSize = 10;
    currentPage = 1;
    totalPages = 1;

    selectedBookId;
    showDeleteModal = false;
    wiredBooksResult;

    
    @wire(getBooks)
    wiredData(result) {
        this.wiredBooksResult = result;
        const { data, error } = result;

        if (data) {

            this.allRecords = data.map(row => {

                let statusClass = row.Availability_Status__c === 'Available'
                    ? 'slds-text-color_success slds-text-title_bold'
                    : 'slds-text-color_error slds-text-title_bold';

                return {
                    ...row,
                    recordUrl: '/' + row.Id,
                    statusClass
                };
            });

            this.calculateStats();
            this.setupPagination();

        } else if (error) {
            console.error(error);
        }
    }

   
    setupPagination() {
        this.totalPages = Math.ceil(this.allRecords.length / this.pageSize);
        this.currentPage = 1;
        this.updatePageData();
    }

    updatePageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.records = this.allRecords.slice(start, end);
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePageData();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePageData();
        }
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    
    calculateStats() {

        this.totalBooks = this.allRecords.length;

        this.availableCount = this.allRecords.filter(
            r => r.Availability_Status__c === 'Available'
        ).length;

        this.issuedCount = this.allRecords.filter(
            r => r.Availability_Status__c === 'Issued'
        ).length;

        this.reservedCount = this.allRecords.filter(
            r => r.Availability_Status__c === 'Reserved'
        ).length;
    }

   
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;

        if (selectedRows.length > 0) {
            this.selectedBookId = selectedRows[0].Id;
        } else {
            this.selectedBookId = null;
        }
    }

   
    handleNewBook() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Book__c',
                actionName: 'new'
            }
        });
    }

    handleEditBook() {
        if (!this.selectedBookId) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedBookId,
                objectApiName: 'Book__c',
                actionName: 'edit'
            }
        });
    }

    openDeleteModal() {
        if (!this.selectedBookId) return;
        this.showDeleteModal = true;
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
    }

    confirmDelete() {
        deleteBook({ bookId: this.selectedBookId })
            .then(() => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Book Deleted',
                        variant: 'success'
                    })
                );

                this.showDeleteModal = false;
                this.selectedBookId = null;

                return refreshApex(this.wiredBooksResult);
            });
    }
}