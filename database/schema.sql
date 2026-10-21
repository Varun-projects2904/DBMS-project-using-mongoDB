-- Threadline — Fashion Retail Inventory, Orders & Shop
-- MySQL 8.x schema (matches the in-browser demo)
CREATE DATABASE IF NOT EXISTS fashion_retail;
USE fashion_retail;

CREATE TABLE category (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  cat_name VARCHAR(60) NOT NULL,
  gender VARCHAR(10),
  parent_category_id INT,
  FOREIGN KEY (parent_category_id) REFERENCES category(category_id)
) ENGINE=InnoDB;

CREATE TABLE brand (
  brand_id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE supplier (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  sname VARCHAR(80) NOT NULL,
  city VARCHAR(60)
) ENGINE=InnoDB;

CREATE TABLE product (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  pname VARCHAR(100) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  category_id INT,
  brand_id INT,
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  FOREIGN KEY (brand_id) REFERENCES brand(brand_id)
) ENGINE=InnoDB;

CREATE TABLE supplies (
  supplier_id INT,
  product_id INT,
  cost_price DECIMAL(10,2),
  lead_time INT,
  PRIMARY KEY (supplier_id, product_id),
  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id)
) ENGINE=InnoDB;

CREATE TABLE variant (
  sku VARCHAR(20) PRIMARY KEY,
  size VARCHAR(10),
  colour VARCHAR(20),
  product_id INT,
  FOREIGN KEY (product_id) REFERENCES product(product_id)
) ENGINE=InnoDB;

CREATE TABLE stores (
  store_id INT AUTO_INCREMENT PRIMARY KEY,
  store_name VARCHAR(80) NOT NULL,
  store_type VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE stocks (
  store_id INT,
  sku VARCHAR(20),
  qty_on_hand INT DEFAULT 0,
  reorder_level INT DEFAULT 0,
  PRIMARY KEY (store_id, sku),
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  FOREIGN KEY (sku) REFERENCES variant(sku)
) ENGINE=InnoDB;

CREATE TABLE customer (
  cust_id INT AUTO_INCREMENT PRIMARY KEY,
  cname VARCHAR(80) NOT NULL,
  email VARCHAR(100) UNIQUE,
  username VARCHAR(40) UNIQUE,
  password VARCHAR(255) -- sized for a bcrypt hash; demo data ships plaintext until first login
) ENGINE=InnoDB;

CREATE TABLE customer_phone (
  cust_id INT,
  phone VARCHAR(20),
  PRIMARY KEY (cust_id, phone),
  FOREIGN KEY (cust_id) REFERENCES customer(cust_id)
) ENGINE=InnoDB;

CREATE TABLE payment (
  pay_id INT AUTO_INCREMENT PRIMARY KEY,
  mode VARCHAR(20),
  amount DECIMAL(10,2),
  pay_date DATE
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  order_date DATE,
  status VARCHAR(20),
  cust_id INT,
  pay_id INT,
  FOREIGN KEY (cust_id) REFERENCES customer(cust_id),
  FOREIGN KEY (pay_id) REFERENCES payment(pay_id)
) ENGINE=InnoDB;

CREATE TABLE contains (
  order_id INT,
  sku VARCHAR(20),
  qty INT,
  unit_price DECIMAL(10,2),
  PRIMARY KEY (order_id, sku),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (sku) REFERENCES variant(sku)
) ENGINE=InnoDB;

CREATE TABLE shipment (
  ship_id INT AUTO_INCREMENT PRIMARY KEY,
  carrier VARCHAR(40),
  tracking_no VARCHAR(40),
  order_id INT,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB;

CREATE VIEW order_totals AS
SELECT o.order_id, SUM(c.qty * c.unit_price) AS total_amount
FROM orders o JOIN contains c ON o.order_id = c.order_id
GROUP BY o.order_id;

-- Run seed.sql next to load the demo catalog, stock, and customer accounts.
