import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getTotalReservations from '@salesforce/apex/ReservationController.getTotalReservations';
import getActiveReservations from '@salesforce/apex/ReservationController.getActiveReservations';
import getCompletedReservations from '@salesforce/apex/ReservationController.getCompletedReservations';
import getCancelledReservations from '@salesforce/apex/ReservationController.getCancelledReservations';
import getReservations from '@salesforce/apex/ReservationController.getReservations';
import deleteReservation from '@salesforce/apex/ReservationController.deleteReservation';

export default class ReservationDashboard extends NavigationMixin(LightningElement) {

    totalReservations = 0;
    activeReservations = 0;
    completedReservations = 0;
    cancelledReservations = 0;

    // FULL DATA
    @track allRecords = [];

    // PAGINATED DATA
    @track records = [];

    // Pagination
    pageSize = 10;
    currentPage = 1;
    totalPages = 1;

    selectedId;
    showDeleteModal = false;

    columns = [
        {
            label: 'Reservation ID',
            fieldName: 'recordUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_self'
            }
        },
        { label: 'Member', fieldName: 'memberName' },
        { label: 'Book', fieldName: 'bookName' },
        { label: 'Reservation Date', fieldName: 'Reservation_Date__c', type: 'date' },
        { label: 'Status', fieldName: 'Status__c' }
    ];


    @wire(getTotalReservations)
    wiredTotal({ data }) { if(data) this.totalReservations = data; }

    @wire(getActiveReservations)
    wiredActive({ data }) { if(data) this.activeReservations = data; }

    @wire(getCompletedReservations)
    wiredCompleted({ data }) { if(data) this.completedReservations = data; }

    @wire(getCancelledReservations)
    wiredCancelled({ data }) { if(data) this.cancelledReservations = data; }

    
    @wire(getReservations)
    wiredData({ data }) {
        if(data){
            this.allRecords = data.map(row => {
                return {
                    ...row,
                    memberName: row.Member__r?.Name,
                    bookName: row.Book__r?.Name,
                    recordUrl: '/' + row.Id
                };
            });

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

    
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        if(selectedRows.length > 0){
            this.selectedId = selectedRows[0].Id;
        }
    }

    
    handleNew(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Reservation__c',
                actionName: 'new'
            }
        });
    }

    handleEdit(){
        if(!this.selectedId) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedId,
                objectApiName: 'Reservation__c',
                actionName: 'edit'
            }
        });
    }

    openDeleteModal(){
        if(this.selectedId){
            this.showDeleteModal = true;
        }
    }

    closeDeleteModal(){
        this.showDeleteModal = false;
    }

    confirmDelete(){
        deleteReservation({ reservationId: this.selectedId })
            .then(() => {
                this.showDeleteModal = false;
                window.location.reload();
            });
    }
}