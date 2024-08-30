// class ApiFeatures {
//     constructor(mongooseQuery, queryString) {
//         this.mongooseQuery = mongooseQuery;
//         this.queryString = queryString;
//     }
//     filter() {
//         //? destruct data from this.queryString
//         let {
//             page = 1,
//             limit = 5,
//             sort,
//             search,
//             fields,
//             ...filters
//         } = this.queryString;
//         if (page < 1) page = 1;
//         if (limit < 1) limit = 5;
//         //? destruct price, appliedPrice, stock, categoryId, subCategoryId, brandId, rating from filters
//         const filtersAsString = JSON.stringify(filters);
//         const replacedFilters = filtersAsString.replaceAll(
//             /lt|gt|lte|gte|eq|ne|regex/g,
//             (ele) => `$${ele}`
//         );
//         const parsedFilters = JSON.parse(replacedFilters);
//         this.mongooseQuery = this.mongooseQuery.find(parsedFilters);
//         return this;
//     }
//     sort() {
//         if (this.queryString.sort) {
//             this.mongooseQuery = this.mongooseQuery
//                 .find()
//                 .sort(this.queryString.sort.replaceAll(/,|&|, |& /g, " "));
//         }
//         return this;
//     }
//     limitFields() {
//         if (this.queryString.fields) {
//             const fields = this.queryString.fields.replaceAll(/,|&|, |& /g, " ");
//             this.mongooseQuery = this.mongooseQuery.find().select(fields);
//         }
//         return this;
//     }
//     paginate() {
//         let { page = 1, limit = 5 } = this.queryString;
//         if (page < 1) page = 1;
//         if (limit < 1) limit = 5;
//         let skip = (page - 1) * limit;
//         this.mongooseQuery = this.mongooseQuery.find().skip(skip).limit(limit);
//         return this;
//     }
//     search() {
//         if (this.queryString.search) {
//             this.mongooseQuery = this.mongooseQuery.find({
//                 $or: [
//                     {
//                         title: { $regex: this.queryString.search, $options: "i" },
//                     },
//                     {
//                         description: {
//                             $regex: this.queryString.search,
//                             $options: "i",
//                         },
//                     },
//                 ],
//             });
//         }
//         return this;
//     }
// }

class ApiFeatures {
    constructor(model, query, populate) {
        //? Product | Category | SubCategory |...
        this.model = model;
        //? req.query
        this.query = query;
        //? Will be the filters we needed to apply | {}
        this.filterObject = {};
        //? Will be the pagination object we needed to apply | {}
        this.paginationObject = {};
        //? Will be populated data we needed to apply | []
        this.populate = populate;
    }

    //# pagination
    pagination() {
        let { page = 1, limit = 2 } = this.query;
        if (page < 1) page = 1;
        if (limit < 1) limit = 2;
        let skip = (page - 1) * limit;

        this.paginationObject = {
            limit: parseInt(limit),
            skip,
            page: parseInt(page),
        };

        //? populate in pagination
        if (this.populate) {
            this.paginationObject.populate = this.populate;
        }

        console.log(
            "============ paginationObject in pagination() ==========",
            this.populate
        );

        this.mongooseQuery = this.model.paginate(
            this.filterObject,
            this.paginationObject
        );
        return this;
    }

    //# sorting
    sort() {
        const { sort } = this.query;

        if (sort) {
            this.paginationObject.sort = sort;

            console.log(
                "============ paginationObject in sort()==========",
                this.paginationObject
            );

            //? populate in pagination
            if (this.populate) {
                this.paginationObject.populate = this.populate;
            }

            this.mongooseQuery = this.model.paginate(
                this.filterObject,
                this.paginationObject
            );
        }
        return this;
    }

    //# search
    search() {
        const { search } = this.query;

        if (search) {
            this.filterObject = {
                $or: [
                    {
                        title: { $regex: search, $options: "i" },
                    },
                    {
                        description: { $regex: search, $options: "i" },
                    },
                ],
            };

            console.log(
                "============ filterObject in search() ==========",
                this.filterObject
            );

            //? populate in pagination
            if (this.populate) {
                this.paginationObject.populate = this.populate;
            }

            this.mongooseQuery = this.model.paginate(
                this.filterObject,
                this.paginationObject
            );
        }
        return this;
    }

    //# filtering
    filters() {
        let { page = 1, limit = 2, sort, search, ...filters } = this.query;
        if (page < 1) page = 1;
        if (limit < 1) limit = 2;

        const filtersAsString = JSON.stringify(filters);
        const replacedFilters = filtersAsString.replace(
            /lt|lte|gt|gte|eq|ne|regex/g,
            (match) => `$${match}`
        );
        this.filterObject = JSON.parse(replacedFilters);

        console.log(
            "============ filterObject in filters() ==========",
            this.filterObject
        );

        //? populate in pagination
        if (this.populate) {
            this.paginationObject.populate = this.populate;
        }

        this.mongooseQuery = this.model.paginate(
            this.filterObject,
            this.paginationObject
        );
        return this;
    }
}

export { ApiFeatures };
