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

export default { Staff, create, delete: deleteStaff };
