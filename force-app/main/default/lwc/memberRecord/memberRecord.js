import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getTotalMembers from '@salesforce/apex/MemberController.getTotalMembers';
import getActiveMembers from '@salesforce/apex/MemberController.getActiveMembers';
import getInactiveMembers from '@salesforce/apex/MemberController.getInactiveMembers';
import getBorrowingMembers from '@salesforce/apex/MemberController.getBorrowingMembers';
import getMemberTable from '@salesforce/apex/MemberController.getMemberTable';
import deleteMember from '@salesforce/apex/MemberController.deleteMember';

export default class MemberRecord extends NavigationMixin(LightningElement) {

    totalMembers = 0;
    activeMembers = 0;
    inactiveMembers = 0;
    borrowingMembers = 0;

    // FULL DATA
    @track allMembers = [];

    // PAGINATED DATA
    @track memberList = [];

    // Pagination
    pageSize = 10;
    currentPage = 1;
    totalPages = 1;

    selectedMemberId;
    isEditDisabled = true;
    showDeleteModal = false;
    wiredTableResult;

    columns = [
        {
            label: 'Name',
            fieldName: 'recordUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_blank'
            }
        },
        { label: 'Phone', fieldName: 'Phone__c' },
        { label: 'Email', fieldName: 'Email__c' },
        { label: 'Borrow Count', fieldName: 'Borrow_Count__c' },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
        }
    ];

    

    @wire(getTotalMembers)
    wiredTotal({ data }) { if (data) this.totalMembers = data; }

    @wire(getActiveMembers)
    wiredActive({ data }) { if (data) this.activeMembers = data; }

    @wire(getInactiveMembers)
    wiredInactive({ data }) { if (data) this.inactiveMembers = data; }

    @wire(getBorrowingMembers)
    wiredBorrowing({ data }) { if (data) this.borrowingMembers = data; }

    

    @wire(getMemberTable)
    wiredTable(result) {
        this.wiredTableResult = result;

        const { data, error } = result;

        if (data) {

            this.allMembers = data.map(member => {

                let statusClass = '';

                if (member.Status__c === 'Active') {
                    statusClass = 'slds-text-color_success slds-text-title_bold';
                } else if (member.Status__c === 'Inactive') {
                    statusClass = 'slds-text-color_error slds-text-title_bold';
                }

                return {
                    ...member,
                    recordUrl: `/lightning/r/Member__c/${member.Id}/view`,
                    statusClass
                };
            });

            this.setupPagination();
        } 
        else if (error) {
            console.error('Error loading members:', error);
        }
    }

    

    setupPagination() {
        this.totalPages = Math.ceil(this.allMembers.length / this.pageSize);
        this.currentPage = 1;
        this.updatePageData();
    }

    updatePageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.memberList = this.allMembers.slice(start, end);
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

        if (selectedRows.length > 0) {
            this.selectedMemberId = selectedRows[0].Id;
            this.isEditDisabled = false;
        } else {
            this.selectedMemberId = null;
            this.isEditDisabled = true;
        }
    }

    

    handleNew() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Member__c',
                actionName: 'new'
            }
        });
    }

    handleEdit() {
        if (!this.selectedMemberId) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedMemberId,
                objectApiName: 'Member__c',
                actionName: 'edit'
            }
        });
    }

    openDeleteModal() {
        if (!this.selectedMemberId) return;
        this.showDeleteModal = true;
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
    }

    confirmDelete() {
        deleteMember({ memberId: this.selectedMemberId })
            .then(() => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Member Deleted',
                        variant: 'success'
                    })
                );

                this.showDeleteModal = false;
                this.isEditDisabled = true;
                this.selectedMemberId = null;

                return refreshApex(this.wiredTableResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}