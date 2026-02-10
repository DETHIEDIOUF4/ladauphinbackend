import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
    category: {
      type: String,
      enum: ["entrees", "plats", "desserts", "bar"], // bar / boissons
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
