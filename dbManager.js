"use strict";
import config from "./environment.js";
import { hashPassword } from "./passwordManager.js";
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
await mongoose.connect(config.dbURI);

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
