// =====================================================================
//  StyleStock — MongoDB version            02_seed.js  (run after 01_schema.js)
//
//  Same rows as database/seed.sql: every INSERT INTO ... VALUES becomes
//  one insertMany(). Collections are filled parent-first, like the SQL
//  file, even though MongoDB would not complain about the order.
//
//  Run:   mongosh "mongodb://127.0.0.1:27017" 02_seed.js
// =====================================================================

db = db.getSiblingDB("fashion_retail");

// category (9 documents)
db.category.insertMany([
  { category_id: 1, cat_name: "Men", gender: "Men", parent_category_id: null },
  { category_id: 2, cat_name: "Women", gender: "Women", parent_category_id: null },
  { category_id: 3, cat_name: "Footwear", gender: "Unisex", parent_category_id: null },
  { category_id: 4, cat_name: "Accessories", gender: "Unisex", parent_category_id: null },
  { category_id: 5, cat_name: "Shirts", gender: "Men", parent_category_id: 1 },
  { category_id: 6, cat_name: "Jeans", gender: "Men", parent_category_id: 1 },
  { category_id: 7, cat_name: "Dresses", gender: "Women", parent_category_id: 2 },
  { category_id: 8, cat_name: "Tops", gender: "Women", parent_category_id: 2 },
  { category_id: 9, cat_name: "Kids", gender: "Kids", parent_category_id: null }
]);

// brand (11 documents)
db.brand.insertMany([
  { brand_id: 1, brand_name: "Allen Solly" },
  { brand_id: 2, brand_name: "H&M" },
  { brand_id: 3, brand_name: "Levi's" },
  { brand_id: 4, brand_name: "Zara" },
  { brand_id: 5, brand_name: "Uniqlo" },
  { brand_id: 6, brand_name: "Nike" },
  { brand_id: 7, brand_name: "Woodland" },
  { brand_id: 8, brand_name: "Reebok" },
  { brand_id: 9, brand_name: "Fossil" },
  { brand_id: 10, brand_name: "Wildcraft" },
  { brand_id: 11, brand_name: "Ray-Ban" }
]);

// supplier (5 documents)
db.supplier.insertMany([
  { supplier_id: 1, sname: "Indigo Mills Co.", city: "Ahmedabad" },
  { supplier_id: 2, sname: "Vantage Textiles", city: "Tirupur" },
  { supplier_id: 3, sname: "Coastline Apparel", city: "Surat" },
  { supplier_id: 4, sname: "Metro Footwear Ltd.", city: "Agra" },
  { supplier_id: 5, sname: "Aurora Knits", city: "Ludhiana" }
]);

// product (17 documents)
db.product.insertMany([
  { product_id: 1, pname: "Classic Oxford Shirt", base_price: 1499, category_id: 5, brand_id: 1 },
  { product_id: 2, pname: "Slim Fit Chambray Shirt", base_price: 1699, category_id: 5, brand_id: 2 },
  { product_id: 3, pname: "Straight Fit Jeans", base_price: 2299, category_id: 6, brand_id: 3 },
  { product_id: 4, pname: "Slim Tapered Jeans", base_price: 2499, category_id: 6, brand_id: 3 },
  { product_id: 5, pname: "Wrap Midi Dress", base_price: 2999, category_id: 7, brand_id: 4 },
  { product_id: 6, pname: "Floral Sundress", base_price: 2599, category_id: 7, brand_id: 2 },
  { product_id: 7, pname: "Silk Blouse Top", base_price: 1899, category_id: 8, brand_id: 4 },
  { product_id: 8, pname: "Ribbed Tank Top", base_price: 899, category_id: 8, brand_id: 5 },
  { product_id: 9, pname: "Canvas Sneakers", base_price: 1999, category_id: 3, brand_id: 6 },
  { product_id: 10, pname: "Leather Chelsea Boots", base_price: 4499, category_id: 3, brand_id: 7 },
  { product_id: 11, pname: "Running Trainers", base_price: 3299, category_id: 3, brand_id: 8 },
  { product_id: 12, pname: "Leather Belt", base_price: 799, category_id: 4, brand_id: 9 },
  { product_id: 13, pname: "Wool Scarf", base_price: 999, category_id: 4, brand_id: 5 },
  { product_id: 14, pname: "Canvas Tote Bag", base_price: 1299, category_id: 4, brand_id: 10 },
  { product_id: 15, pname: "Aviator Sunglasses", base_price: 1499, category_id: 4, brand_id: 11 },
  { product_id: 16, pname: "Dino Graphic Tee", base_price: 699, category_id: 9, brand_id: 2 },
  { product_id: 17, pname: "Cargo Shorts", base_price: 799, category_id: 9, brand_id: 5 }
]);

