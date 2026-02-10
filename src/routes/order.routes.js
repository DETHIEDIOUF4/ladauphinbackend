import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { MenuItem } from "../models/MenuItem.js";
import { Order } from "../models/Order.js";

const router = express.Router();

// Créer une commande (caissier ou gestionnaire)
router.post("/", auth, authorize("agent_caisse", "gestionnaire"), async (req, res) => {
  try {
    const { items, tableNumber, serveuse } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Aucun article dans la commande" });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
    if (menuItems.length !== items.length) {
      return res.status(400).json({ message: "Certains articles du menu sont introuvables" });
    }

    const orderItems = [];
    let total = 0;

    for (const inputItem of items) {
      const menuItem = menuItems.find((m) => m._id.toString() === inputItem.menuItemId);
      const qty = Number(inputItem.quantity) || 1;
      const subtotal = menuItem.price * qty;
      total += subtotal;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        subtotal,
      });
    }

    const order = await Order.create({
      items: orderItems,
      total,
      tableNumber,
      serveuse: serveuse || undefined,
      createdBy: req.user._id,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Liste des commandes (caissier + gestionnaire)
router.get("/", auth, authorize("agent_caisse", "gestionnaire"), async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("createdBy", "name role");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Changer le statut (lancée → en_preparation → servie → payee ; seul le gestionnaire peut annuler)
router.patch("/:id/status", auth, authorize("agent_caisse", "gestionnaire"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["lancee", "en_preparation", "servie", "payee", "annulee"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    // Seul le gestionnaire peut annuler
    if (status === "annulee" && req.user.role !== "gestionnaire") {
      return res.status(403).json({ message: "Seul le gestionnaire peut annuler une commande" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("createdBy", "name role");

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Statistiques (gestionnaire uniquement)
router.get("/stats", auth, authorize("gestionnaire"), async (req, res) => {
  try {
    const baseMatch = { status: "payee" };
    const [totalRevenue, countByStatus, topItems] = await Promise.all([
      Order.aggregate([{ $match: baseMatch }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: baseMatch },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" } } },
        { $sort: { quantity: -1 } },
        { $limit: 10 },
      ]),
    ]);
    const solde = totalRevenue[0]?.total ?? 0;
    const byStatus = Object.fromEntries((countByStatus || []).map((s) => [s._id, s.count]));
    res.json({ solde, byStatus, topItems: topItems || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

