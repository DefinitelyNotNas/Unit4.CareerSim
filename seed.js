require("dotenv").config();
const { application } = require("express");
const {
	createTables,
	client,
	createUser,
	createFavorite,
	createProduct,
} = require("./server/db.js");

const seed = async () => {
	try {
		client.connect();
		await createTables();
		console.log("tables created");

		const [moe, lucy, ethyl, curly, foo, bar, bazz, quq, fip] =
			await Promise.all([
				createUser({ username: "moe", password: "m_pw" }),
				createUser({ username: "lucy", password: "l_pw" }),
				createUser({ username: "ethyl", password: "e_pw" }),
				createUser({ username: "curly", password: "c_pw" }),
				createProduct({ name: "foo" }),
				createProduct({ name: "bar" }),
				createProduct({ name: "bazz" }),
				createProduct({ name: "quq" }),
				createProduct({ name: "fip" }),
			]);
	} catch (error) {
		console.log(error);
	}
};

seed();
