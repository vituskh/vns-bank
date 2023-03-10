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
	describe("password", () => {
		it("should make a password on first login", async function () {
			await staff.create("testPassword");
			let result = await staff.checkPassword("testPassword", "testPassword");
			expect(result.success).to.be.true;
		});
		it("should be able to login with the password", async function () {
			await staff.create("testPasswordLogin");
			await staff.checkPassword("testPasswordLogin", "testPasswordLogin"); // Make password

			let result = await staff.checkPassword(
				"testPasswordLogin",
				"testPasswordLogin"
			);
			expect(result.success).to.be.true;
		});
		it("should not be able to login with the wrong password", async function () {
			await staff.create("testPasswordWrong");
			await staff.checkPassword("testPasswordWrong", "testPasswordWrong"); // Make password

			let result = await staff.checkPassword(
				"testPasswordWrong",
				"wrongPassword"
			);
			expect(result.success).to.be.false;
		});
	});
});
