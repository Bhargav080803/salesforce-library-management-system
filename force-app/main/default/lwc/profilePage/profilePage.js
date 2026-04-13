import { LightningElement, wire } from 'lwc';
import getLoggedInMemberPhoto from '@salesforce/apex/memberProfileController.getLoggedInMemberPhoto';
import getMemberSummary from '@salesforce/apex/memberProfileController.getMemberSummary';
import getRecentBorrowedBooks from '@salesforce/apex/memberProfileController.getRecentBorrowedBooks';

export default class ProfilePage extends LightningElement {

    member;
    imageUrl;
    summary = {};
recentBooks = [];

@wire(getMemberSummary)
wiredSummary({ data }) {
    if (data) {
        this.summary = data;
    }
}

@wire(getRecentBorrowedBooks)
wiredBooks({ data }) {
    if (data) {
        this.recentBooks = data;
    }
}

    @wire(getLoggedInMemberPhoto)
    wiredMember({ data, error }) {
        if (data) {
            this.member = data.member;
            this.imageUrl = data.photoUrl;
        } else if (error) {
            console.error(error);
        }
    }

    get statusClass() {
        if (!this.member) return '';
        return this.member.Status__c === 'Active'
            ? 'status-badge active'
            : 'status-badge inactive';
    }
}