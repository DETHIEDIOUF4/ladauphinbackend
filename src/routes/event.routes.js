import express from "express";
import { Event } from "../models/Event.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// Liste publique des événements actifs (pour le site vitrine)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Gestion des événements (réservé au gestionnaire)
router.post("/", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const { title, description, when, isActive, order } = req.body;
    const event = await Event.create({
      title: title?.trim(),
      description: (description || "").trim(),
      when: (when || "").trim(),
      isActive: typeof isActive === "boolean" ? isActive : true,
      order: Number(order) || 0,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const { title, description, when, isActive, order } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title?.trim(),
        description: (description || "").trim(),
        when: (when || "").trim(),
        isActive,
        order: Number(order) || 0,
      },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }
    res.json({ message: "Événement supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

