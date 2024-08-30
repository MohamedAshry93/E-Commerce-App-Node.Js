const Badges = {
    BEST_SELLER: "Best Seller",
    NEW: "New",
    SALE: "Sale",
};

const DiscountType = {
    PERCENTAGE: "Percentage",
    AMOUNT: "Amount",
};

const SystemRoles = {
    COMPANY_ADMIN: "Company_ADMIN",
    USER: "User",
};

const CouponRoles = {
    COUPON_ROLES_USER_ADMIN: [SystemRoles.COMPANY_ADMIN, SystemRoles.USER],
};

const Gender = {
    MALE: "Male",
    FEMALE: "Female",
};

const PaymentMethod = {
    CASH: "Cash",
    CREDIT_CARD: "Credit Card",
    PAYPAL: "PayPal",
    STRIPE: "Stripe",
    WALLET: "Wallet",
};

const OrderStatus = {
    PENDING: "Pending",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    PLACED: "Placed",
    CONFIRMED: "Confirmed",
    REFUNDED: "Refunded",
    RETURNED: "Returned",
    DROPPED: "Dropped",
    ON_WAY: "OnWay",
};

const ReviewStatus = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
};


export {
    Badges,
    DiscountType,
    SystemRoles,
    Gender,
    CouponRoles,
    PaymentMethod,
    OrderStatus,
    ReviewStatus,
};
