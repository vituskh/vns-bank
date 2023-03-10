import { expect } from "chai";
import mongoose from "./helper.js";
import staff from "../models/staff.js";

describe("Staff", () => {
	describe("create", () => {
		it("should create a new staff member", async function () {
			let result = await staff.create("testCreate");
			expect(result.success).to.be.true;
		});
		it("should not create a new staff member if the username is already taken", async function () {
			await staff.create("testCreateTaken");
			let result = await staff.create("testCreateTaken");
			expect(result.success).to.be.false;
		});
		it("should not create a new staff member if the username is empty", async function () {
			let result = await staff.create("");
			expect(result.success).to.be.false;
		});
		it("should not create a new staff member if the username is undefined", async function () {
			let result = await staff.create();
			expect(result.success).to.be.false;
		});
	});
	describe("delete", () => {
		it("should delete a staff member", async function () {
			await staff.create("testDelete");
			let result = await staff.delete("testDelete");
			expect(result.success).to.be.true;
		});
		it("should not delete a staff member if the username does not exist", async function () {
			let result = await staff.delete("testNotExists");
			expect(result.success).to.be.false;
		});
	});
});
