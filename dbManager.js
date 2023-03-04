"use strict";
import { config } from "dotenv";
config();
import { hashPassword } from "./passwordManager.js";
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
await mongoose.connect(
	process.env.dbURI || "mongodb://127.0.0.1:27017/vns-bank"
);

import staff from "./models/staff.js";
import user from "./models/user.js";

export default {
	models: {
		Staff: staff.Staff,
		User: user.User,
	},
	methods: {
		staff: {
			create: staff.create,
			delete: staff.delete,
		},
		user: {
			create: user.create,
			addAktie: user.addAktie,
			removeAktie: user.removeAktie,
		},
	},
};

export let Staff = {
	model: staff.Staff,
	create: staff.create,
	delete: staff.delete,
};

export let User = {
	model: user.User,
	create: user.create,
	addAktie: user.addAktie,
	removeAktie: user.removeAktie,
};

export let models = {
	Staff: staff.Staff,
	User: user.User,
};
