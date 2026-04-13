import { LightningElement, api, wire, track } from 'lwc';
import getFiles from '@salesforce/apex/BookFileController.getFiles';
import deleteFile from '@salesforce/apex/BookFileController.deleteFile';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookFileUpload extends NavigationMixin(LightningElement) {

    @api recordId;
    @track files;
    wiredResult;

    @wire(getFiles, { recordId: '$recordId' })
    wiredFiles(result) {
        this.wiredResult = result;
        if (result.data) {
            this.files = result.data;
        }
    }

    handleUploadFinished() {
        refreshApex(this.wiredResult);
    }

    handlePreview(event) {
        const documentId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: documentId
            }
        });
    }

    handleDownload(event) {
        const documentId = event.currentTarget.dataset.id;

        window.open(
            `/sfc/servlet.shepherd/document/download/${documentId}`,
            '_blank'
        );
    }

    // ⭐ DELETE FILE
    handleDelete(event) {
        const documentId = event.currentTarget.dataset.id;

        deleteFile({ contentDocumentId: documentId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File deleted successfully',
                        variant: 'success'
                    })
                );

                // Refresh list
                refreshApex(this.wiredResult);
            })
            .catch(error => {
                console.error('Error deleting file:', error);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting file',
                        message: error.body ? error.body.message : 'An error occurred',
                        variant: 'error'
                    })
                );
            });
    }
}