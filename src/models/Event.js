import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    when: { type: String, default: "" }, // ex: "Chaque vendredi et samedi soir"
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);

