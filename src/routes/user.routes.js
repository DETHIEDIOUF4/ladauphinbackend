import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = express.Router();

// Liste de tous les utilisateurs (gestionnaire uniquement)
router.get("/", auth, authorize("gestionnaire"), async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// Liste des agents de caisse (gestionnaire)
router.get("/agents", auth, authorize("gestionnaire"), async (req, res) => {
  const agents = await User.find({ role: "agent_caisse" }).select("-password");
  res.json(agents);
});

// Créer un utilisateur (gestionnaire uniquement) — ex: ajouter un caissier
router.post("/", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password et role requis" });
    }
    if (!["gestionnaire", "agent_caisse"].includes(role)) {
      return res.status(400).json({ message: "role doit être gestionnaire ou agent_caisse" });
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Profil de l'utilisateur connecté
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

export default router;

