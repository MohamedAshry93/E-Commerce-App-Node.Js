# // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Category Controller >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

(*) deleteCategory API Router: (*)
    //? delete relevant sub-category from database
    const deletedSubCategories = await SubCategory.deleteMany({
        categoryId: deletedCategory._id,
    });
    //? if sub-categories deleted => delete relevant products and brands from database
    if (deletedSubCategories.deletedCount) {
        //? delete relevant brands from database
        const deletedBrands = await Brand.deleteMany({
            categoryId: deletedCategory._id,
        });
        //? if brands deleted => delete relevant products from database
        if (deletedBrands.deletedCount) {
            //? delete relevant products from database
            await Product.deleteMany({ categoryId: deletedCategory._id });
        }
    }

(*) getAllCategories with pagination API: (*)
/*
    //? destruct data from req.query
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1)* limit;
*/

/*
    /// => way No.1 using find, limit and skip method ///
    //? find all categories paginated with their sub-categories
        const categories = await Category.find()
            .populate("subCategories")
            .skip(skip)
            .limit(limit);
    //? count total number of pages
        const count = await Category.countDocuments();
    //? return response
        res.status(200).json({
            status: "success",
            message: "Categories found successfully",
            categoriesData: categories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
*/

/*
    /// => way No.3 using api features ///
    //? destruct data from req.query
        let { limit = 5, page = 1 } = req.query;
        if (page < 1) page = 1;
        if (limit < 1) limit = 5;
    //? build a query
        const mongooseQuery = Category.find();
        const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query)
            .paginate()
            .search()
            .limitFields();
    //? execute query
        const categories = await ApiFeaturesInstance.mongooseQuery.populate(
            "subCategories"
        );
    //? count total number of documents
        const count = await Category.countDocuments();
    //? send response
        res.status(200).json({
            status: "success",
            message: "Categories found successfully",
            categoriesData: categories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
*/

## // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< subCategory controller >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

(*) getAllSubCategories with pagination API: (*)
/*
    //? destruct data from req.query
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1)* limit;
*/

/*
    /// => way No.1 using find, limit and skip method ///
    //? find all subCategories paginated with their brands
        const subCategories = await SubCategory.find()
            .populate("brands")
            .limit(limit)
            .skip(skip);
    //? count total number of pages
        const count = await SubCategory.countDocuments();
    //? return response
        res.status(200).json({
            status: "success",
            message: "Sub-Categories found successfully",
            subCategoriesData: subCategories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
*/

/*
    /// => way No.3 using api features ///
    //? destruct data from req.query
        let { limit = 5, page = 1 } = req.query;
        if (page < 1) page = 1;
        if (limit < 1) limit = 5;
        //? build a query
        const mongooseQuery = SubCategory.find();
        const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query)
            .paginate()
            .search()
            .limitFields();
    //? execute query
        const subCategories = await ApiFeaturesInstance.mongooseQuery.populate(
            "brands"
        );
    //? count total number of documents
        const count = await SubCategory.countDocuments();
    //? send response
        res.status(200).json({
            status: "success",
            message: "SubCategories found successfully",
            subCategoriesData: subCategories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
*/

(*) deleteSubCategory API Router: (*)
    //? delete relevant brands from database
        await Brand.deleteMany({ subCategoryId: deletedSubCategory._id });
    //? delete relevant products from database
        await Product.deleteMany({ subCategoryId: deletedSubCategory._id });

### // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Product controller >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

(*) getAllProducts with pagination: (*)
/*
    //? destruct data from req.query
        const {
            page = 1,
            limit = 5,
            sort,
            ...filters
        } = req.query;
        const skip = (page - 1)* limit;
    //? destruct price, appliedPrice, stock, categoryId, subCategoryId, brandId, rating from filters
        const filtersAsString = JSON.stringify(filters);
        const replacedFilters = filtersAsString.replaceAll(
            /lt|gt|lte|gte|eq|ne|regex/g,
                (ele) => `$${ele}`
            );
        const parsedFilters = JSON.parse(replacedFilters);
*/

/*
    /// => way No.1 using find, limit and skip method ///
    //? find all products with pagination
        const products = await Product.find(parsedFilters)
            .limit(limit)
            .skip(skip)
            .populate([{ path: "brandId" }, { path: "categoryId" }, { path: "subCategoryId" }])
            .sort(sort);
    //? count total number of documents
        const count = await Product.countDocuments();
    //? send response
        res.status(200).json({
            status: "success",
            message: "Products found successfully",
            productsData: products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
*/

/*
    /// => way No.3 using api features ///
    //? destruct data from req.query
    let { limit = 5, page = 1 } = req.query;
    //? build a query
        const mongooseQuery = Product.find();
        const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query)
            .paginate()
            .filter()
            .search()
            .limitFields()
            .sort();
    //? execute query
        const products = await ApiFeaturesInstance.mongooseQuery.populate([
            { path: "brandId" },
            { path: "categoryId" },
            { path: "subCategoryId" },
        ]);
    //? count total number of documents
        const count = await Product.countDocuments();
    //? send response
        res.status(200).json({
            status: "success",
            message: "Products found successfully",
            productsData: products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
*/

#### // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< order.controller >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

