//# dependencies
import mongoose from "mongoose";

const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_ONLINE_DB_URL);
        console.log(`database connected successfully 👍\non ${process.env.CONNECTION_ONLINE_DB_URL}`);
    } catch (error) {
        console.log("Error to connect to the database 🤷‍♂️", error);
    }
};

export default connectionDB;
