import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true }, // snapshot du nom au moment de la commande
    price: { type: Number, required: true }, // snapshot du prix au moment de la commande
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["lancee", "en_preparation", "servie", "payee", "annulee"],
      default: "lancee",
    },
    tableNumber: { type: String },
    serveuse: { type: String }, // nom de la serveuse
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // caissier ou gestionnaire
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

