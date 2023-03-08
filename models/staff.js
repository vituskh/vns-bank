import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
	username: String,
	password: { type: String, default: "" },
	admin: { type: Boolean, default: false },
});

const Staff = mongoose.model("Staff", staffSchema);

async function create(username) {
	if (await Staff.exists({ username: username })) {
		return { success: false, message: "Staff already exists" };
	}
	if (!username) {
		return { success: false, message: "Username cannot be empty" };
	}

	let staff = new Staff({
		username: username,
	});
	await staff.save();
	return { success: true };
}

async function deleteStaff(username) {
	if (!(await Staff.exists({ username: username }))) {
		return { success: false, message: "Staff does not exist" };
	}

	let result = await Staff.deleteOne({ username: username });
	if (result.deletedCount === 1) {
		return { success: true };
	}
	return { success: false, message: "Unknown error" };
}

async function checkPassword(username, password) {
	if (!(await dbManager.models.Staff.exists({ username: username }))) {
		return {
			success: false,
			message: "Wrong password or username",
			admin: false,
		};
	}

	let staff = await dbManager.models.Staff.findOne({ username: username });
	if (staff.password === "") {
		staff.password = await hashPassword(password);
		staff.save();
		return { success: true, admin: staff.admin || false };
	}

	if (!(await comparePassword(password, staff.password))) {
		return {
			success: false,
			message: "Wrong password or username",
			admin: false,
		};
	}

	return { success: true, admin: staff.admin || false };
}
export default { Staff, create, delete: deleteStaff, checkPassword };
