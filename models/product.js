import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        altNames: {
            type: [String],
            default: [],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        images: {
            type: [String],
            default: [],
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        labelledPrice: {
            type: Number,
            required: true
        },
        category: {
            main: {
                type: String, // Women
                required: true,
            },
            sub: {
                type: String, // Face Care
                required: true,
            },
            child: {
                type: String, // Day Cream
                required: true,
            },
        },
        // category: {
        //     type: String,
        //     required: true
        // },
        // subCategory: {
        //     type: String,
        //     required: true,
        // },
        stock: {
            type: Number,
            required: true,
            default: 0
        }
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;