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

export { Badges, DiscountType, SystemRoles, Gender, CouponRoles };
