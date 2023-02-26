import { hashSync } from "bcrypt";

for (let i = 5; i < 20; i++) {
	let start = performance.now();
	console.log(hashSync("password", i));
	let end = performance.now();
	console.log("Time: " + (end - start) + "ms (" + i + " rounds)");
}
