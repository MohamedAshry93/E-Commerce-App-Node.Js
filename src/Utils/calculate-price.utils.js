import { DiscountType } from "./index.js";

//! ===================================== Calculate Product Price ===================================== //
const calculateProductPrice = (price, discount) => {
    let appliedPrice = price;
    if (discount.type === DiscountType.PERCENTAGE) {
        appliedPrice = price - (price * discount.amount) / 100;
    } else if (discount.type === DiscountType.AMOUNT) {
        appliedPrice = price - discount.amount;
    }
    return appliedPrice;
};

//! ===================================== Calculate Cart Total Price ===================================== //
const calculateCartSubTotal = (products) => {
    let subTotal = 0;
    products.forEach((product) => {
        subTotal += product.price * product.quantity;
    });
    return subTotal;
};

export { calculateProductPrice, calculateCartSubTotal };