(*) cancelOrder API: (*)
    //? check if order bought before 3 days or not
        const orderDate = DateTime.fromJSDate(order.createdAt);
        const currentDate = DateTime.now();
        const diff = Math.ceil(
                Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2)
            );
        if (diff < 3) {
            return next(
                new ErrorHandlerClass(
                    "Order can't be cancelled",
                    400,
                    "Error in cancelOrder API checking order date",
                    "at Order controller"
                )
            );
        }

(*) createOrder API: (*)
//? get user's cart with products
    const userCart = await Cart.findOne({ userId }).populate(
        "products.productId"
    );
//? check if user has cart
    if (!userCart || !userCart.products.length) {
        return next(
            new ErrorHandlerClass(
                "Cart is empty",
                400,
                "Error in createOrder API",
                "at Order controller",
                { userCart }
            )
        );
    }
//? check if product still available or not
    const isSoldOut = userCart.products.find(
        (product) => product.productId.stock < product.quantity
    );
    if (isSoldOut) {
        return next(
            new ErrorHandlerClass(
                `Product ${isSoldOut.productId.title} is sold out`,
                400,
                "Error in createOrder API at check product availability",
                "at Order controller",
                { isSoldOut }
            )
        );
    }
//? calculate new subTotal price
    const subTotal = calculateCartSubTotal(userCart.products);
    let total = subTotal + shippingFee + VAT;
//? check availability of coupon
    let coupon = null;
    if (couponCode) {
        const isCouponValid = await validateCoupon(couponCode, userId);
        if (isCouponValid.error) {
            return next(
                new ErrorHandlerClass(
                    isCouponValid.message,
                    403,
                    "Error in createOrder API at validate coupon",
                    "at Order controller",
                    { isCouponValid }
                )
            );
        }
    //? calculate total price after applied a coupon
        coupon = isCouponValid.coupon;
        total = applyCoupon(subTotal, coupon);
    }
//? check if not sending address
    if (!address && !addressId) {
        return next(
            new ErrorHandlerClass(
                "Please provide address, address is required",
                400,
                "Error in createOrder API",
                "at Order controller"
            )
        );
    }
    if (addressId) {
        //? get address from user addresses
        const addressInfo = await Address.findOne({ _id: addressId, userId });
        if (!addressInfo) {
            return next(
                new ErrorHandlerClass(
                    "Address not found",
                    404,
                    "Error in createOrder API at checking addressId",
                    "at Order controller"
                )
            );
        }
    }
//? payment method
    let orderStatus = OrderStatus.PENDING;
    if (paymentMethod === PaymentMethod.CASH) {
        orderStatus = OrderStatus.PLACED;
    }
//? create order instance
    const orderInstance = new Order({
        userId,
        products: userCart.products,
        address,
        addressId,
        contactNumber,
        shippingFee,
        VAT,
        subTotal,
        total,
        paymentMethod,
        couponId: coupon?._id,
        orderStatus,
        fromCart,
        arrivalEstimateTime: DateTime.now()
            .plus({ days: 7 })
            .toFormat("yyyy-MM-dd"),
    });
//? save order
    const order = await orderInstance.save();
    //? update stock of products
    userCart.products.forEach(async (product) => {
        await Product.updateOne(
            { _id: product.productId },
            { $inc: { stock: -product.quantity } }
        );
    });
//? clear user's cart
    userCart.products = [];
    await userCart.save();
//? increment usageCount of coupon
    if (order?.couponId) {
        const coupon = await Coupon.findById({_id: order?.couponId });
        coupon.couponAssignedToUsers.find(
            (user) => user.userId.toString() === userId.toString()
        ).numberOfUsage++;
        await coupon.save();
    }
//? send response
    res.status(201).json({
        message: "Order created successfully",
        order,
    });

##### // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< api-features.utils >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

(**) Api Features: (**)
class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }
    filter() {
        //? destruct data from this.queryString
        let {
            page = 1,
            limit = 5,
            sort,
            search,
            fields,
            ...filters
        } = this.queryString;
        if (page < 1) page = 1;
        if (limit < 1) limit = 5;
        //? destruct price, appliedPrice, stock, categoryId, subCategoryId, brandId, rating from filters
        const filtersAsString = JSON.stringify(filters);
        const replacedFilters = filtersAsString.replaceAll(
            /lt|gt|lte|gte|eq|ne|regex/g,
            (ele) => `$${ele}`
        );
        const parsedFilters = JSON.parse(replacedFilters);
        this.mongooseQuery = this.mongooseQuery.find(parsedFilters);
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            this.mongooseQuery = this.mongooseQuery
                .find()
                .sort(this.queryString.sort.replaceAll(/,|&|, |& /g, " "));
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.replaceAll(/,|&|, |& /g, " ");
            this.mongooseQuery = this.mongooseQuery.find().select(fields);
        }
        return this;
    }
    paginate() {
        let { page = 1, limit = 5 } = this.queryString;
        if (page < 1) page = 1;
        if (limit < 1) limit = 5;
        let skip = (page - 1) * limit;
        this.mongooseQuery = this.mongooseQuery.find().skip(skip).limit(limit);
        return this;
    }
    search() {
        if (this.queryString.search) {
            this.mongooseQuery = this.mongooseQuery.find({
                $or: [
                    {
                        title: { $regex: this.queryString.search, $options: "i" },
                    },
                    {
                        description: {
                            $regex: this.queryString.search,
                            $options: "i",
                        },
                    },
                ],
            });
        }
        return this;
    }
}
