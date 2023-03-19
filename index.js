"use strict";
import config from "./src/environment.js";
//import "./cli.js";

import express, { static as serveStatic, json, urlencoded } from "express";
const app = express();
import session from "express-session";
import connectMongo from "connect-mongo";

import staffUIRouter from "./routes/staffUIRouter.js";
import adminRouter from "./routes/adminRouter.js";
import indbetatalingRouter from "./routes/indbetalingRouter.js";
import udbetalingRouter from "./routes/udbetalingRouter.js";

import dbManager from "./src/dbManager.js";
if ((await dbManager.models.Staff.countDocuments()) == 0) {
	console.warn("No staff found, creating admin user");
	console.warn("Username: admin_temp_deleteme");
	console.warn("Password: admin");
	console.warn("Please delete this user after logging in");
	dbManager.methods.staff.create("admin_temp_deleteme", "admin", true);
}

app.set("view engine", "ejs");
app.use(serveStatic("public"));
app.use(json());
app.use(
	urlencoded({
		extended: true,
	})
);
app.use(
	session({
		secret: config.secret,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
		saveUninitialized: false,
		store: connectMongo.create({
			mongoUrl: config.dbURI,
		}),
	})
);

app.use("/admin", adminRouter);

app.use(staffUIRouter);

app.use("/indbetaling", indbetatalingRouter);

app.use("/udbetaling", udbetalingRouter);

app.listen(config.port, () => console.log(`Listening on port ${config.port}!`));
