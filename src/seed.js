import { User } from "./models/User.js";
import { MenuItem } from "./models/MenuItem.js";

const DEFAULT_GESTIONNAIRE = {
  name: "Gestionnaire",
  email: "gestionnaire@dauphin.com",
  password: "dauphin2025",
  role: "gestionnaire",
};

// Prix en FCFA
const DEFAULT_MENU_ITEMS = [
  // Entrées
  { name: "Salade du Dauphin", description: "Mélange de jeunes pousses, noix et fromage", price: 7500, category: "entrees", order: 0 },
  { name: "Carpaccio de bœuf", description: "Parmentier de légumes, copeaux de parmesan", price: 9000, category: "entrees", order: 1 },
  { name: "Soupe du jour", description: "Selon le marché", price: 5000, category: "entrees", order: 2 },
  // Plats
  { name: "Filet de bar grillé", description: "Légumes de saison, beurre blanc", price: 15000, category: "plats", order: 0 },
  { name: "Risotto aux fruits de mer", description: "Crémeux, parfumé au safran", price: 14000, category: "plats", order: 1 },
  { name: "Pavé de bœuf", description: "Frites maison, sauce au poivre", price: 17000, category: "plats", order: 2 },
  // Desserts
  { name: "Fondant au chocolat", description: "Cœur coulant, glace vanille", price: 6500, category: "desserts", order: 0 },
  { name: "Tarte aux fruits de saison", description: "Crème pâtissière", price: 6000, category: "desserts", order: 1 },
  { name: "Café gourmand", description: "Assortiment de mignardises", price: 7000, category: "desserts", order: 2 },
  // Bar & boissons — Cocktails signature
  { name: "Dauphin Spritz", description: "Prosecco, apéritif maison, soda", price: 10000, category: "bar", order: 0 },
  { name: "Sunset Almadies", description: "Rhum, fruits de la passion, citron vert", price: 12000, category: "bar", order: 1 },
  { name: "Cabanon Mojito", description: "Rhum blanc, menthe fraîche, citron vert", price: 11000, category: "bar", order: 2 },
  // Bar & boissons — Vins & bulles
  { name: "Champagne (coupe)", description: "Coupe de champagne", price: 12000, category: "bar", order: 3 },
  { name: "Champagne (bouteille)", description: "Bouteille de champagne", price: 85000, category: "bar", order: 4 },
  { name: "Vin blanc sec (verre)", description: "Verre de vin blanc sec", price: 6000, category: "bar", order: 5 },
  { name: "Vin blanc sec (bouteille)", description: "Bouteille de vin blanc sec", price: 28000, category: "bar", order: 6 },
  { name: "Vin rouge (verre)", description: "Verre de vin rouge", price: 6000, category: "bar", order: 7 },
  { name: "Vin rouge (bouteille)", description: "Bouteille de vin rouge", price: 28000, category: "bar", order: 8 },
  { name: "Rosé (verre)", description: "Verre de rosé", price: 6000, category: "bar", order: 9 },
  { name: "Rosé (bouteille)", description: "Bouteille de rosé", price: 28000, category: "bar", order: 10 },
  // Bar & boissons — Sans alcool
  { name: "Jus de fruits frais", description: "Orange, ananas, pastèque", price: 6000, category: "bar", order: 11 },
  { name: "Citronnade maison", description: "Menthe et gingembre", price: 5000, category: "bar", order: 12 },
  { name: "Café & thés", description: "Expresso, allongé, infusions", price: 4000, category: "bar", order: 13 },
];

/**
 * Insère un compte gestionnaire et des plats par défaut si les collections sont vides.
 * À utiliser au démarrage en local (SEED_ON_START=1) ou via npm run seed.
 */
export async function runSeed() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create(DEFAULT_GESTIONNAIRE);
    console.log("Seed: compte gestionnaire créé —", DEFAULT_GESTIONNAIRE.email, "/ mot de passe:", DEFAULT_GESTIONNAIRE.password);
  } else {
    console.log("Seed: utilisateurs déjà présents, aucun compte par défaut créé.");
  }

  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany(DEFAULT_MENU_ITEMS);
    console.log("Seed:", DEFAULT_MENU_ITEMS.length, "éléments de menu créés.");
  } else {
    console.log("Seed: menu déjà présent, aucun plat par défaut ajouté en bloc.");

    // On s'assure au moins que les éléments de bar / boissons existent
    const barItems = DEFAULT_MENU_ITEMS.filter((item) => item.category === "bar");
    for (const barItem of barItems) {
      await MenuItem.findOneAndUpdate(
        { name: barItem.name },
        { $setOnInsert: barItem },
        { upsert: true, new: false }
      );
    }
    console.log("Seed: éléments bar / boissons vérifiés / ajoutés si absents.");
  }
}
