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

	await Staff.deleteOne({ username: username });
	return { success: true };
}

export default { Staff, create, delete: deleteStaff };
