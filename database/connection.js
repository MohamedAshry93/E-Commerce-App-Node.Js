import mongoose from "mongoose";

const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_DB_URI);
        console.log("database connected 👍");
    } catch (error) {
        console.log("Error to connect to the database 🤷‍♂️", error);
    }
};

export default connectionDB;
