import { LightningElement,track,wire } from 'lwc';
import getMembers from '@salesforce/apex/LibraryController.getMembers';


export default class MemberList extends LightningElement {
    @track members 

    columns = [{label:'Member Id',fieldName:'Name'},
        {label:'Member Name', fieldName:'Member_Name__c'},
        {label:'Membership type',fieldName:'Membership_Type__c'},
        {label:'Status',fieldName:'Status__c'},
        {label:'Borrow Count' ,fieldName:'Borrow_Count__c'}];

    @wire(getMembers)
    wiredMembers({error,data}){
        if(data){
            this.members = data;
        }
        else if(error){
            console.log(error);
        }
        
    }

    handleRowSelection(event){
        const selectedRows = event.detail.selectedRows;
        console.log(selectedRows);
        if(selectedRows.length>0)
        {
        const memberId=selectedRows[0]?.Id;

        this.dispatchEvent(new CustomEvent('memberselected',{detail:memberId}));
        }
        
    }
       
}