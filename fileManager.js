"use strict";
import { config } from "dotenv";
config();
import { hashPassword } from "./passwordManager.js";
import { connect, Schema, model } from "mongoose";
await connect(process.env.dbURI || "mongodb://127.0.0.1:27017/vns-bank");

const userSchema = new Schema({
	username: String,
	password: String,
	aktier: [{ investedIn: String, amount: Number }],
});
const User = model("User", userSchema);

const staffSchema = new Schema({
	username: String,
	password: String || null,
	admin: Boolean,
});

const Staff = model("Staff", staffSchema);

async function createUser(username, password) {
	if (await Staff.exists({ username: username })) {
		return { sucess: false, message: "User already exists" };
	}
	let hashedPassword = await hashPassword(password);
	let user = new User({
		username: username,
		password: hashedPassword,
		aktier: [],
	});
	await user.save();
	return { success: true };
}

async function createStaff(username) {
	if (await Staff.exists({ username: username })) {
		return { success: false, message: "Staff already exists" };
	}

	let staff = new Staff({
		username: username,
		password: null,
		admin: false,
	});
	await staff.save();
	return { success: true };
}

async function addAktie(username, investedIn, amount) {
	if (!(await User.exists({ username: username }))) {
		return { success: false, message: "User does not exist" };
	}

	let user = User.find({ username: username });

	if (user.aktier.find((aktie) => aktie.investedIn === investedIn)) {
		user.aktier.find((aktie) => aktie.investedIn === investedIn).amount +=
			amount;
	} else {
		user.aktier.push({ investedIn: investedIn, amount: amount });
	}

	await user.save();
	return { success: true };
}

async function removeAktie(username, investedIn, amount) {
	if (!(await User.exists({ username: username }))) {
		return { success: false, message: "User does not exist" };
	}

	let user = User.find({ username: username });

	if (user.aktier.find((aktie) => aktie.investedIn === investedIn)) {
		let aktie = user.aktier.find((aktie) => aktie.investedIn === investedIn);
		if (aktie.amount < amount) {
			return { success: false, message: "Not enough aktier" };
		}
		if (aktie.amount === amount) {
			user.aktier.splice(user.aktier.indexOf(aktie), 1);
		} else {
			aktie.amount -= amount;
		}

		await user.save();
		return { success: true };
	}
	return {
		success: false,
		message: "User does not have any aktier in this company",
	};
}

export let Models = {
	User,
	Staff,
};
export default { createUser, createStaff, addAktie, removeAktie, Models };
