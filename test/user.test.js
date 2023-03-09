import { expect } from "chai";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
mongoose.set("strictQuery", false);
let mongoServer;
before(async function () {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = await mongoServer.getUri();
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	return;
});

after(async function () {
	await mongoose.disconnect();
	await mongoServer.stop();
	return;
});

import { setSaltRounds } from "../passwordManager.js";
setSaltRounds(1);

import { compare } from "bcrypt";

import user from "../models/user.js";
describe("User", () => {
	describe("create", () => {
		it("should create a new user", async function () {
			let result = await user.create("testCreate", "testCreate");
			expect(result.success).to.be.true;
		});
		it("should not create a new user if the username is already taken", async function () {
			await user.create("testCreateTaken", "testCreateTaken");
			let result = await user.create("testCreateTaken", "testCreateTaken");
			expect(result.success).to.be.false;
		});
		it("should not create a new user if the username is empty", async function () {
			let result = await user.create("", "testCreateEmpty");
			expect(result.success).to.be.false;
		});
		it("should not create a new user if the username is undefined", async function () {
			let result = await user.create(undefined, "testCreateUndefined");
			expect(result.success).to.be.false;
		});
		it("should not create a new user if the password is empty", async function () {
			let result = await user.create("testCreateEmptyPassword", "");
			expect(result.success).to.be.false;
		});
		it("should not create a new user if the password is undefined", async function () {
			let result = await user.create("testCreateUndefinedPassword", undefined);
			expect(result.success).to.be.false;
		});
		it("should have the correct password", async function () {
			let result = await user.create(
				"testCreatePassword",
				"testCreatePassword"
			);
			let foundUser = await user.User.findOne({
				username: "testCreatePassword",
			});
			let passwordMatch = await compare(
				"testCreatePassword",
				foundUser.password
			);
			expect(passwordMatch).to.be.true;
		});
	});
});
describe("aktier", async function () {
	it("should add a new aktie", async function () {
		await user.create("testAktier", "testAktier");
		let aktieUser = await user.User.findOne({ username: "testAktier" });
		let result = await user.addAktie("testAktier", "testAktie", 10);
		expect(result.success).to.be.true;
		aktieUser = await user.User.findOne({ username: "testAktier" });
		expect(aktieUser.aktier[0].investedIn).to.equal("testAktie");
	});
	describe("name", () => {
		it("should not add a new aktie if the aktie is empty", async function () {
			let result = await user.addAktie("testAktier", "", 10);
			expect(result.success).to.be.false;
		});
		it("should not add a new aktie if the username does not exist", async function () {
			let result = await user.addAktie("testNotExists", "testAktie", 10);
			expect(result.success).to.be.false;
		});
		it("should not add a new aktie if the aktie is undefined", async function () {
			let result = await user.addAktie("testAktier", undefined, 10);
			expect(result.success).to.be.false;
		});
	});
	describe("amount", () => {
		it("should not add a new aktie if the amount is not a number", async function () {
			let result = await user.addAktie("testAktier", "testAktieNaN", "test");
			expect(result.success).to.be.false;
		});
		it("should not add a new aktie if the amount is negative", async function () {
			let result = await user.addAktie("testAktier", "testAktieNegative", -10);
			expect(result.success).to.be.false;
		});
		it("should not add a new aktie if the amount is 0", async function () {
			let result = await user.addAktie("testAktier", "testAktieZero", 0);
			expect(result.success).to.be.false;
		});
		it("should not add a new aktie if the amount is undefined", async function () {
			let result = await user.addAktie(
				"testAktier",
				"testAktieUndefined",
				undefined
			);
			expect(result.success).to.be.false;
		});
		it("should add to the amount if the aktie already exists", async function () {
			await user.addAktie("testAktier", "testAktieExists", 10);
			let result = await user.addAktie("testAktier", "testAktieExists", 10);
			expect(result.success).to.be.true;
			let aktieUser = await user.User.findOne({ username: "testAktier" });
			let aktie = aktieUser.aktier.find(
				(aktie) => aktie.investedIn === "testAktieExists"
			);
			expect(aktie.amount).to.equal(20);
		});
	});
	describe("remove", () => {
		it("should subtract from the amount if the aktie already exists", async function () {
			await user.addAktie("testAktier", "testAktieSubtract", 10);
			let result = await user.removeAktie("testAktier", "testAktieSubtract", 9);
			expect(result.success).to.be.true;
			let aktieUser = await user.User.findOne({
				username: "testAktier",
			});
			let aktie = aktieUser.aktier.find(
				(aktie) => aktie.investedIn === "testAktieSubtract"
			);
			expect(aktie.amount).to.equal(1);
		});
		it("should remove the aktie if the amount is 0", async function () {
			await user.addAktie("testAktier", "testAktieRemove", 10);
			let result = await user.removeAktie("testAktier", "testAktieRemove", 10);
			expect(result.success).to.be.true;
			let aktieUser = await user.User.findOne({
				username: "testAktier",
			});
			let aktie = aktieUser.aktier.find(
				(aktie) => aktie.investedIn === "testAktieRemove"
			);
			expect(aktie).to.be.undefined;
		});
		it("should not allow the amount to be negative", async function () {
			await user.addAktie("testAktier", "testAktieNegative", 10);
			let result = await user.removeAktie(
				"testAktier",
				"testAktieNegative",
				11
			);
			expect(result.success).to.be.false;
		});
	});
});
