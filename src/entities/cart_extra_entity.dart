/// Domain entity representing an extra item (e.g., extra cheese, sauce)
/// This entity is independent of data source and contains pure business logic
class CartExtraEntity {
  final int id;
  final String name;
  final double price;
  final String? description;
  final num? priceWithSelectiveTax;
  final double? priceWithTax;
  final int quantity;
  final String imageUrl;
  final double? taxPercentage;

  const CartExtraEntity({
    required this.id,
    required this.name,
    required this.price,
    this.priceWithSelectiveTax,
    this.priceWithTax,
    this.description,
    required this.quantity,
    required this.imageUrl,
    this.taxPercentage,
  });

  /// Calculate total cost for this extra (price × quantity)
  double get totalPrice => (priceWithTax ?? 1) * quantity;
  double get extraTaxAmount =>
      ((priceWithSelectiveTax ?? 1) * quantity) * ((taxPercentage ?? 0) / 100);

  /// Create a copy with optional field updates
  CartExtraEntity copyWith({
    int? id,
    String? name,
    double? price,
    num? priceWithSelectiveTax,
    String? description,
    int? quantity,
    String? imageUrl,
    double? taxPercentage,
    double? priceWithTax,
  }) {
    return CartExtraEntity(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      priceWithSelectiveTax:
          priceWithSelectiveTax ?? this.priceWithSelectiveTax,
      description: description ?? this.description,
      quantity: quantity ?? this.quantity,
      imageUrl: imageUrl ?? this.imageUrl,
      taxPercentage: taxPercentage ?? this.taxPercentage,
      priceWithTax: priceWithTax ?? this.priceWithTax,
    );
  }

  @override
  String toString() =>
      'CartExtraEntity(id: $id, name: $name, quantity: $quantity, price: $price,taxPercentage: $taxPercentage, priceWithSelectiveTax: $priceWithSelectiveTax, description: $description, priceWithTax: $priceWithTax)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CartExtraEntity &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name &&
          price == other.price &&
          priceWithSelectiveTax == other.priceWithSelectiveTax &&
          description == other.description &&
          taxPercentage == other.taxPercentage &&
          priceWithTax == other.priceWithTax &&
          quantity == other.quantity;

  @override
  int get hashCode =>
      id.hashCode ^
      name.hashCode ^
      priceWithSelectiveTax.hashCode ^
      price.hashCode ^
      quantity.hashCode ^
      description.hashCode ^
      (taxPercentage?.hashCode ?? 0);
}
