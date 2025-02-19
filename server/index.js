require("dotenv").config();
const {
	client,
	createTables,
	createUser,
	createProduct,
	createFavorite,
	fetchUsers,
	fetchProducts,
	fetchFavorites,
	destroyFavorite,
	authenticate,
	findUserWithToken,
	isLoggedIn,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

//for deployment only
const path = require("path");
app.get("/", (req, res) =>
	res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
app.use(
	"/assets",
	express.static(path.join(__dirname, "../client/dist/assets"))
);

// Protected Routes

// app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
// 	try {
// 		res.send(await findUserWithToken(req.headers.authorization));
// 	} catch (ex) {
// 		next(ex);
// 	}
// });

// app.delete(
// 	"/api/users/:user_id/favorites/:id",
// 	isLoggedIn,
// 	async (req, res, next) => {
// 		try {
// 			await destroyFavorite({
// 				user_id: req.params.user_id,
// 				id: req.params.id,
// 			});
// 			res.sendStatus(204);
// 		} catch (ex) {
// 			next(ex);
// 		}
// 	}
// );

// app.get(
// 	"/api/users/:id/favorites",
// 	isLoggedIn,
// 	async (req, res, next) => {
// 		try {
// 			res.send(await fetchFavorites(req.params.id));
// 		} catch (ex) {
// 			next(ex);
// 		}
// 	}
// );

// app.post(
// 	"/api/users/:id/favorites",
// 	isLoggedIn,
// 	async (req, res, next) => {
// 		try {
// 			res.status(201).send(
// 				await createFavorite({
// 					user_id: req.params.id,
// 					product_id: req.body.product_id,
// 				})
// 			);
// 		} catch (ex) {
// 			next(ex);
// 		}
// 	}
// );

// // Public Routes

// app.post("/api/auth/login", async (req, res, next) => {
// 	try {
// 		res.send(await authenticate(req.body));
// 	} catch (ex) {
// 		next(ex);
// 	}
// });

// app.get("/api/users", async (req, res, next) => {
// 	try {
// 		res.send(await fetchUsers());
// 	} catch (ex) {
// 		next(ex);
// 	}
// });

// app.get("/api/products", async (req, res, next) => {
// 	try {
// 		res.send(await fetchProducts());
// 	} catch (ex) {
// 		next(ex);
// 	}
// });

app.use((err, req, res, next) => {
	console.log(err);
	res
		.status(err.status || 500)
		.send({ error: err.message ? err.message : err });
});

const init = async () => {
	const port = process.env.PORT || 3000;
	await client.connect();
	console.log(await fetchUsers());
	console.log(await fetchProducts());
	console.log("connected to database");
	app.listen(port, () => console.log(`listening on port ${port}`));
};

// AUTH ROUTES
// Public - Register new user
app.post("/api/auth/register", async (req, res, next) => {
	try {
		const user = await createUser(req.body);
		const token = await authenticate(req.body);
		res.send(token);
	} catch (error) {
		next(error);
	}
});

// Public - Login existing user
app.post("/api/auth/login", async (req, res, next) => {
	try {
		res.send(await authenticate(req.body));
	} catch (error) {
		next(error);
	}
});

// Protected - Get current user info
app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
	try {
		res.send(req.user);
	} catch (error) {
		next(error);
	}
});

// ITEMS ROUTES
// Public - Get all items
app.get("/api/items", async (req, res, next) => {
	try {
		res.send(await fetchItems());
	} catch (error) {
		next(error);
	}
});

// Public - Get single item
app.get("/api/items/:itemId", async (req, res, next) => {
	try {
		res.send(await fetchItemById(req.params.itemId));
	} catch (error) {
		next(error);
	}
});

// REVIEWS ROUTES
// Public - Get reviews for an item
app.get("/api/items/:itemId/reviews", async (req, res, next) => {
	try {
		res.send(await fetchReviewsByItem(req.params.itemId));
	} catch (error) {
		next(error);
	}
});

// Public - Get single review
app.get(
	"/api/items/:itemId/reviews/:reviewId",
	async (req, res, next) => {
		try {
			res.send(await fetchReviewById(req.params.reviewId));
		} catch (error) {
			next(error);
		}
	}
);

// Protected - Create review for item
app.post(
	"/api/items/:itemId/reviews",
	isLoggedIn,
	async (req, res, next) => {
		try {
			res.send(
				await createReview({
					...req.body,
					itemId: req.params.itemId,
					userId: req.user.id,
				})
			);
		} catch (error) {
			next(error);
		}
	}
);

// Protected - Get current user's reviews
app.get("/api/reviews/me", isLoggedIn, async (req, res, next) => {
	try {
		res.send(await fetchUserReviews(req.user.id));
	} catch (error) {
		next(error);
	}
});

// Protected - Update a review
app.put(
	"/api/users/:userId/reviews/:reviewId",
	isLoggedIn,
	async (req, res, next) => {
		try {
			res.send(
				await updateReview({
					...req.body,
					reviewId: req.params.reviewId,
					userId: req.params.userId,
				})
			);
		} catch (error) {
			next(error);
		}
	}
);

// COMMENTS ROUTES
// Protected - Create comment on review
app.post(
	"/api/items/:itemId/reviews/:reviewId/comments",
	isLoggedIn,
	async (req, res, next) => {
		try {
			res.send(
				await createComment({
					...req.body,
					reviewId: req.params.reviewId,
					userId: req.user.id,
				})
			);
		} catch (error) {
			next(error);
		}
	}
);

// Protected - Get current user's comments
app.get("/api/comments/me", isLoggedIn, async (req, res, next) => {
	try {
		res.send(await fetchUserComments(req.user.id));
	} catch (error) {
		next(error);
	}
});

// Protected - Update a comment
app.put(
	"/api/users/:userId/comments/:commentId",
	isLoggedIn,
	async (req, res, next) => {
		try {
			res.send(
				await updateComment({
					...req.body,
					commentId: req.params.commentId,
					userId: req.params.userId,
				})
			);
		} catch (error) {
			next(error);
		}
	}
);

// Protected - Delete a comment
app.delete(
	"/api/users/:userId/comments/:commentId",
	isLoggedIn,
	async (req, res, next) => {
		try {
			await deleteComment({
				commentId: req.params.commentId,
				userId: req.params.userId,
			});
			res.sendStatus(204);
		} catch (error) {
			next(error);
		}
	}
);

// Protected - Delete a review
app.delete(
	"/api/users/:userId/reviews/:reviewId",
	isLoggedIn,
	async (req, res, next) => {
		try {
			await deleteReview({
				reviewId: req.params.reviewId,
				userId: req.params.userId,
			});
			res.sendStatus(204);
		} catch (error) {
			next(error);
		}
	}
);

init();
