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

export { ApiFeatures };