// supplies (18 documents)
db.supplies.insertMany([
  { supplier_id: 1, product_id: 1, cost_price: 820, lead_time: 7 },
  { supplier_id: 1, product_id: 2, cost_price: 910, lead_time: 7 },
  { supplier_id: 1, product_id: 3, cost_price: 1240, lead_time: 10 },
  { supplier_id: 1, product_id: 4, cost_price: 1360, lead_time: 10 },
  { supplier_id: 2, product_id: 3, cost_price: 1190, lead_time: 14 },
  { supplier_id: 3, product_id: 5, cost_price: 1580, lead_time: 12 },
  { supplier_id: 3, product_id: 6, cost_price: 1390, lead_time: 12 },
  { supplier_id: 3, product_id: 7, cost_price: 990, lead_time: 9 },
  { supplier_id: 3, product_id: 8, cost_price: 410, lead_time: 6 },
  { supplier_id: 4, product_id: 9, cost_price: 1050, lead_time: 15 },
  { supplier_id: 4, product_id: 10, cost_price: 2600, lead_time: 21 },
  { supplier_id: 4, product_id: 11, cost_price: 1820, lead_time: 18 },
  { supplier_id: 5, product_id: 12, cost_price: 380, lead_time: 5 },
  { supplier_id: 5, product_id: 13, cost_price: 460, lead_time: 5 },
  { supplier_id: 5, product_id: 14, cost_price: 610, lead_time: 8 },
  { supplier_id: 2, product_id: 15, cost_price: 720, lead_time: 11 },
  { supplier_id: 3, product_id: 16, cost_price: 290, lead_time: 6 },
  { supplier_id: 5, product_id: 17, cost_price: 340, lead_time: 6 }
]);

// variant (47 documents)
db.variant.insertMany([
  { sku: "P1-S", size: "S", colour: "White", product_id: 1 },
  { sku: "P1-M", size: "M", colour: "White", product_id: 1 },
  { sku: "P1-L", size: "L", colour: "White", product_id: 1 },
  { sku: "P2-S", size: "S", colour: "Blue", product_id: 2 },
  { sku: "P2-M", size: "M", colour: "Blue", product_id: 2 },
  { sku: "P2-L", size: "L", colour: "Blue", product_id: 2 },
  { sku: "P3-30", size: "30", colour: "Indigo", product_id: 3 },
  { sku: "P3-32", size: "32", colour: "Indigo", product_id: 3 },
  { sku: "P3-34", size: "34", colour: "Indigo", product_id: 3 },
  { sku: "P4-30", size: "30", colour: "Black", product_id: 4 },
  { sku: "P4-32", size: "32", colour: "Black", product_id: 4 },
  { sku: "P4-34", size: "34", colour: "Black", product_id: 4 },
  { sku: "P5-S", size: "S", colour: "Maroon", product_id: 5 },
  { sku: "P5-M", size: "M", colour: "Maroon", product_id: 5 },
  { sku: "P5-L", size: "L", colour: "Maroon", product_id: 5 },
  { sku: "P6-S", size: "S", colour: "Floral", product_id: 6 },
  { sku: "P6-M", size: "M", colour: "Floral", product_id: 6 },
  { sku: "P6-L", size: "L", colour: "Floral", product_id: 6 },
  { sku: "P7-S", size: "S", colour: "Ivory", product_id: 7 },
  { sku: "P7-M", size: "M", colour: "Ivory", product_id: 7 },
  { sku: "P7-L", size: "L", colour: "Ivory", product_id: 7 },
  { sku: "P8-S", size: "S", colour: "Grey", product_id: 8 },
  { sku: "P8-M", size: "M", colour: "Grey", product_id: 8 },
  { sku: "P8-L", size: "L", colour: "Grey", product_id: 8 },
  { sku: "P9-7", size: "7", colour: "White", product_id: 9 },
  { sku: "P9-8", size: "8", colour: "White", product_id: 9 },
  { sku: "P9-9", size: "9", colour: "White", product_id: 9 },
  { sku: "P10-7", size: "7", colour: "Tan", product_id: 10 },
  { sku: "P10-8", size: "8", colour: "Tan", product_id: 10 },
  { sku: "P10-9", size: "9", colour: "Tan", product_id: 10 },
  { sku: "P11-7", size: "7", colour: "Black", product_id: 11 },
  { sku: "P11-8", size: "8", colour: "Black", product_id: 11 },
  { sku: "P11-9", size: "9", colour: "Black", product_id: 11 },
  { sku: "P12-BLK", size: "OneSize", colour: "Black", product_id: 12 },
  { sku: "P12-TAN", size: "OneSize", colour: "Tan", product_id: 12 },
  { sku: "P13-GRY", size: "OneSize", colour: "Grey", product_id: 13 },
  { sku: "P13-NVY", size: "OneSize", colour: "Navy", product_id: 13 },
  { sku: "P14-NAT", size: "OneSize", colour: "Natural", product_id: 14 },
  { sku: "P14-BLK", size: "OneSize", colour: "Black", product_id: 14 },
  { sku: "P15-BLK", size: "OneSize", colour: "Black", product_id: 15 },
  { sku: "P15-TOR", size: "OneSize", colour: "Tortoise", product_id: 15 },
  { sku: "P16-4-5Y", size: "4-5Y", colour: "Yellow", product_id: 16 },
  { sku: "P16-6-7Y", size: "6-7Y", colour: "Yellow", product_id: 16 },
  { sku: "P16-8-9Y", size: "8-9Y", colour: "Yellow", product_id: 16 },
  { sku: "P17-4-5Y", size: "4-5Y", colour: "Khaki", product_id: 17 },
  { sku: "P17-6-7Y", size: "6-7Y", colour: "Khaki", product_id: 17 },
  { sku: "P17-8-9Y", size: "8-9Y", colour: "Khaki", product_id: 17 }
]);

