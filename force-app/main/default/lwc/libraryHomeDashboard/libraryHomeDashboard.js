import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUserProfileName from '@salesforce/apex/UserInfoController.getUserProfileName';

export default class LibraryHomeDashboard extends NavigationMixin(LightningElement) {

    userProfileName;

    connectedCallback() {
        getUserProfileName()
            .then(result => {
                this.userProfileName = result;
            })
            .catch(error => {
                console.error('Error fetching profile', error);
            });
    }

    //   custom tab
    navigateToTab(apiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: apiName
            }
        });
    }

    
    navigateToObject(objectApiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: objectApiName,
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            }
        });
    }

    // Tiles

    navigateToBooks() {
        this.navigateToTab('Books_Records'); 
        
    }

    navigateToMembers() {
        this.navigateToTab('Member_Records');
    }

    navigateToBorrow() {
        this.navigateToTab('Borrow_Records'); 
        
    }

    navigateToReservation() {
        this.navigateToTab('Reservation_Record');
    }

    navigateToDashboard() {

       //   dashboard routing
        if (this.userProfileName === 'Member') {
            this.navigateToTab('Member_Dashboard');
        } else {
            this.navigateToTab('Librarian_Dashboard');
        }

    }

    navigateToProfile() {
    this.navigateToTab('Profile_Page'); 
    
    }
}