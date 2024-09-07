//# dependencies
import { config } from "dotenv";
import express from "express";
import path from "path";

//# connection
import connectionDB from "./database/connection.js";

//# routers handler
import { routerHandler } from "./router-handler.js";

//# cron jobs
import { cronsJob } from "./cronJobs-handler.js";

//! initiate app function handler
const main = () => {
    //# config
    if (process.env.NODE_ENV == "prod") {
        config({ path: path.resolve(".prod.env") });
    }
    if (process.env.NODE_ENV == "dev") {
        config({ path: path.resolve(".dev.env") });
    }
    config();

    //# express app
    const app = express();

    //# port
    let port = process.env.PORT || 3000;

    //# routers handler
    routerHandler(app);

    //# database connection
    connectionDB();

    //# cron jobs
    cronsJob();

    //# destination
    app.get("/", (req, res) => {
        res.status(200).json({ Message: "Hello on my project 😘" });
    });

    //# start server
    app.listen(port, () =>
        console.log(`Example app listening on port ${port}! 👀`)
    );
};

export { main };
