
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const userController = require("../controller/usercontroller");
const authMiddleware = require("../middleware/authMiddleware");
const bookController = require("../controller/bookController");
const multerMiddleware = require("../middleware/multerMiddleware");

const router = new express.Router();

// ==================== AUTH ROUTES ====================

router.post("/register", userController.registerController);
router.post("/login", userController.loginController);
router.post("/google-login", userController.googleLoginController);


// ==================== PUBLIC BOOK ROUTES ====================

router.get("/home-books", bookController.getHomeBooks);
router.get("/all-books", bookController.getAllBooksController);


// ==================== ADMIN ROUTES ====================

// Get all registered users
// Add admin authorization middleware before deploying
router.get(
    "/all-users",
    authMiddleware,
    userController.getAllUsersController
);

// Approve a book
// Add admin authorization middleware before deploying
router.put(
    "/book/:id/approve",
    authMiddleware,
    bookController.approveBookController
);


// ==================== AUTHENTICATED BOOK ROUTES ====================

router.post(
    "/book",
    authMiddleware,
    multerMiddleware.array("uploadImages"),
    bookController.addBooks
);

router.get(
    "/user-books",
    authMiddleware,
    bookController.getUserBookController
);

router.get(
    "/user-brought-books",
    authMiddleware,
    bookController.getUserBroughtBookController
);

router.delete(
    "/book/:id",
    authMiddleware,
    bookController.deleteBookController
);

router.get(
    "/view-book/:id",
    authMiddleware,
    bookController.viewBookController
);


// ==================== USER ROUTES ====================

router.put(
    "/user/:id",
    authMiddleware,
    userController.userEditController
);

// Admin-only routes
router.get(
    "/all-users",
    authMiddleware,
    adminMiddleware,
    userController.getAllUsersController
);

router.put(
    "/book/:id/approve",
    authMiddleware,
    adminMiddleware,
    bookController.approveBookController
);



module.exports = router;
