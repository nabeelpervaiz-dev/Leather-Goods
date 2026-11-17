export function calculateDiscountPercentage(price, discountPrice) {
  const original = Number(price);
  const discounted = Number(discountPrice);
  if (!original || !discounted || discounted >= original || discounted <= 0) {
    return 0;
  }
  return Math.round(((original - discounted) / original) * 100);
}

export function getEffectivePrice(product) {
  const basePrice = Number(product?.price ?? product?.originalPrice) || 0;
  if (
    product?.isOnSale &&
    product?.discountPrice != null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < basePrice
  ) {
    return Number(product.discountPrice);
  }
  return basePrice;
}
