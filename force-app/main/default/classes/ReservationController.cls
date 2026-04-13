public with sharing class ReservationController {

    // 1️⃣ TOTAL RESERVATIONS
    @AuraEnabled(cacheable=true)
    public static Integer getTotalReservations() {
        return [
            SELECT COUNT()
            FROM Reservation__c
        ];
    }

    // 2️⃣ ACTIVE RESERVATIONS
    @AuraEnabled(cacheable=true)
    public static Integer getActiveReservations() {
        return [
            SELECT COUNT()
            FROM Reservation__c
            WHERE Status__c = 'Active'
        ];
    }

    // 3️⃣ COMPLETED RESERVATIONS
    @AuraEnabled(cacheable=true)
    public static Integer getCompletedReservations() {
        return [
            SELECT COUNT()
            FROM Reservation__c
            WHERE Status__c = 'Completed'
        ];
    }

    // 4️⃣ CANCELLED RESERVATIONS
    @AuraEnabled(cacheable=true)
    public static Integer getCancelledReservations() {
        return [
            SELECT COUNT()
            FROM Reservation__c
            WHERE Status__c = 'Cancelled'
        ];
    }

    // 5️⃣ RESERVATION TABLE
    @AuraEnabled(cacheable=true)
    public static List<Reservation__c> getReservations() {

        return [
            SELECT Id,
                   Name,
                   Member__r.Name,
                   Book__r.Name,
                   Reservation_Date__c,
                   Status__c
            FROM Reservation__c
            ORDER BY Reservation_Date__c DESC
        ];
    }

    // 6️⃣ DELETE RESERVATION
    @AuraEnabled
    public static void deleteReservation(Id reservationId) {
        delete [SELECT Id FROM Reservation__c WHERE Id = :reservationId];
    }
}