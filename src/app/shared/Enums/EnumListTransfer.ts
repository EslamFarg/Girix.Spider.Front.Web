export enum TransferRequestViewType
{
    Outgoing = 1, // طلبات التحويل الصادرة (اللي أنا بعتها)
    IncomingReview = 2, // طلبات واردة محتاجة موافقة/رفض مني كمُرسل
    ReceiptConfirmation = 3// طلبات محتاجة تأكيد/رفض الاستلام مني كمُستقبل
}