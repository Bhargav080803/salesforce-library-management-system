public with sharing class BookFileController {

    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getFiles(Id recordId) {
        return [
            SELECT Id,
                   ContentDocumentId,
                   ContentDocument.Title,
                   ContentDocument.FileType,
                   ContentDocument.ContentSize
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
            ORDER BY ContentDocument.CreatedDate DESC
        ];
    }

    // ⭐ DELETE FILE METHOD
    @AuraEnabled
public static void deleteFile(String contentDocumentId) {

    // 1️⃣ Delete ONLY the link tied to your Book record
    List<ContentDocumentLink> cdlToDelete = [
        SELECT Id
        FROM ContentDocumentLink
        WHERE ContentDocumentId = :contentDocumentId
        AND LinkedEntityId IN (
            SELECT Id FROM Book__c
        )
    ];
    delete cdlToDelete;

    // 2️⃣ Check if any links still exist
    Integer remainingLinks = [
        SELECT COUNT()
        FROM ContentDocumentLink
        WHERE ContentDocumentId = :contentDocumentId
    ];

    // 3️⃣ If no links remain, delete the ContentDocument
    if (remainingLinks == 0) {
        delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
    }
}
}