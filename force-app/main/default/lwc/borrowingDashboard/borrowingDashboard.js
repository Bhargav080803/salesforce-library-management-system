import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getBorrowings from '@salesforce/apex/BorrowingDashboardController.getBorrowings';
import deleteBorrowing from '@salesforce/apex/BorrowingDashboardController.deleteBorrowing';

const columns = [
    {
        label: 'Borrowing ID',
        fieldName: 'recordUrl',
        type: 'url',
        typeAttributes: { label: { fieldName: 'Name' }, target: '_self' }
    },
    { label: 'Member Id', fieldName: 'memberName' },
    
    { label: 'Book', fieldName: 'bookName' },
    { label: 'Borrow Date', fieldName: 'Borrow_Date__c', type: 'date' },
    { label: 'Due Date', fieldName: 'Due_date__c', type: 'date' },
    {
        label: 'Status',
        fieldName: 'Borrow_Status__c',
        type: 'text',
        cellAttributes: { class: { fieldName: 'statusClass' } }
    },
    { label: 'Fine', fieldName: 'Fine__c', type: 'currency' }
];

export default class BorrowingDashboard extends NavigationMixin(LightningElement) {

    columns = columns;

    // FULL DATA
    @track allRecords = [];

    // PAGINATED DATA
    @track records = [];

    activeCount = 0;
    returnedCount = 0;
    overdueCount = 0;
    totalFine = 0;

    // Pagination variables
    pageSize = 10;
    currentPage = 1;
    totalPages = 1;

    selectedBorrowingId;
    showDeleteModal = false;
    wiredBorrowings;

   
    @wire(getBorrowings)
    wiredData(result) {
        this.wiredBorrowings = result;
        const { data } = result;

        if (data) {
            this.allRecords = data.map(row => {

                let statusClass =
                    row.Borrow_Status__c === 'Borrowed'
                        ? 'slds-text-color_success slds-text-title_bold'
                        : row.Borrow_Status__c === 'Returned'
                        ? 'slds-text-color_brand slds-text-title_bold'
                        : 'slds-text-color_error slds-text-title_bold';

                return {
                    ...row,
                    memberName: row.Member__r?.Name,
                    bookName: row.Book__r?.Name,
                    recordUrl: '/' + row.Id,
                    statusClass
                };
            });

            this.calculateStats();
            this.setupPagination();
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
        this.activeCount = this.allRecords.filter(r => r.Borrow_Status__c === 'Borrowed').length;
        this.returnedCount = this.allRecords.filter(r => r.Borrow_Status__c === 'Returned').length;
        this.overdueCount = this.allRecords.filter(
            r => r.Borrow_Status__c === 'Borrowed' &&
            r.Due_Date__c &&
            new Date(r.Due_Date__c) < new Date()
        ).length;
        this.totalFine = this.allRecords.reduce((sum, r) => sum + (r.Fine__c || 0), 0);
    }

    get formattedFine() {
        return this.totalFine ? this.totalFine.toFixed(2) : '0.00';
    }

  
    handleRowSelection(event) {
        const rows = event.detail.selectedRows;
        this.selectedBorrowingId = rows.length ? rows[0].Id : null;
    }

   
    handleNew() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Borrowing_Record__c',
                actionName: 'new'
            }
        });
    }

    handleEdit() {
        if (!this.selectedBorrowingId) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedBorrowingId,
                objectApiName: 'Borrowing_Record__c',
                actionName: 'edit'
            }
        });
    }

    openDeleteModal() {
        if (!this.selectedBorrowingId) return;
        this.showDeleteModal = true;
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
    }

    confirmDelete() {
        deleteBorrowing({ borrowingId: this.selectedBorrowingId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Borrowing Record Deleted',
                        variant: 'success'
                    })
                );

                this.showDeleteModal = false;
                this.selectedBorrowingId = null;

                return refreshApex(this.wiredBorrowings);
            });
    }
}