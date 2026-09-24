// Each entry: { category, name, brand, price, discountPrice, stock, weight, unit, description, flags }
// flags: [featured, bestSeller, newArrival] booleans in that order (helper below expands them)

const img = (seed) =>
  `/products/${seed.toLowerCase().replace(/\s+/g, "-")}.jpg`;

const RAW = [
  // Rice
  ['Rice', 'Premium Miniket Rice', 'Pran', 620, 590, 40, 5, 'kg', 'Fine-grain miniket rice, polished and ready for daily cooking.', [1,1,0],  [
    "https://i.ibb.co.com/4RPmPzM6/Natural-Miniket-Rice.jpg"
  ]],
  ['Rice', 'Basmati Rice', 'Kohinoor', 780, 0, 35, 5, 'kg', 'Long-grain aromatic basmati rice, ideal for biryani and pulao.', [1,0,0]],
  ['Rice', 'Chinigura Rice', 'ACI', 190, 0, 50, 1, 'kg', 'Fragrant short-grain rice, perfect for polao and payesh.', [0,0,1]],

  // Flour & Atta
  ['Flour & Atta', 'Whole Wheat Atta', 'Fresh', 150, 140, 60, 2, 'kg', 'Whole wheat atta, stone-ground for soft rotis every time.', [0,1,0]],
  ['Flour & Atta', 'All-Purpose Maida', 'Teer', 70, 0, 55, 1, 'kg', 'Fine refined flour for parathas, naan and baking.', [0,0,0]],
  ['Flour & Atta', 'Fine Suji', 'Fresh', 75, 0, 45, 1, 'kg', 'Fine roasted suji, perfect for halwa and breakfast dishes.', [0,0,0]],

  // Lentils
  ['Lentils', 'Red Lentils (Masoor Dal)', 'Pran', 135, 0, 70, 1, 'kg', 'Cleaned split red lentils, quick-cooking and protein-rich.', [1,1,0]],
  ['Lentils', 'Yellow Split Peas (Motor Dal)', 'Teer', 110, 0, 40, 1, 'kg', 'Hulled yellow split peas for hearty everyday dal.', [0,0,0]],
  ['Lentils', 'Black Gram (Kalai Dal)', 'ACI', 160, 0, 30, 1, 'kg', 'Whole black gram lentils for traditional dishes.', [0,0,1]],

  // Cooking Oil
  ['Cooking Oil', 'Soybean Cooking Oil', 'Rupchanda', 990, 950, 80, 5, 'l', 'Refined soybean oil, light and suitable for daily cooking.', [1,1,0]],
  ['Cooking Oil', 'Mustard Oil', 'Radhuni', 230, 0, 45, 1, 'l', 'Cold-pressed mustard oil with a bold, authentic aroma.', [0,0,0]],
  ['Cooking Oil', 'Sunflower Oil', 'Teer', 850, 0, 25, 5, 'l', 'Light sunflower oil, ideal for frying and everyday cooking.', [0,0,1]],

  // Ghee
  ['Ghee', 'Pure Cow Ghee', 'Aarong', 520, 0, 30, 500, 'g', 'Traditional clarified butter ghee, rich in flavour.', [1,0,0]],
  ['Ghee', 'Vegetable Ghee', 'Fresh', 340, 0, 40, 500, 'g', 'Blended vegetable ghee for everyday cooking.', [0,0,0]],
  ['Ghee', 'Premium Desi Ghee', 'Milk Vita', 610, 580, 20, 1, 'kg', 'Slow-simmered desi ghee with a rich aroma.', [0,1,0]],

  // Salt
  ['Salt', 'Iodized Salt', 'ACI Pure', 40, 0, 100, 1, 'kg', 'Fine iodized salt for everyday cooking needs.', [0,0,0]],
  ['Salt', 'Rock Salt', 'Radhuni', 60, 0, 35, 500, 'g', 'Natural rock salt for special dishes.', [0,0,0]],
  ['Salt', 'Table Salt Fine', 'Fresh', 35, 0, 90, 1, 'kg', 'Free-flowing fine table salt.', [0,0,1]],

  // Sugar
  ['Sugar', 'White Sugar', 'Fresh', 130, 0, 100, 1, 'kg', 'Refined granulated sugar, clean and free-flowing.', [0,1,0]],
  ['Sugar', 'Brown Sugar', 'Pran', 150, 0, 40, 1, 'kg', 'Unrefined brown sugar with a natural molasses note.', [0,0,0]],
  ['Sugar', 'Icing Sugar', 'ACI', 110, 0, 25, 500, 'g', 'Fine icing sugar for baking and desserts.', [0,0,1]],

  // Spices
  ['Spices', 'Turmeric Powder', 'Radhuni', 70, 0, 60, 200, 'g', 'Pure ground turmeric with vibrant colour and aroma.', [0,0,0]],
  ['Spices', 'Red Chili Powder', 'Pran', 85, 0, 60, 200, 'g', 'Finely ground red chili for a spicy kick.', [0,1,0]],
  ['Spices', 'Mixed Whole Spices (Garam Masala)', 'Radhuni', 180, 0, 40, 200, 'g', 'A blend of whole spices for authentic home cooking.', [1,0,0]],
  ['Spices', 'Cumin Powder', 'ACI', 95, 0, 35, 200, 'g', 'Aromatic roasted cumin powder.', [0,0,1]],

  // Tea
  ['Tea', 'Premium Black Tea', 'Ispahani', 260, 0, 70, 400, 'g', 'Strong, aromatic black tea leaves for the perfect cup.', [1,1,0]],
  ['Tea', 'Green Tea Bags', 'Ispahani Mirzapore', 220, 200, 30, 100, 'pcs', 'Light, refreshing green tea bags.', [0,0,1]],
  ['Tea', 'CTC Tea Dust', 'Danish', 210, 0, 45, 400, 'g', 'Bold CTC tea dust for a strong morning cup.', [0,0,0]],

  // Coffee
  ['Coffee', 'Instant Coffee', 'Nescafe', 340, 0, 50, 100, 'g', 'Smooth instant coffee granules, ready in seconds.', [1,0,0]],
  ['Coffee', 'Ground Coffee', 'Tasty', 380, 350, 25, 200, 'g', 'Medium roast ground coffee for filter brewing.', [0,0,1]],
  ['Coffee', '3-in-1 Coffee Mix', 'Nescafe', 260, 0, 60, 10, 'pack', 'Convenient 3-in-1 coffee, milk and sugar mix.', [0,1,0]],

  // Milk Powder
  ['Milk Powder', 'Full Cream Milk Powder', 'Marks', 480, 0, 55, 500, 'g', 'Full-cream milk powder, easy to mix for daily use.', [1,0,0]],
  ['Milk Powder', 'Instant Milk Powder', 'Diploma', 900, 850, 30, 1, 'kg', 'Instant full-cream milk powder for the whole family.', [0,1,0]],
  ['Milk Powder', 'Skimmed Milk Powder', 'Fresh', 420, 0, 20, 500, 'g', 'Low-fat skimmed milk powder.', [0,0,1]],

  // Beverages
  ['Beverages', 'Mixed Fruit Juice', 'Pran Frutika', 150, 0, 60, 1, 'l', 'Refreshing mixed fruit juice with no added preservatives.', [0,1,0]],
  ['Beverages', 'Mango Juice', 'Pran', 140, 0, 65, 1, 'l', 'Rich, sweet mango juice made from real pulp.', [1,0,0]],
  ['Beverages', 'Energy Drink', 'Speed', 60, 0, 80, 250, 'ml', 'Refreshing energy drink for an instant boost.', [0,0,1]],

  // Soft Drinks
  ['Soft Drinks', 'Cola Soft Drink', 'Coca-Cola', 110, 0, 90, 1.5, 'l', 'Classic fizzy cola, chilled and ready to serve.', [1,1,0]],
  ['Soft Drinks', 'Lemon Lime Soda', 'Sprite', 100, 0, 70, 1.5, 'l', 'Crisp, refreshing lemon-lime soda.', [0,0,0]],
  ['Soft Drinks', 'Orange Soda', 'Mirinda', 100, 0, 65, 1.5, 'l', 'Fizzy orange-flavoured soft drink.', [0,0,1]],

  // Mineral Water
  ['Mineral Water', 'Mineral Water', 'Mum', 30, 0, 200, 1.5, 'l', 'Purified mineral water, safe and refreshing.', [0,1,0]],
  ['Mineral Water', 'Mineral Water 5L Jar', 'Aquafina', 90, 0, 60, 5, 'l', 'Large 5L jar of purified drinking water.', [0,0,0]],
  ['Mineral Water', 'Sparkling Water', 'Mojo', 45, 0, 40, 500, 'ml', 'Lightly carbonated mineral water.', [0,0,1]],

  // Biscuits
  ['Biscuits', 'Cream Biscuits', 'Olympic', 60, 0, 100, 200, 'g', 'Crunchy cream-filled biscuits, great with tea.', [0,1,0]],
  ['Biscuits', 'Digestive Biscuits', 'Nabisco', 130, 120, 45, 300, 'g', 'Wholesome digestive biscuits, lightly sweetened.', [1,0,0]],
  ['Biscuits', 'Glucose Biscuits', 'Pran', 40, 0, 120, 200, 'g', 'Classic glucose biscuits for a quick energy snack.', [0,0,0]],

  // Snacks
  ['Snacks', 'Potato Chips', 'Lays', 90, 0, 90, 150, 'g', 'Crispy salted potato chips, lightly seasoned.', [1,0,0]],
  ['Snacks', 'Spicy Chanachur', 'Bombay Sweets', 80, 0, 75, 200, 'g', 'Crunchy, spicy mixture snack.', [0,1,0]],
  ['Snacks', 'Roasted Peanuts', 'Pran', 70, 0, 55, 200, 'g', 'Lightly salted roasted peanuts.', [0,0,1]],

  // Noodles
  ['Noodles', 'Instant Noodles (5-pack)', 'Mama', 110, 0, 100, 5, 'pack', 'Quick-cook instant noodles with rich masala flavour.', [1,1,0]],
  ['Noodles', 'Chow Mein Noodles', 'Mr. Noodles', 95, 0, 50, 300, 'g', 'Stir-fry style noodles for a quick chow mein.', [0,0,0]],
  ['Noodles', 'Rice Noodles', 'Kokoyo', 120, 0, 30, 300, 'g', 'Thin rice noodles for soups and stir-fries.', [0,0,1]],

  // Breakfast Items
  ['Breakfast Items', 'Corn Flakes', 'Kellogg\'s', 320, 300, 40, 375, 'g', 'Crispy corn flakes for a light breakfast.', [1,0,0]],
  ['Breakfast Items', 'Muesli', 'Pran', 280, 0, 25, 400, 'g', 'Wholesome muesli with fruit and grains.', [0,0,1]],
  ['Breakfast Items', 'Vermicelli (Shemai)', 'Kajal', 65, 0, 60, 200, 'g', 'Fine roasted vermicelli for festive breakfasts.', [0,0,0]],

  // Honey
  ['Honey', 'Natural Honey', 'Apis', 420, 0, 35, 400, 'g', 'Pure, raw honey sourced from local apiaries.', [1,1,0]],
  ['Honey', 'Sundarban Honey', 'Shamuk', 550, 500, 20, 500, 'g', 'Wild forest honey from the Sundarbans.', [0,0,1]],

  // Dates
  ['Dates', 'Ajwa Dates', 'Al Madinah', 650, 0, 25, 500, 'g', 'Premium Ajwa dates from Madinah.', [1,0,0]],
  ['Dates', 'Mariam Dates', 'Al Madinah', 480, 450, 30, 500, 'g', 'Soft, sweet Mariam dates.', [0,1,0]],
  ['Dates', 'Dried Dates (Khejur)', 'Fresh', 220, 0, 45, 500, 'g', 'Everyday dried dates, naturally sweet.', [0,0,0]],

  // Dry Fruits
  ['Dry Fruits', 'Cashew Nuts', 'Kiam', 780, 0, 30, 500, 'g', 'Premium whole cashew nuts.', [1,0,0]],
  ['Dry Fruits', 'Almonds', 'Kiam', 720, 690, 30, 500, 'g', 'California almonds, rich in nutrients.', [0,1,0]],
  ['Dry Fruits', 'Raisins', 'Fresh', 220, 0, 45, 250, 'g', 'Sweet seedless raisins.', [0,0,1]],

  // Seeds  
  ['Seeds', 'Chia Seeds', 'NutriLife', 350, 0, 25, 250, 'g', 'Nutrient-dense chia seeds for smoothies and puddings.', [0,0,1], ["https://i.ibb.co.com/x83P8RtZ/Chia-Seeds.jpg"]],
  ['Seeds', 'Flax Seeds', 'NutriLife', 180, 0, 30, 250, 'g', 'Ground flax seeds, high in fibre.', [0,0,0]],

  // Oats
  ['Oats', 'Rolled Oats', 'Quaker', 260, 0, 40, 400, 'g', 'Wholesome rolled oats for a hearty breakfast.', [1,1,0]],
  ['Oats', 'Instant Oats', 'PranUp', 210, 0, 35, 400, 'g', 'Quick-cook instant oats, ready in minutes.', [0,0,0]],

  // Peanut Butter
  ['Peanut Butter', 'Smooth Peanut Butter', 'Pufito', 320, 0, 35, 340, 'g', 'Creamy smooth peanut butter.', [0,1,0]],
  ['Peanut Butter', 'Crunchy Peanut Butter', 'Pufito', 330, 300, 30, 340, 'g', 'Crunchy peanut butter with real peanut bits.', [1,0,0]],

  // Jam
  ['Jam', 'Mixed Fruit Jam', 'Pran', 150, 0, 45, 400, 'g', 'Sweet mixed fruit jam for toast and paratha.', [0,0,0]],
  ['Jam', 'Strawberry Jam', 'Kissan', 180, 0, 30, 400, 'g', 'Classic strawberry jam.', [0,1,0]],

  // Jelly
  ['Jelly', 'Mixed Fruit Jelly Cups', 'Pran', 90, 0, 50, 12, 'pcs', 'Fun fruit jelly cups for kids.', [0,0,1]],
  ['Jelly', 'Guava Jelly', 'Pran', 130, 0, 25, 400, 'g', 'Traditional guava jelly preserve.', [0,0,0]],

  // Pickles
  ['Pickles', 'Mixed Vegetable Pickle', 'Pran', 160, 0, 40, 400, 'g', 'Traditional tangy-spicy mixed vegetable pickle.', [1,0,0]],
  ['Pickles', 'Mango Pickle', 'Pran', 150, 0, 35, 400, 'g', 'Classic spicy mango pickle.', [0,1,0]],

  // Sauces
  ['Sauces', 'Soy Sauce', 'Pran', 120, 0, 45, 300, 'ml', 'Savoury soy sauce for stir-fries and marinades.', [0,0,0]],
  ['Sauces', 'Chili Sauce', 'Pran', 110, 0, 55, 300, 'ml', 'Spicy chili sauce for everyday meals.', [0,1,0]],

  // Tomato Ketchup
  ['Tomato Ketchup', 'Tomato Ketchup', 'Pran', 140, 0, 60, 500, 'g', 'Rich, tangy tomato ketchup made from ripe tomatoes.', [1,1,0]],
  ['Tomato Ketchup', 'Tomato Ketchup Squeeze Bottle', 'Heinz', 320, 300, 25, 700, 'g', 'Premium tomato ketchup in a squeeze bottle.', [0,0,1]],

  // Mayonnaise
  ['Mayonnaise', 'Classic Mayonnaise', 'Pran', 210, 0, 35, 300, 'g', 'Creamy classic mayonnaise for sandwiches and salads.', [0,0,0]],
  ['Mayonnaise', 'Garlic Mayonnaise', 'Kraft', 260, 0, 20, 300, 'g', 'Mayonnaise with a bold garlic kick.', [0,0,1]],

  // Frozen Food
  ['Frozen Food', 'Frozen Paratha (10-pack)', 'Golden Harvest', 220, 0, 40, 10, 'pack', 'Ready-to-cook layered parathas, straight from freezer to pan.', [1,0,0]],
  ['Frozen Food', 'Frozen Chicken Nuggets', 'Kazi Farms', 320, 300, 30, 400, 'g', 'Crispy breaded chicken nuggets.', [0,1,0]],
  ['Frozen Food', 'Frozen Samosa (12-pack)', 'Golden Harvest', 180, 0, 35, 12, 'pack', 'Ready-to-fry vegetable samosas.', [0,0,1]],

  // Eggs
  ['Eggs', 'Farm Fresh Eggs (12-pack)', 'Kazi Farms', 140, 0, 90, 1, 'dozen', 'Farm fresh eggs, carefully selected and packed.', [1,1,0]],
  ['Eggs', 'Duck Eggs (6-pack)', 'Fresh', 110, 0, 30, 6, 'pcs', 'Rich, flavourful duck eggs.', [0,0,0]],

  // Baby Food
  ['Baby Food', 'Infant Formula Stage 1', 'Nestle Lactogen', 950, 900, 25, 400, 'g', 'Infant formula milk for stage 1 feeding.', [1,0,0]],
  ['Baby Food', 'Baby Rice Cereal', 'Cerelac', 420, 0, 30, 400, 'g', 'Iron-fortified rice cereal for babies.', [0,1,0]],

  // Instant Food
  ['Instant Food', 'Instant Khichuri Mix', 'Pran', 130, 0, 40, 400, 'g', 'Ready-to-cook khichuri mix for a quick meal.', [0,0,1]],
  ['Instant Food', 'Instant Cup Soup', 'Knorr', 60, 0, 55, 1, 'pcs', 'Quick and easy instant cup soup.', [0,0,0]],

  // Tissue
  ['Tissue', 'Facial Tissue Box', 'Fresh', 70, 0, 80, 1, 'pcs', 'Soft, absorbent facial tissues for everyday use.', [0,0,0]],
  ['Tissue', 'Toilet Tissue Roll (4-pack)', 'Softex', 160, 150, 60, 4, 'pack', 'Soft, strong toilet tissue rolls.', [1,1,0]],

  // Soap
  ['Soap', 'Bathing Soap Bar', 'Lux', 45, 0, 100, 100, 'g', 'Gentle everyday bathing soap for the whole family.', [0,0,0]],
  ['Soap', 'Antibacterial Soap', 'Lifebuoy', 50, 0, 90, 100, 'g', 'Antibacterial soap for extra protection.', [1,1,0]],

  // Shampoo
  ['Shampoo', 'Herbal Shampoo', 'Sunsilk', 190, 0, 45, 200, 'ml', 'Nourishing herbal shampoo for everyday hair care.', [0,0,0]],
  ['Shampoo', 'Anti-Dandruff Shampoo', 'Head & Shoulders', 260, 240, 35, 200, 'ml', 'Effective anti-dandruff shampoo.', [1,0,1]],

  // Toothpaste
  ['Toothpaste', 'Fluoride Toothpaste', 'Colgate', 95, 0, 100, 150, 'g', 'Fluoride toothpaste for daily cavity protection.', [0,1,0]],
  ['Toothpaste', 'Whitening Toothpaste', 'Pepsodent', 110, 0, 60, 150, 'g', 'Whitening toothpaste for a brighter smile.', [0,0,0]],

  // Dish Wash
  ['Dish Wash', 'Dish Washing Liquid', 'Vim', 130, 0, 55, 500, 'ml', 'Powerful grease-cutting dish washing liquid.', [1,0,0]],
  ['Dish Wash', 'Dish Washing Bar', 'Vim', 30, 0, 90, 200, 'g', 'Economical dish washing bar for everyday use.', [0,1,0]],

  // Detergent
  ['Detergent', 'Laundry Detergent Powder', 'Wheel', 190, 0, 70, 1, 'kg', 'Powerful detergent powder for bright, clean laundry.', [1,1,0]],
  ['Detergent', 'Liquid Detergent', 'Surf Excel', 320, 300, 30, 1, 'l', 'Concentrated liquid detergent for tough stains.', [0,0,1]],

  // Cleaning Supplies
  ['Cleaning Supplies', 'Floor Cleaner', 'Harpic', 150, 0, 45, 1, 'l', 'Disinfecting floor cleaner with a fresh scent.', [0,0,0]],
  ['Cleaning Supplies', 'Toilet Cleaner', 'Harpic', 140, 0, 55, 500, 'ml', 'Powerful toilet cleaner that kills germs.', [1,0,0]],
  ['Cleaning Supplies', 'Glass Cleaner', 'Colin', 130, 0, 30, 500, 'ml', 'Streak-free glass and window cleaner.', [0,0,1]],
];

function buildProducts(categoryIdByName) {
  return RAW.map(([category, name, brand, price, discountPrice, stock, weight, unit, description, flags, images], idx) => {
    const sku = `MB-${category.slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(4, '0')}`;
    return {
      name,
      brand,
      category: categoryIdByName[category],
      description,
      images: images || [img(name)],
      price,
      discountPrice: discountPrice || 0,
      stock,
      sku,
      weight,
      unit,
      rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
      numReviews: Math.floor(Math.random() * 40),
      isFeatured: !!flags[0],
      isBestSeller: !!flags[1],
      isNewArrival: !!flags[2],
    };
  });
}

module.exports = { buildProducts };
