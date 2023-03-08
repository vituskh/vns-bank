import { expect } from "chai";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import staff from "../models/staff.js";
mongoose.set("strictQuery", false);
let mongoServer;
before(async () => {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = await mongoServer.getUri();
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	return;
});

after(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
	return;
});

describe("Staff", () => {
	describe("create", () => {
		it("should create a new staff member", async () => {
			let result = await staff.create("testCreate");
			expect(result.success).to.be.true;
		});
		it("should not create a new staff member if the username is already taken", async () => {
			await staff.create("testCreateTaken");
			let result = await staff.create("testCreateTaken");
			expect(result.success).to.be.false;
		});
		it("should not create a new staff member if the username is empty", async () => {
			let result = await staff.create("");
			expect(result.success).to.be.false;
		});
		it("should not create a new staff member if the username is undefined", async () => {
			let result = await staff.create();
			expect(result.success).to.be.false;
		});
	});
	describe("delete", () => {
		it("should delete a staff member", async () => {
			await staff.create("testDelete");
			let result = await staff.delete("testDelete");
			expect(result.success).to.be.true;
		});
		it("should not delete a staff member if the username does not exist", async () => {
			let result = await staff.delete("testNotExists");
			expect(result.success).to.be.false;
		});
	});
});
