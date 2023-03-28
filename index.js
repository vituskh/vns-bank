"use strict";
import config from "./src/environment.js";
//import "./cli.js";
console.log(config.env, config.NODE_ENV, process.env.NODE_ENV)
import express, { static as serveStatic, json, urlencoded } from "express";
const app = express();
import session from "express-session";
import connectMongo from "connect-mongo";
import asyncHandler from "express-async-handler";

import staffUIRouter from "./routes/staffUIRouter.js";
import adminRouter from "./routes/adminRouter.js";
import indbetatalingRouter from "./routes/indbetalingRouter.js";
import udbetalingRouter from "./routes/udbetalingRouter.js";

import dbManager from "./src/dbManager.js";
import logger from "./src/logging.js";

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

app.use(
	asyncHandler(async (req, res, next) => {
		if (req.path == "/favicon.ico") {
			next();
			return;
		}
		logger.debug(
			`User: ${req.session.username}, admin: ${req.session.admin}, ${req.method} ${req.path}`
		);
		next();
	})
);
app.use("/admin", adminRouter);

app.use(staffUIRouter);

app.use("/indbetaling", indbetatalingRouter);

app.use("/udbetaling", udbetalingRouter);

app.listen(config.port, () => console.log(`Listening on port ${config.port}!`));
