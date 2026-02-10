import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { MenuItem } from "../models/MenuItem.js";

const router = express.Router();

// GET /api/menu — public, retourne tous les éléments du menu groupés
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu — gestionnaire uniquement
router.post("/", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, order } = req.body;
    const item = await MenuItem.create({
      name,
      description: description || "",
      price: Number(price),
      imageUrl: imageUrl || "",
      category,
      order: order != null ? Number(order) : 0,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/menu/:id — gestionnaire uniquement
router.put("/:id", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, order } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      {
        ...(name != null && { name }),
        ...(description != null && { description }),
        ...(price != null && { price: Number(price) }),
        ...(imageUrl != null && { imageUrl: imageUrl || "" }),
        ...(category != null && { category }),
        ...(order != null && { order: Number(order) }),
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Élément introuvable" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id — gestionnaire uniquement
router.delete("/:id", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Élément introuvable" });
    res.json({ message: "Supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
