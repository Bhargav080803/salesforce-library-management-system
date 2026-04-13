import { LightningElement, api, wire } from 'lwc';
import getTotalFine from '@salesforce/apex/MemberFineController.getTotalFine';

export default class MemberFineSummary extends LightningElement {

    @api recordId;
    totalFine = 0;

    @wire(getTotalFine, { memberId: '$recordId' })
    wiredFine({ error, data }) {
        if (data !== undefined) {
            this.totalFine = data;
        } else if (error) {
            console.error('Error fetching fine:', error);
        }
    }

    get hasFine() {
        return this.totalFine > 0;
    }

    get formattedFine() {
        return this.totalFine ? this.totalFine.toFixed(2) : '0.00';
    }
}