//# utils
import {
    calculateProductRatingCron,
    deleteAddressesCron,
    disableCouponsCron,
} from "./src/Utils/index.js";

//! cron jobs function handler
const cronsJob = () => {
    //# cron jobs
    disableCouponsCron();
    deleteAddressesCron();
    calculateProductRatingCron();
};

export { cronsJob };
