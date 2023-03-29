"use strict";
import config from "./environment.js";
import { hashPassword } from "./passwordManager.js";
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
await mongoose.connect(config.dbURI);

import staff from "../models/staff.js";
import user from "../models/user.js";

import logger from "./logging.js";

export default {
	models: {
		Staff: staff.Staff,
		User: user.User,
	},
	methods: {
		staff: {
			create: staff.create,
			delete: staff.delete,
			checkPassword: staff.checkPassword,
		},
		user: {
			create: user.create,
			addAktie: user.addAktie,
			removeAktie: user.removeAktie,
			checkPassword: user.checkPassword,
			updatePassword: user.updatePassword,
		},
	},
};
export let connection = mongoose.connection;

connection.once("open", () => {
	logger.info("Connected to database");
});
connection.on("error", (err) => {
	logger.error(
		"Error connecting to database: " + JSON.stringify(err) + " " + err
	);
});

export let Staff = {
	model: staff.Staff,
	create: staff.create,
	delete: staff.delete,
	checkPassword: staff.checkPassword,
};

export let User = {
	model: user.User,
	create: user.create,
	addAktie: user.addAktie,
	removeAktie: user.removeAktie,
	checkPassword: user.checkPassword,
};

export let models = {
	Staff: staff.Staff,
	User: user.User,
};
