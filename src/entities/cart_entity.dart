import '../../../../../core/utils/constants/global_variables.dart';
import 'cart_item_entity.dart';

/// Domain entity representing the entire shopping cart
/// Encapsulates all cart operations and calculations
class CartEntity {
  final List<CartItemEntity> items;

  const CartEntity({required this.items});

  /// Calculate subtotal (sum of all items)
  double get subtotal => items.fold(0, (sum, item) => sum + item.subtotal);
  double get totalAfterDiscount {
    double finalTotal = subtotal * (1 - (discountPrecentage / 100));

    return finalTotal;
  }

  /// Calculate tax based on subtotal and tax percentage
  double get tax => items.fold(0, (sum, item) => sum + item.taxAmount);
  double get getTotalWithoutTax {
    double finalTotal = subtotal - tax;

    return finalTotal;
  }

  /// Calculate total before discount
  double get totalBeforeDiscount => subtotal + tax + serviceFee;
  double get discountPrecentage {
    return financialSettings?.discount ?? 0;
  }

  double get discountAmount {
    double discountValue = subtotal * (discountPrecentage / 100);
    return discountValue;
  }

  /// Calculate final total after discount
  double get total {
    double finalTotal = subtotal * (1 - (discountPrecentage / 100));

    return finalTotal;
  }

  //get service fee with tax
  double get serviceFee {
    bool feeDiscountValue = financialSettings?.serviceFeeType == 1
        ? true
        : false;
    double feeValue = feeDiscountValue == true
        ? (financialSettings?.serviceFee ?? 0)
        : (((financialSettings?.serviceFee ?? 0) / 100) *
              (getTotalWithoutTax * (1 - (discountPrecentage / 100))));
    double serviceFeeWithTax =
        feeValue *
        ((financialSettings?.vatAmount ?? 0) == 0
            ? 1
            : (1 + ((financialSettings?.vatAmount ?? 0) / 100)));
    return serviceFeeWithTax;
  }

  double get totalWithServiceFee {
    double finalTotal =
        ((subtotal * (1 - (discountPrecentage / 100))) + serviceFee);

    return finalTotal;
  }

  //get service fee with tax
  double get deliveryFee {
    bool feeDiscountValue = financialSettings?.deliveryFeeType == 1
        ? true
        : false;
    double feeValue = feeDiscountValue == true
        ? (financialSettings?.deliveryFee ?? 0)
        : (((financialSettings?.deliveryFee ?? 0) / 100) *
              (getTotalWithoutTax * (1 - (discountPrecentage / 100))));
    double deliveryFeeWithTax =
        feeValue *
        ((financialSettings?.vatAmount ?? 0) == 0
            ? 1
            : (1 + ((financialSettings?.vatAmount ?? 0) / 100)));
    return deliveryFeeWithTax;
  }

  double get totalWithDeliveryFee {
    double finalTotal =
        ((subtotal * (1 - (discountPrecentage / 100))) + deliveryFee);

    return finalTotal;
  }

  /// Get total number of items (sum of quantities)
  int get itemsCount => items.fold(0, (sum, item) => sum + item.quantity);

  /// Check if cart is empty
  bool get isEmpty => items.isEmpty;

  /// Get average item price
  double get averageItemPrice => isEmpty ? 0 : subtotal / itemsCount;

  /// Create a copy with optional field updates
  CartEntity copyWith({List<CartItemEntity>? items}) {
    return CartEntity(items: items ?? this.items);
  }

  /// Add a new item to cart (always creates new entry)
  CartEntity addItem(CartItemEntity newItem) {
    // Simply append the new item, no checking for duplicates
    return copyWith(items: [...items, newItem]);
  }

  /// Find item by cart entry ID
  CartItemEntity? findItemByCartEntryId(String cartEntryId) {
    try {
      return items.firstWhere((item) => item.cartEntryId == cartEntryId);
    } catch (e) {
      return null;
    }
  }

  /// Remove an item from cart by cart entry ID
  CartEntity removeItem(String cartEntryId) {
    return copyWith(
      items: items.where((item) => item.cartEntryId != cartEntryId).toList(),
    );
  }

  /// Update item quantity by cart entry ID
  CartEntity updateItemQuantity(String cartEntryId, int newQuantity) {
    if (newQuantity <= 0) return removeItem(cartEntryId);

    return copyWith(
      items: items
          .map(
            (item) => item.cartEntryId == cartEntryId
                ? item.copyWith(quantity: newQuantity)
                : item,
          )
          .toList(),
    );
  }

  /// Add an extra to a specific item by cart entry ID
  CartEntity addExtraToItem(String cartEntryId, dynamic extra) {
    return copyWith(
      items: items
          .map(
            (item) =>
                item.cartEntryId == cartEntryId ? item.addExtra(extra) : item,
          )
          .toList(),
    );
  }

  /// Remove an extra from a specific item by cart entry ID
  CartEntity removeExtraFromItem(String cartEntryId, int extraId) {
    return copyWith(
      items: items
          .map(
            (item) => item.cartEntryId == cartEntryId
                ? item.removeExtra(extraId)
                : item,
          )
          .toList(),
    );
  }

  /// Apply a discount to the cart
  CartEntity applyDiscount({required double amount, String? code}) {
    return copyWith();
  }

  /// Remove discount from cart
  CartEntity removeDiscount() {
    return copyWith();
  }

  /// Clear the entire cart
  CartEntity clear() {
    return CartEntity(items: []);
  }

  @override
  String toString() => 'CartEntity(itemsCount: $itemsCount, total: $total)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CartEntity &&
          runtimeType == other.runtimeType &&
          items == other.items;

  @override
  int get hashCode => items.hashCode;
}
