import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BorrowManagerLauncher extends NavigationMixin(LightningElement) {

    @api recordId;

    connectedCallback() {

        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Books_and_Members' 
            }
        });

    }
}