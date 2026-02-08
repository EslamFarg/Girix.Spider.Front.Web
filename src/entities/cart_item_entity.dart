import 'cart_extra_entity.dart';

/// Domain entity representing a cart item
/// Contains pure business logic without any data layer dependencies
class CartItemEntity {
  final int id; // Original menu item ID
  final String cartEntryId; // Unique ID for this cart entry
  final String name;
  final double basePrice;
  final double priceWithTax;
  final double priceWithSelectiveTax;
  final String? imageUrl;
  final String? description;
  final int quantity;
  final double? taxPercentage;
  final List<CartExtraEntity> extras;
  final bool? isMeal;

  const CartItemEntity({
    required this.id,
    required this.cartEntryId,
    required this.name,
    required this.basePrice,
    this.imageUrl,
    this.description,
    required this.priceWithSelectiveTax,
    required this.quantity,
    required this.extras,
    this.taxPercentage,
    required this.priceWithTax,
    this.isMeal,
  });

  /// Calculate item subtotal (base price × quantity + extras total)
  double get subtotal =>
      (priceWithTax * quantity) +
      extras.fold(0, (sum, extra) => sum + extra.totalPrice);
  double get taxAmount =>
      ((priceWithSelectiveTax * quantity) * ((taxPercentage ?? 0) / 100)) +
      extras.fold(
        0,
        (sum, extra) =>
            sum + extras.fold(0, (sum, extra) => sum + extra.extraTaxAmount),
      );

  /// Calculate total price for all extras
  double get extrasTotalPrice =>
      extras.fold(0, (sum, extra) => sum + extra.totalPrice);

  /// Check if item has any extras
  bool get hasExtras => extras.isNotEmpty;

  /// Get count of all extras (sum of quantities)
  int get extrasCount => extras.fold(0, (sum, extra) => sum + extra.quantity);

  /// Create a copy with optional field updates
  CartItemEntity copyWith({
    int? id,
    String? cartEntryId,
    String? name,
    double? basePrice,
    double? priceWithSelectiveTax,
    String? imageUrl,
    String? description,
    int? quantity,
    double? taxPercentage,
    List<CartExtraEntity>? extras,
    double? priceWithTax,
    bool? isMeal,
  }) {
    return CartItemEntity(
      id: id ?? this.id,
      cartEntryId: cartEntryId ?? this.cartEntryId,
      name: name ?? this.name,
      priceWithSelectiveTax:
          priceWithSelectiveTax ?? this.priceWithSelectiveTax,
      basePrice: basePrice ?? this.basePrice,
      imageUrl: imageUrl ?? this.imageUrl,
      description: description ?? this.description,
      quantity: quantity ?? this.quantity,
      extras: extras ?? this.extras,
      taxPercentage: taxPercentage ?? this.taxPercentage,
      priceWithTax: priceWithTax ?? this.priceWithTax,
      isMeal: isMeal ?? this.isMeal,
    );
  }

  /// Add or update an extra item
  CartItemEntity addExtra(CartExtraEntity extra) {
    final existingIndex = extras.indexWhere((e) => e.id == extra.id);

    if (existingIndex >= 0) {
      final updatedExtras = List<CartExtraEntity>.from(extras);
      updatedExtras[existingIndex] = extra;
      return copyWith(extras: updatedExtras);
    }

    return copyWith(extras: [...extras, extra]);
  }

  /// Remove an extra item by ID
  CartItemEntity removeExtra(int extraId) {
    return copyWith(
      extras: extras.where((extra) => extra.id != extraId).toList(),
    );
  }

  @override
  String toString() =>
      'CartItemEntity(id: $id, cartEntryId: $cartEntryId, name: $name, quantity: $quantity, subtotal: $subtotal,taxAmount: $taxAmount, extras: $extras, priceWithTax: $priceWithTax)';

  
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CartItemEntity &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          priceWithSelectiveTax == other.priceWithSelectiveTax &&
          cartEntryId == other.cartEntryId &&
          name == other.name &&
          basePrice == other.basePrice &&
          quantity == other.quantity &&
          taxPercentage == other.taxPercentage &&
          priceWithTax == other.priceWithTax &&
          extras == other.extras;

  
  
  
  @override
  int get hashCode =>
      id.hashCode ^
      cartEntryId.hashCode ^
      name.hashCode ^
      priceWithSelectiveTax.hashCode ^
      basePrice.hashCode ^
      quantity.hashCode ^
      taxPercentage.hashCode ^
      priceWithTax.hashCode ^
      extras.hashCode;
}
