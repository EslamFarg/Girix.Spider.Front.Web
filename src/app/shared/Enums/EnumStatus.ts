export  enum TransferRequestStatus
{

    Pending = 1, // طلب تحويل مخزني 
    Approved = 2, // الوارد
    PartiallyApproved = 3, // 
    RejectedBySender = 4, // الوارد
    Received = 5, // استلام التحويل المخزني
    PartiallyReceived = 6, // استلام التحويل المخزني
    RejectedByReceiver = 7, // رفض الاستلام المخزني
    Rejected
}