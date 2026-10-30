
const books = require("../models/booksModel");

// Escape special characters so search text is treated literally
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Add a new book
exports.addBooks = async (req, res) => {
    console.log("Inside the add book controller");

    try {
        const {
            title,
            author,
            imageURL,
            pages,
            price,
            discountPrice,
            abstract,
            publisher,
            isbn,
            language,
            category
        } = req.body;

        // Get the seller email from the authenticated user's token
        const sellerMail = req.payload?.email;

        if (!sellerMail) {
            return res.status(401).json({
                success: false,
                message: "Seller email not found. Please login again."
            });
        }

        // Get uploaded image filenames from Multer
        const uploadImages = req.files
            ? req.files.map((item) => item.filename)
            : [];

        // Prevent the same seller from uploading the same title twice
        const existingBook = await books.findOne({
            title,
            sellerMail
        });

        if (existingBook) {
            return res.status(409).json({
                success: false,
                message: "Book already exists"
            });
        }

        // Create a new book
        const newBook = await books.create({
            title,
            author,
            imageURL,
            pages,
            price,
            discountPrice,
            abstract,
            publisher,
            isbn,
            language,
            category,
            uploadImages,
            sellerMail
        });

        return res.status(201).json({
            success: true,
            message: "Book added successfully",
            data: newBook
        });

    } catch (error) {
        console.log("Add book error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get the latest four approved books for the home page
exports.getHomeBooks = async (req, res) => {
    console.log("Inside getHomeBooks");

    try {
        const homeBooks = await books.find({
            status: "approved"
        })
            .sort({ _id: -1 })
            .limit(4);

        return res.status(200).json(homeBooks);

    } catch (error) {
        console.log("Get home books error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get all books and search by title, author, or category
exports.getAllBooksController = async (req, res) => {
    console.log("Inside getAllBooksController");

    try {
        const searchKey = (req.query.search || "").trim();

        let searchCondition = {};

        if (searchKey) {
            const safeSearchKey = escapeRegex(searchKey);

            searchCondition = {
                $or: [
                    {
                        title: {
                            $regex: safeSearchKey,
                            $options: "i"
                        }
                    },
                    {
                        author: {
                            $regex: safeSearchKey,
                            $options: "i"
                        }
                    },
                    {
                        category: {
                            $regex: safeSearchKey,
                            $options: "i"
                        }
                    }
                ]
            };
        }

        // Include both pending and approved books
        const allBooks = await books.find(searchCondition)
            .sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            message: "Books fetched successfully",
            data: allBooks
        });

    } catch (error) {
        console.log("Get all books error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch books",
            error: error.message
        });
    }
};


// Get books uploaded by the logged-in user
exports.getUserBookController = async (req, res) => {
    console.log("Inside getUserBookController");

    try {
        const loginUserMail = req.payload?.email;

        if (!loginUserMail) {
            return res.status(401).json({
                success: false,
                message: "Please login to view your uploaded books."
            });
        }

        const userBooks = await books.find({
            sellerMail: loginUserMail
        }).sort({ _id: -1 });

        return res.status(200).json(userBooks);

    } catch (error) {
        console.log("Get user books error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get books purchased by the logged-in user
exports.getUserBroughtBookController = async (req, res) => {
    console.log("Inside getUserBroughtBookController");

    try {
        const loginUserMail = req.payload?.email;

        if (!loginUserMail) {
            return res.status(401).json({
                success: false,
                message: "Please login to view your purchased books."
            });
        }

        const userBroughtBooks = await books.find({
            buyerMail: loginUserMail
        }).sort({ _id: -1 });

        return res.status(200).json(userBroughtBooks);

    } catch (error) {
        console.log("Get purchased books error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Delete a book uploaded by the logged-in user
exports.deleteBookController = async (req, res) => {
    console.log("Inside deleteBookController");

    try {
        const loginUserMail = req.payload?.email;
        const bookId = req.params.id;

        if (!loginUserMail) {
            return res.status(401).json({
                success: false,
                message: "Please login to delete a book."
            });
        }

        const deletedBook = await books.findOneAndDelete({
            _id: bookId,
            sellerMail: loginUserMail
        });

        if (!deletedBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found or you are not authorized to delete it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully",
            data: deletedBook
        });

    } catch (error) {
        console.log("Delete book error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get a single book by ID
exports.viewBookController = async (req, res) => {
    console.log("Inside viewBookController");

    try {
        const { id } = req.params;

        const bookDetails = await books.findById(id);

        if (!bookDetails) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        return res.status(200).json(bookDetails);

    } catch (error) {
        console.log("View book error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Approve a book from the admin dashboard
exports.approveBookController = async (req, res) => {
    console.log("Inside approveBookController");

    try {
        const { id } = req.params;

        const approvedBook = await books.findByIdAndUpdate(
            id,
            { $set: { status: "approved" } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!approvedBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book approved successfully",
            data: approvedBook
        });

    } catch (error) {
        console.log("Approve book error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