// stores (5 documents)
db.stores.insertMany([
  { store_id: 1, store_name: "Flagship - MG Road, Bengaluru", store_type: "Flagship" },
  { store_id: 2, store_name: "Warehouse - Chennai", store_type: "Warehouse" },
  { store_id: 3, store_name: "Outlet - Pune", store_type: "Outlet" },
  { store_id: 4, store_name: "Pop-up - Select City Walk, Delhi", store_type: "Popup" },
  { store_id: 5, store_name: "StyleStock Online Store", store_type: "Online" }
]);

// stocks (141 documents)
db.stocks.insertMany([
  { store_id: 1, sku: "P1-S", qty_on_hand: 0, reorder_level: 12 },
  { store_id: 3, sku: "P1-S", qty_on_hand: 3, reorder_level: 12 },
  { store_id: 2, sku: "P1-M", qty_on_hand: 7, reorder_level: 12 },
  { store_id: 4, sku: "P1-M", qty_on_hand: 14, reorder_level: 12 },
  { store_id: 3, sku: "P1-L", qty_on_hand: 14, reorder_level: 12 },
  { store_id: 1, sku: "P1-L", qty_on_hand: 25, reorder_level: 12 },
  { store_id: 4, sku: "P2-S", qty_on_hand: 21, reorder_level: 12 },
  { store_id: 2, sku: "P2-S", qty_on_hand: 36, reorder_level: 12 },
  { store_id: 1, sku: "P2-M", qty_on_hand: 28, reorder_level: 12 },
  { store_id: 3, sku: "P2-M", qty_on_hand: 2, reorder_level: 12 },
  { store_id: 2, sku: "P2-L", qty_on_hand: 35, reorder_level: 12 },
  { store_id: 4, sku: "P2-L", qty_on_hand: 13, reorder_level: 12 },
  { store_id: 3, sku: "P3-30", qty_on_hand: 42, reorder_level: 12 },
  { store_id: 1, sku: "P3-30", qty_on_hand: 24, reorder_level: 12 },
  { store_id: 4, sku: "P3-32", qty_on_hand: 4, reorder_level: 12 },
  { store_id: 2, sku: "P3-32", qty_on_hand: 35, reorder_level: 12 },
  { store_id: 1, sku: "P3-34", qty_on_hand: 11, reorder_level: 12 },
  { store_id: 3, sku: "P3-34", qty_on_hand: 1, reorder_level: 12 },
  { store_id: 2, sku: "P4-30", qty_on_hand: 18, reorder_level: 12 },
  { store_id: 4, sku: "P4-30", qty_on_hand: 12, reorder_level: 12 },
  { store_id: 3, sku: "P4-32", qty_on_hand: 25, reorder_level: 12 },
  { store_id: 1, sku: "P4-32", qty_on_hand: 23, reorder_level: 12 },
  { store_id: 4, sku: "P4-34", qty_on_hand: 32, reorder_level: 12 },
  { store_id: 2, sku: "P4-34", qty_on_hand: 34, reorder_level: 12 },
  { store_id: 1, sku: "P5-S", qty_on_hand: 39, reorder_level: 12 },
  { store_id: 3, sku: "P5-S", qty_on_hand: 0, reorder_level: 12 },
  { store_id: 2, sku: "P5-M", qty_on_hand: 1, reorder_level: 12 },
  { store_id: 4, sku: "P5-M", qty_on_hand: 11, reorder_level: 12 },
  { store_id: 3, sku: "P5-L", qty_on_hand: 8, reorder_level: 12 },
  { store_id: 1, sku: "P5-L", qty_on_hand: 22, reorder_level: 12 },
  { store_id: 4, sku: "P6-S", qty_on_hand: 15, reorder_level: 12 },
  { store_id: 2, sku: "P6-S", qty_on_hand: 33, reorder_level: 12 },
  { store_id: 1, sku: "P6-M", qty_on_hand: 22, reorder_level: 12 },
  { store_id: 3, sku: "P6-M", qty_on_hand: 44, reorder_level: 12 },
  { store_id: 2, sku: "P6-L", qty_on_hand: 29, reorder_level: 12 },
  { store_id: 4, sku: "P6-L", qty_on_hand: 10, reorder_level: 12 },
  { store_id: 3, sku: "P7-S", qty_on_hand: 36, reorder_level: 12 },
  { store_id: 1, sku: "P7-S", qty_on_hand: 21, reorder_level: 12 },
  { store_id: 4, sku: "P7-M", qty_on_hand: 43, reorder_level: 12 },
  { store_id: 2, sku: "P7-M", qty_on_hand: 32, reorder_level: 12 },
  { store_id: 1, sku: "P7-L", qty_on_hand: 5, reorder_level: 12 },
  { store_id: 3, sku: "P7-L", qty_on_hand: 43, reorder_level: 12 },
  { store_id: 2, sku: "P8-S", qty_on_hand: 12, reorder_level: 12 },
  { store_id: 4, sku: "P8-S", qty_on_hand: 9, reorder_level: 12 },
  { store_id: 3, sku: "P8-M", qty_on_hand: 19, reorder_level: 12 },
  { store_id: 1, sku: "P8-M", qty_on_hand: 20, reorder_level: 12 },
  { store_id: 4, sku: "P8-L", qty_on_hand: 26, reorder_level: 12 },
  { store_id: 2, sku: "P8-L", qty_on_hand: 31, reorder_level: 12 },
  { store_id: 1, sku: "P9-7", qty_on_hand: 33, reorder_level: 12 },
  { store_id: 3, sku: "P9-7", qty_on_hand: 42, reorder_level: 12 },
  { store_id: 2, sku: "P9-8", qty_on_hand: 40, reorder_level: 12 },
  { store_id: 4, sku: "P9-8", qty_on_hand: 8, reorder_level: 12 },
  { store_id: 3, sku: "P9-9", qty_on_hand: 2, reorder_level: 12 },
  { store_id: 1, sku: "P9-9", qty_on_hand: 19, reorder_level: 12 },
  { store_id: 4, sku: "P10-7", qty_on_hand: 9, reorder_level: 12 },
  { store_id: 2, sku: "P10-7", qty_on_hand: 30, reorder_level: 12 },
  { store_id: 1, sku: "P10-8", qty_on_hand: 16, reorder_level: 12 },
  { store_id: 3, sku: "P10-8", qty_on_hand: 41, reorder_level: 12 },
  { store_id: 2, sku: "P10-9", qty_on_hand: 23, reorder_level: 12 },
  { store_id: 4, sku: "P10-9", qty_on_hand: 7, reorder_level: 12 },
  { store_id: 3, sku: "P11-7", qty_on_hand: 30, reorder_level: 12 },
  { store_id: 1, sku: "P11-7", qty_on_hand: 18, reorder_level: 12 },
  { store_id: 4, sku: "P11-8", qty_on_hand: 37, reorder_level: 12 },
  { store_id: 2, sku: "P11-8", qty_on_hand: 29, reorder_level: 12 },
  { store_id: 1, sku: "P11-9", qty_on_hand: 44, reorder_level: 12 },
  { store_id: 3, sku: "P11-9", qty_on_hand: 40, reorder_level: 12 },
  { store_id: 2, sku: "P12-BLK", qty_on_hand: 6, reorder_level: 12 },
  { store_id: 4, sku: "P12-BLK", qty_on_hand: 6, reorder_level: 12 },
  { store_id: 3, sku: "P12-TAN", qty_on_hand: 13, reorder_level: 12 },
  { store_id: 1, sku: "P12-TAN", qty_on_hand: 17, reorder_level: 12 },
  { store_id: 4, sku: "P13-GRY", qty_on_hand: 20, reorder_level: 12 },
  { store_id: 2, sku: "P13-GRY", qty_on_hand: 28, reorder_level: 12 },
  { store_id: 1, sku: "P13-NVY", qty_on_hand: 27, reorder_level: 12 },
  { store_id: 3, sku: "P13-NVY", qty_on_hand: 39, reorder_level: 12 },
  { store_id: 2, sku: "P14-NAT", qty_on_hand: 34, reorder_level: 12 },
  { store_id: 4, sku: "P14-NAT", qty_on_hand: 5, reorder_level: 12 },
  { store_id: 3, sku: "P14-BLK", qty_on_hand: 41, reorder_level: 12 },
  { store_id: 1, sku: "P14-BLK", qty_on_hand: 16, reorder_level: 12 },
  { store_id: 4, sku: "P15-BLK", qty_on_hand: 3, reorder_level: 12 },
  { store_id: 2, sku: "P15-BLK", qty_on_hand: 27, reorder_level: 12 },
  { store_id: 1, sku: "P15-TOR", qty_on_hand: 10, reorder_level: 12 },
  { store_id: 3, sku: "P15-TOR", qty_on_hand: 38, reorder_level: 12 },
  { store_id: 2, sku: "P16-4-5Y", qty_on_hand: 17, reorder_level: 12 },
  { store_id: 4, sku: "P16-4-5Y", qty_on_hand: 4, reorder_level: 12 },
  { store_id: 3, sku: "P16-6-7Y", qty_on_hand: 24, reorder_level: 12 },
  { store_id: 1, sku: "P16-6-7Y", qty_on_hand: 15, reorder_level: 12 },
  { store_id: 4, sku: "P16-8-9Y", qty_on_hand: 31, reorder_level: 12 },
  { store_id: 2, sku: "P16-8-9Y", qty_on_hand: 26, reorder_level: 12 },
  { store_id: 1, sku: "P17-4-5Y", qty_on_hand: 38, reorder_level: 12 },
  { store_id: 3, sku: "P17-4-5Y", qty_on_hand: 37, reorder_level: 12 },
  { store_id: 2, sku: "P17-6-7Y", qty_on_hand: 0, reorder_level: 12 },
  { store_id: 4, sku: "P17-6-7Y", qty_on_hand: 3, reorder_level: 12 },
  { store_id: 3, sku: "P17-8-9Y", qty_on_hand: 7, reorder_level: 12 },
  { store_id: 1, sku: "P17-8-9Y", qty_on_hand: 14, reorder_level: 12 },
  { store_id: 5, sku: "P1-S", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P1-M", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P1-L", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P2-S", qty_on_hand: 4, reorder_level: 8 },
  { store_id: 5, sku: "P2-M", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P2-L", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P3-30", qty_on_hand: 9, reorder_level: 8 },
  { store_id: 5, sku: "P3-32", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P3-34", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P4-30", qty_on_hand: 5, reorder_level: 8 },
  { store_id: 5, sku: "P4-32", qty_on_hand: 5, reorder_level: 8 },
  { store_id: 5, sku: "P4-34", qty_on_hand: 5, reorder_level: 8 },
  { store_id: 5, sku: "P5-S", qty_on_hand: 2, reorder_level: 8 },
  { store_id: 5, sku: "P5-M", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P5-L", qty_on_hand: 4, reorder_level: 8 },
  { store_id: 5, sku: "P6-S", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P6-M", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P6-L", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P7-S", qty_on_hand: 4, reorder_level: 8 },
  { store_id: 5, sku: "P7-M", qty_on_hand: 7, reorder_level: 8 },
  { store_id: 5, sku: "P7-L", qty_on_hand: 5, reorder_level: 8 },
  { store_id: 5, sku: "P8-S", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P8-M", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P8-L", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P9-7", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P9-8", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P9-9", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P10-7", qty_on_hand: 0, reorder_level: 8 },
  { store_id: 5, sku: "P10-8", qty_on_hand: 0, reorder_level: 8 },
  { store_id: 5, sku: "P10-9", qty_on_hand: 0, reorder_level: 8 },
  { store_id: 5, sku: "P11-7", qty_on_hand: 15, reorder_level: 8 },
  { store_id: 5, sku: "P11-8", qty_on_hand: 17, reorder_level: 8 },
  { store_id: 5, sku: "P11-9", qty_on_hand: 18, reorder_level: 8 },
  { store_id: 5, sku: "P12-BLK", qty_on_hand: 9, reorder_level: 8 },
  { store_id: 5, sku: "P12-TAN", qty_on_hand: 7, reorder_level: 8 },
  { store_id: 5, sku: "P13-GRY", qty_on_hand: 0, reorder_level: 8 },
  { store_id: 5, sku: "P13-NVY", qty_on_hand: 5, reorder_level: 8 },
  { store_id: 5, sku: "P14-NAT", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P14-BLK", qty_on_hand: 6, reorder_level: 8 },
  { store_id: 5, sku: "P15-BLK", qty_on_hand: 3, reorder_level: 8 },
  { store_id: 5, sku: "P15-TOR", qty_on_hand: 0, reorder_level: 8 },
  { store_id: 5, sku: "P16-4-5Y", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P16-6-7Y", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P16-8-9Y", qty_on_hand: 10, reorder_level: 8 },
  { store_id: 5, sku: "P17-4-5Y", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P17-6-7Y", qty_on_hand: 8, reorder_level: 8 },
  { store_id: 5, sku: "P17-8-9Y", qty_on_hand: 8, reorder_level: 8 }
]);

// customer (10 documents)
db.customer.insertMany([
  { cust_id: 1, cname: "Aditi Sharma", email: "aditi.sharma@example.com", username: "aditi", password: "threadline123" },
  { cust_id: 2, cname: "Rohan Mehta", email: "rohan.mehta@example.com", username: "rohan", password: "threadline123" },
  { cust_id: 3, cname: "Priya Nair", email: "priya.nair@example.com", username: "priya", password: "threadline123" },
  { cust_id: 4, cname: "Kabir Singh", email: "kabir.singh@example.com", username: "kabir", password: "threadline123" },
  { cust_id: 5, cname: "Ananya Iyer", email: "ananya.iyer@example.com", username: "ananya", password: "threadline123" },
  { cust_id: 6, cname: "Farhan Sheikh", email: "farhan.sheikh@example.com", username: "farhan", password: "threadline123" },
  { cust_id: 7, cname: "Meera Pillai", email: "meera.pillai@example.com", username: "meera", password: "threadline123" },
  { cust_id: 8, cname: "Arjun Rao", email: "arjun.rao@example.com", username: "arjun", password: "threadline123" },
  { cust_id: 9, cname: "Divya Krishnan", email: "divya.krishnan@example.com", username: "divya", password: "threadline123" },
  { cust_id: 10, cname: "Vikram Malhotra", email: "vikram.malhotra@example.com", username: "vikram", password: "threadline123" }
]);

// customer_phone (10 documents)
db.customer_phone.insertMany([
  { cust_id: 1, phone: "9800000000" },
  { cust_id: 2, phone: "9800011111" },
  { cust_id: 3, phone: "9800022222" },
  { cust_id: 4, phone: "9800033333" },
  { cust_id: 5, phone: "9800044444" },
  { cust_id: 6, phone: "9800055555" },
  { cust_id: 7, phone: "9800066666" },
  { cust_id: 8, phone: "9800077777" },
  { cust_id: 9, phone: "9800088888" },
  { cust_id: 10, phone: "9800099999" }
]);

// payment (15 documents)
db.payment.insertMany([
  { pay_id: 1, mode: "UPI", amount: 10895, pay_date: ISODate("2026-07-06") },
  { pay_id: 2, mode: "NetBanking", amount: 11294, pay_date: ISODate("2026-08-11") },
  { pay_id: 3, mode: "COD", amount: 2999, pay_date: ISODate("2026-06-16") },
  { pay_id: 4, mode: "Card", amount: 7895, pay_date: ISODate("2026-07-21") },
  { pay_id: 5, mode: "UPI", amount: 11794, pay_date: ISODate("2026-08-26") },
  { pay_id: 6, mode: "NetBanking", amount: 1999, pay_date: ISODate("2026-06-04") },
  { pay_id: 7, mode: "COD", amount: 11995, pay_date: ISODate("2026-07-09") },
  { pay_id: 8, mode: "Card", amount: 14794, pay_date: ISODate("2026-08-14") },
  { pay_id: 9, mode: "UPI", amount: 999, pay_date: ISODate("2026-06-19") },
  { pay_id: 10, mode: "NetBanking", amount: 9895, pay_date: ISODate("2026-07-24") },
  { pay_id: 11, mode: "COD", amount: 12794, pay_date: ISODate("2026-08-02") },
  { pay_id: 12, mode: "Card", amount: 2299, pay_date: ISODate("2026-06-07") },
  { pay_id: 13, mode: "UPI", amount: 10695, pay_date: ISODate("2026-07-12") },
  { pay_id: 14, mode: "NetBanking", amount: 17694, pay_date: ISODate("2026-08-17") },
  { pay_id: 15, mode: "COD", amount: 1899, pay_date: ISODate("2026-06-22") }
]);

// orders (15 documents)
db.orders.insertMany([
  { order_id: 1, order_date: ISODate("2026-07-06"), status: "Delivered", cust_id: 4, pay_id: 1 },
  { order_id: 2, order_date: ISODate("2026-08-11"), status: "Delivered", cust_id: 7, pay_id: 2 },
  { order_id: 3, order_date: ISODate("2026-06-16"), status: "Shipped", cust_id: 10, pay_id: 3 },
  { order_id: 4, order_date: ISODate("2026-07-21"), status: "Delivered", cust_id: 3, pay_id: 4 },
  { order_id: 5, order_date: ISODate("2026-08-26"), status: "Placed", cust_id: 6, pay_id: 5 },
  { order_id: 6, order_date: ISODate("2026-06-04"), status: "Delivered", cust_id: 9, pay_id: 6 },
  { order_id: 7, order_date: ISODate("2026-07-09"), status: "Cancelled", cust_id: 2, pay_id: 7 },
  { order_id: 8, order_date: ISODate("2026-08-14"), status: "Shipped", cust_id: 5, pay_id: 8 },
  { order_id: 9, order_date: ISODate("2026-06-19"), status: "Delivered", cust_id: 8, pay_id: 9 },
  { order_id: 10, order_date: ISODate("2026-07-24"), status: "Placed", cust_id: 1, pay_id: 10 },
  { order_id: 11, order_date: ISODate("2026-08-02"), status: "Delivered", cust_id: 4, pay_id: 11 },
  { order_id: 12, order_date: ISODate("2026-06-07"), status: "Shipped", cust_id: 7, pay_id: 12 },
  { order_id: 13, order_date: ISODate("2026-07-12"), status: "Delivered", cust_id: 10, pay_id: 13 },
  { order_id: 14, order_date: ISODate("2026-08-17"), status: "Placed", cust_id: 3, pay_id: 14 },
  { order_id: 15, order_date: ISODate("2026-06-22"), status: "Delivered", cust_id: 6, pay_id: 15 }
]);

// contains (30 documents)
db.contains.insertMany([
  { order_id: 1, sku: "P2-M", qty: 2, unit_price: 1699 },
  { order_id: 1, sku: "P4-34", qty: 3, unit_price: 2499 },
  { order_id: 2, sku: "P3-34", qty: 3, unit_price: 2299 },
  { order_id: 2, sku: "P6-S", qty: 1, unit_price: 2599 },
  { order_id: 2, sku: "P8-M", qty: 2, unit_price: 899 },
  { order_id: 3, sku: "P5-S", qty: 1, unit_price: 2999 },
  { order_id: 4, sku: "P6-M", qty: 2, unit_price: 2599 },
  { order_id: 4, sku: "P8-L", qty: 3, unit_price: 899 },
  { order_id: 5, sku: "P7-L", qty: 3, unit_price: 1899 },
  { order_id: 5, sku: "P10-7", qty: 1, unit_price: 4499 },
  { order_id: 5, sku: "P12-TAN", qty: 2, unit_price: 799 },
  { order_id: 6, sku: "P9-7", qty: 1, unit_price: 1999 },
  { order_id: 7, sku: "P10-8", qty: 2, unit_price: 4499 },
  { order_id: 7, sku: "P13-GRY", qty: 3, unit_price: 999 },
  { order_id: 8, sku: "P11-9", qty: 3, unit_price: 3299 },
  { order_id: 8, sku: "P15-BLK", qty: 1, unit_price: 1499 },
  { order_id: 8, sku: "P2-L", qty: 2, unit_price: 1699 },
  { order_id: 9, sku: "P13-NVY", qty: 1, unit_price: 999 },
  { order_id: 10, sku: "P15-TOR", qty: 2, unit_price: 1499 },
  { order_id: 10, sku: "P3-30", qty: 3, unit_price: 2299 },
  { order_id: 11, sku: "P2-S", qty: 3, unit_price: 1699 },
  { order_id: 11, sku: "P4-32", qty: 1, unit_price: 2499 },
  { order_id: 11, sku: "P6-L", qty: 2, unit_price: 2599 },
  { order_id: 12, sku: "P3-32", qty: 1, unit_price: 2299 },
  { order_id: 13, sku: "P4-34", qty: 2, unit_price: 2499 },
  { order_id: 13, sku: "P7-S", qty: 3, unit_price: 1899 },
  { order_id: 14, sku: "P6-S", qty: 3, unit_price: 2599 },
  { order_id: 14, sku: "P8-M", qty: 1, unit_price: 899 },
  { order_id: 14, sku: "P10-9", qty: 2, unit_price: 4499 },
  { order_id: 15, sku: "P7-M", qty: 1, unit_price: 1899 }
]);

// shipment (11 documents)
db.shipment.insertMany([
  { ship_id: 1, carrier: "Delhivery", tracking_no: "TRK100037", order_id: 1 },
  { ship_id: 2, carrier: "Ekart", tracking_no: "TRK100074", order_id: 2 },
  { ship_id: 3, carrier: "DTDC", tracking_no: "TRK100111", order_id: 3 },
  { ship_id: 4, carrier: "BlueDart", tracking_no: "TRK100148", order_id: 4 },
  { ship_id: 5, carrier: "Delhivery", tracking_no: "TRK100185", order_id: 6 },
  { ship_id: 6, carrier: "Ekart", tracking_no: "TRK100222", order_id: 8 },
  { ship_id: 7, carrier: "DTDC", tracking_no: "TRK100259", order_id: 9 },
  { ship_id: 8, carrier: "BlueDart", tracking_no: "TRK100296", order_id: 11 },
  { ship_id: 9, carrier: "Delhivery", tracking_no: "TRK100333", order_id: 12 },
  { ship_id: 10, carrier: "Ekart", tracking_no: "TRK100370", order_id: 13 },
  { ship_id: 11, carrier: "DTDC", tracking_no: "TRK100407", order_id: 15 }
]);

// AUTO_INCREMENT → counters: one document per table holding the last id used.
// New ids come from nextId() in 04_purchase.js (and the backend), which does
// an atomic $inc on these documents.
const autoIncrement = {
  category: "category_id",
  brand: "brand_id",
  supplier: "supplier_id",
  product: "product_id",
  stores: "store_id",
  customer: "cust_id",
  payment: "pay_id",
  orders: "order_id",
  shipment: "ship_id"
};
for (const [coll, field] of Object.entries(autoIncrement)) {
  const top = db.getCollection(coll).find().sort({ [field]: -1 }).limit(1).toArray()[0];
  db.counters.updateOne({ _id: coll }, { $set: { seq: top ? top[field] : 0 } }, { upsert: true });
}

// Row counts, like SELECT COUNT(*) on every table
const counts = {};
["category", "brand", "supplier", "product", "supplies", "variant", "stores", "stocks", "customer", "customer_phone", "payment", "orders", "contains", "shipment", "order_totals"]
  .forEach(c => { counts[c] = db.getCollection(c).countDocuments(); });
console.table(counts);
print("Seed loaded. Next: 03_queries.js");
