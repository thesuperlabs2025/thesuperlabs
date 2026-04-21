-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: garments
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounthead`
--

DROP TABLE IF EXISTS `accounthead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounthead` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accounthead` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounthead`
--

LOCK TABLES `accounthead` WRITE;
/*!40000 ALTER TABLE `accounthead` DISABLE KEYS */;
INSERT INTO `accounthead` VALUES (1,'sales'),(2,'de');
/*!40000 ALTER TABLE `accounthead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_years`
--

DROP TABLE IF EXISTS `accounting_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_years` (
  `year_id` int NOT NULL AUTO_INCREMENT,
  `year_name` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `is_closed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`year_id`),
  UNIQUE KEY `year_name` (`year_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_years`
--

LOCK TABLES `accounting_years` WRITE;
/*!40000 ALTER TABLE `accounting_years` DISABLE KEYS */;
INSERT INTO `accounting_years` VALUES (1,'2024-25','2024-04-01','2025-03-31',0,1,'2026-03-13 06:43:44'),(2,'2025-26','2025-04-01','2026-03-31',1,0,'2026-03-13 11:55:01');
/*!40000 ALTER TABLE `accounting_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `row_id` int DEFAULT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,3,'raja','UPDATE','order_planning',21,NULL,'{\"status\": \"Pending\", \"buyerId\": \"17\", \"buyerPo\": \"\", \"orderNo\": \"11\", \"isBundle\": \"no\", \"priority\": \"Medium\", \"seasonId\": \"1\", \"buyerName\": \"test customer\", \"orderDate\": \"2026-02-23\", \"orderName\": \"TN\", \"orderType\": \"Buyer\", \"styleType\": \"New Style\", \"seasonName\": \"Summer\", \"factoryDate\": \"2026-02-23\", \"deliveryDate\": \"2026-02-23\", \"ownBrandName\": \"\", \"lifecycleType\": \"order wise\", \"orderCategory\": \"Bulk\", \"merchandiserId\": \"1\", \"merchandiserName\": \"rajaaa\"}','2026-03-04 13:16:29'),(2,3,'raja','UPDATE','order_planning',21,NULL,'{\"status\": \"Approved\", \"buyerId\": \"17\", \"buyerPo\": \"\", \"orderNo\": \"11\", \"isBundle\": \"no\", \"priority\": \"Medium\", \"seasonId\": \"1\", \"buyerName\": \"test customer\", \"orderDate\": \"2026-02-22\", \"orderName\": \"TN\", \"orderType\": \"Buyer\", \"styleType\": \"New Style\", \"seasonName\": \"Summer\", \"factoryDate\": \"2026-02-22\", \"deliveryDate\": \"2026-02-22\", \"ownBrandName\": \"\", \"lifecycleType\": \"order wise\", \"orderCategory\": \"Bulk\", \"merchandiserId\": \"1\", \"merchandiserName\": \"rajaaa\"}','2026-03-04 13:16:36'),(3,3,'raja','INSERT','receipts',0,NULL,'[{\"id\": \"\", \"upi_id\": \"\", \"Details\": \"\", \"StaffName\": \"rajaaa\", \"AccountHead\": \"sales\", \"ReferenceNo\": 152, \"customer_id\": 30, \"ReceiptRefNo\": \"121\", \"ModeOfPayment\": \"cash\", \"customer_name\": \"test customer\", \"PaymentAgainst\": \"Invoice\", \"BankAccountName\": \"\", \"TransactionDate\": \"2026-03-04\", \"TransactionAmount\": 10}]','2026-03-04 15:23:37'),(4,NULL,'System','INSERT','invoices',0,NULL,'{\"gst\": \"\", \"igst\": false, \"dc_no\": \"\", \"items\": [{\"qty\": 1, \"sku\": \"hjse\", \"rate\": \"50.00\", \"total\": 51.45, \"disc_val\": 0, \"gst_percent\": \"5.00\", \"disc_percent\": \"2.00\", \"product_name\": \"hj\"}], \"terms\": \"\", \"is_sku\": 1, \"mobile\": \"845121\", \"upi_id\": \"\", \"due_date\": \"2026-03-05\", \"gst_total\": 2.45, \"net_total\": 49, \"round_off\": -0.45, \"agent_name\": \"\", \"invoice_no\": 157, \"staff_name\": \"\", \"tcs_amount\": 0, \"tds_amount\": 0, \"customer_id\": 29, \"grand_total\": 51, \"tcs_percent\": 0, \"tds_percent\": 0, \"template_id\": 10, \"bank_account\": \"\", \"invoice_date\": \"2026-03-04\", \"is_inclusive\": 0, \"payment_type\": \"credit\", \"sales_person\": \"raja\", \"stock_action\": \"none\", \"customer_name\": \"Hjk\", \"job_inward_id\": null, \"discount_total\": 1, \"transport_name\": \"\", \"billing_address\": \"\", \"mode_of_payment\": \"\", \"manual_invoice_no\": \"\", \"place_of_delivery\": \"\"}','2026-03-04 19:33:37'),(5,NULL,'System','INSERT','receipts',39,NULL,'{\"upi_id\": \"\", \"Details\": \"\", \"StaffName\": \"\", \"AccountHead\": \"Sales\", \"ReferenceNo\": \"\", \"ReceiptRefNo\": \"\", \"ModeOfPayment\": \"Cash\", \"customer_name\": \"Test customer \", \"PaymentAgainst\": \"Invoice\", \"BankAccountName\": \"\", \"TransactionDate\": \"2026-03-04\", \"TransactionAmount\": 100}','2026-03-04 20:05:36'),(6,NULL,'System','DELETE','receipts',39,NULL,NULL,'2026-03-04 20:05:45'),(7,NULL,'System','DELETE','receipts',38,NULL,NULL,'2026-03-04 20:05:48'),(8,3,'raja','INSERT','accounting-years',0,NULL,'{\"end_date\": \"2027-03-31\", \"year_name\": \"2026-27\", \"start_date\": \"2026-04-01\"}','2026-03-13 19:53:51');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_name` varchar(255) NOT NULL,
  `agent_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `address` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (9,'GH',5.00,'test address','India','Tamil Nadu','Chennai','465421','2026-02-10 16:34:06','2026-02-10 16:34:06'),(10,'dt',2.00,'ft','India','Tamil Nadu','Chennai','464','2026-02-10 16:44:18','2026-02-10 16:44:18');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bankaccount`
--

DROP TABLE IF EXISTS `bankaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bankaccount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bankaccount` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bankaccount`
--

LOCK TABLES `bankaccount` WRITE;
/*!40000 ALTER TABLE `bankaccount` DISABLE KEYS */;
INSERT INTO `bankaccount` VALUES (1,'canar'),(3,'axis'),(4,'Cash'),(5,'test');
/*!40000 ALTER TABLE `bankaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `body_parts`
--

DROP TABLE IF EXISTS `body_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `body_parts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `part_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `part_name` (`part_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `body_parts`
--

LOCK TABLES `body_parts` WRITE;
/*!40000 ALTER TABLE `body_parts` DISABLE KEYS */;
INSERT INTO `body_parts` VALUES (7,'Front','2026-02-18 13:37:18');
/*!40000 ALTER TABLE `body_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brandname`
--

DROP TABLE IF EXISTS `brandname`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brandname` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brandname` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brandname` (`brandname`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brandname`
--

LOCK TABLES `brandname` WRITE;
/*!40000 ALTER TABLE `brandname` DISABLE KEYS */;
INSERT INTO `brandname` VALUES (2,'adidas'),(6,'all'),(3,'puma');
/*!40000 ALTER TABLE `brandname` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (10,'dd'),(19,'Fabric'),(13,'fg'),(16,'gfs'),(7,'jj'),(18,'rr');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,1,'Chennai'),(2,1,'Coimbatore'),(3,1,'Madurai'),(4,2,'Bangalore'),(5,2,'Mysore'),(6,2,'Mangalore'),(7,3,'Mumbai'),(8,3,'Pune'),(9,3,'Nagpur'),(10,4,'Los Angeles'),(11,4,'San Francisco'),(12,4,'San Diego'),(13,5,'Houston'),(14,5,'Dallas'),(15,5,'Austin'),(16,6,'New York City'),(17,6,'Buffalo'),(18,6,'Rochester'),(19,7,'Camden'),(20,7,'Greenwich'),(21,7,'Hackney'),(22,8,'Didsbury'),(23,8,'Salford'),(24,8,'Cheetham Hill'),(25,9,'Anfield'),(26,9,'Toxteth'),(27,9,'Everton'),(29,11,'test city');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `color`
--

DROP TABLE IF EXISTS `color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `color` (`color`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `color`
--

LOCK TABLES `color` WRITE;
/*!40000 ALTER TABLE `color` DISABLE KEYS */;
INSERT INTO `color` VALUES (3,'black'),(2,'blue'),(6,'red');
/*!40000 ALTER TABLE `color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profile`
--

DROP TABLE IF EXISTS `company_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `logo` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `gst_no` varchar(50) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `pincode` varchar(10) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profile`
--

LOCK TABLES `company_profile` WRITE;
/*!40000 ALTER TABLE `company_profile` DISABLE KEYS */;
INSERT INTO `company_profile` VALUES (1,'1771009351093.jpg','Super Labs ERP','33AA1254265','9500752898','test@gmail.com','test address','654120','null','null','null','null');
/*!40000 ALTER TABLE `company_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor`
--

DROP TABLE IF EXISTS `contractor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `whatsapp_no` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gst_tin` varchar(50) DEFAULT NULL,
  `billing_address` text,
  `billing_city` varchar(100) DEFAULT NULL,
  `billing_state` varchar(100) DEFAULT NULL,
  `billing_zip` varchar(20) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor`
--

LOCK TABLES `contractor` WRITE;
/*!40000 ALTER TABLE `contractor` DISABLE KEYS */;
INSERT INTO `contractor` VALUES (1,'Test','431053153','','','-','','','','','','','','','','2026-02-24 09:18:23');
/*!40000 ALTER TABLE `contractor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor_wages`
--

DROP TABLE IF EXISTS `contractor_wages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor_wages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor_wages`
--

LOCK TABLES `contractor_wages` WRITE;
/*!40000 ALTER TABLE `contractor_wages` DISABLE KEYS */;
INSERT INTO `contractor_wages` VALUES (1,10,'nj','2026-02-25 08:07:56','2026-02-25 08:07:56');
/*!40000 ALTER TABLE `contractor_wages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor_wages_items`
--

DROP TABLE IF EXISTS `contractor_wages_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor_wages_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contractor_wages_id` int DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `contractor` varchar(255) DEFAULT NULL,
  `process` varchar(255) DEFAULT NULL,
  `qty` decimal(10,3) DEFAULT '0.000',
  `rate` decimal(10,2) DEFAULT '0.00',
  `total_rate` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `contractor_wages_id` (`contractor_wages_id`),
  CONSTRAINT `contractor_wages_items_ibfk_1` FOREIGN KEY (`contractor_wages_id`) REFERENCES `contractor_wages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor_wages_items`
--

LOCK TABLES `contractor_wages_items` WRITE;
/*!40000 ALTER TABLE `contractor_wages_items` DISABLE KEYS */;
INSERT INTO `contractor_wages_items` VALUES (1,1,'VG','Green','Test','Stitching',200.000,2.00,400.00),(2,1,'VG','Green','Test','Checking',200.000,3.00,600.00),(3,1,'VG','Green','Test','Ironing',200.000,5.00,1000.00),(4,1,'VG','Green','Test','Packing',200.000,2.40,480.00);
/*!40000 ALTER TABLE `contractor_wages_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'India'),(11,'test country'),(3,'UK'),(2,'USA');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_note`
--

DROP TABLE IF EXISTS `credit_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_note` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `credit_note_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_note`
--

LOCK TABLES `credit_note` WRITE;
/*!40000 ALTER TABLE `credit_note` DISABLE KEYS */;
INSERT INTO `credit_note` VALUES (1,'raja','rajaa','2010-01-25','985412','2010-01-25','Pending',0.00,0.00,10.00,0.00,'2026-01-10 16:47:42',0.00,0,NULL,NULL,1.00,0,2),(2,'rajaa','rajaaa','2026-01-22','4564258','2026-01-22','Pending',12.00,0.00,0.00,617.00,'2026-01-10 17:09:52',0.00,0,'','res',10.00,0,2),(3,'mkd','','2026-01-22','894561','2026-01-28','Pending',1.20,0.00,0.00,196.00,'2026-01-25 14:16:42',0.00,0,'','',2.00,0,2);
/*!40000 ALTER TABLE `credit_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_note_items`
--

DROP TABLE IF EXISTS `credit_note_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_note_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_note_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `credit_note_id` (`credit_note_id`),
  CONSTRAINT `credit_note_items_ibfk_1` FOREIGN KEY (`credit_note_id`) REFERENCES `credit_note` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_note_items`
--

LOCK TABLES `credit_note_items` WRITE;
/*!40000 ALTER TABLE `credit_note_items` DISABLE KEYS */;
INSERT INTO `credit_note_items` VALUES (1,1,'hjse',1.00,10.00,0.00,0.00,0.00,10.00,'2026-01-10 16:48:04','None'),(3,2,'hjse',10.00,60.00,0.00,2.00,5.00,617.40,'2026-01-10 17:10:04','None'),(6,3,'hp',1.00,120.00,0.00,0.00,12.00,134.40,'2026-01-25 14:16:55','None'),(7,3,'hjse',1.00,60.00,0.00,2.00,5.00,60.00,'2026-01-25 14:16:55','None');
/*!40000 ALTER TABLE `credit_note_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `gst_tin` varchar(50) DEFAULT NULL,
  `cin` varchar(45) DEFAULT NULL,
  `pan` varchar(45) DEFAULT NULL,
  `tan` varchar(45) DEFAULT NULL,
  `whatsapp_no` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `igst` varchar(45) DEFAULT NULL,
  `contact_type` varchar(50) DEFAULT NULL,
  `credit_limit` decimal(10,2) DEFAULT NULL,
  `credit_days` int DEFAULT NULL,
  `agent_name` varchar(255) DEFAULT NULL,
  `agent_percentage` decimal(5,2) DEFAULT NULL,
  `tds` decimal(5,2) DEFAULT NULL,
  `tcs` varchar(45) DEFAULT NULL,
  `price_list` varchar(255) DEFAULT NULL,
  `receivable_opening_balance` decimal(10,2) DEFAULT NULL,
  `payable_opening_balance` decimal(10,2) DEFAULT NULL,
  `bank_name` varchar(45) DEFAULT NULL,
  `branch` varchar(45) DEFAULT NULL,
  `account_number` varchar(45) DEFAULT NULL,
  `ifsc_code` varchar(45) DEFAULT NULL,
  `upi_name` varchar(45) DEFAULT NULL,
  `upi_id` varchar(45) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `billing_country` varchar(100) DEFAULT NULL,
  `billing_state` varchar(100) DEFAULT NULL,
  `billing_city` varchar(100) DEFAULT NULL,
  `billing_zip` varchar(20) DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT NULL,
  `shipping_state` varchar(100) DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `outstanding` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (7,'mkd','mkd','894561',NULL,NULL,NULL,NULL,'','',0.00,NULL,'',0.00,0,'',0.00,0.00,NULL,'',100.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','','','','','','','','','','2025-10-19 15:43:16',0.00),(12,'bn','bn','89456123',NULL,NULL,NULL,NULL,'','',0.00,NULL,'',0.00,0,'',0.00,0.00,NULL,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','','','','','','','','','','2025-11-12 16:17:52',0.00),(14,'raaaa','raaaa','9645123',NULL,NULL,NULL,NULL,'','',0.00,NULL,'',0.00,0,'',0.00,0.00,NULL,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','','','','','','','','','','2025-11-24 15:26:31',0.00),(16,'tets','tets','84561',NULL,NULL,NULL,NULL,'84231','',0.00,NULL,'',0.00,0,'',0.00,0.00,NULL,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'tees','test country','test state','test city','89451','tees','test country','test state','test city','89451','2026-01-15 17:43:54',0.00),(17,'test customer','test customer','94561235',NULL,NULL,NULL,NULL,'','',0.00,NULL,'',0.00,0,'',0.00,0.00,NULL,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'test','India','Tamil Nadu','Chennai','98451','test','India','Tamil Nadu','Chennai','98451','2026-01-16 07:11:37',0.00),(18,'kia','kia','98456125','33AA485285KL',NULL,NULL,NULL,'','',0.00,NULL,'customer',0.00,0,'',0.00,0.00,NULL,'',10.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','','','','','','','','','','2026-01-29 17:14:52',0.00),(22,'JK','JK','46541231','33AAHKJNKN','520','945641','564321','86453','',0.00,NULL,'customer',0.00,0,'',0.00,5.00,NULL,'',0.00,0.00,'Canara Bank','Tup','879843','845321',NULL,NULL,'','','','','','','','','','','2026-02-02 15:57:28',0.00),(23,'tg','tg','98453','','','','','','',0.00,NULL,'',0.00,0,'',0.00,0.00,'2','',0.00,0.00,'','','','','','','','','','','','','','','','','2026-02-04 16:09:59',0.00),(25,'tgr','tgr','4651561','','','','','','',0.00,'yes','',0.00,0,'',0.00,0.00,'','',0.00,0.00,'','','','','','','','','','','','','','','','','2026-02-04 18:08:01',0.00),(26,'agent','agent','4412153','','','','','','',0.00,'','',0.00,0,'dt',0.00,0.00,'','',0.00,0.00,'','','','','','','','','','','','','','','','','2026-02-10 17:02:38',0.00),(27,'excel ','excel','98789512',NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0.00,0,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-10 18:48:24',0.00),(28,'hey','hey','98789512',NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0.00,0,NULL,0.00,0.00,NULL,'test',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-10 19:22:03',0.00),(29,'Hjk','Hjk','845121','','','','','','',0.00,'','',0.00,0,'',0.00,0.00,'0','',0.00,0.00,'','','','','','','','','','','','','','','','','2026-02-16 17:13:17',0.00),(30,'test customer','test customer','9788452122','','','','','','',0.00,'','',0.00,0,'',0.00,0.00,'','',0.00,0.00,'','','','','','','','','','','','','','','','','2026-02-27 18:55:27',0.00);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dc`
--

DROP TABLE IF EXISTS `dc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `dc_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dc`
--

LOCK TABLES `dc` WRITE;
/*!40000 ALTER TABLE `dc` DISABLE KEYS */;
INSERT INTO `dc` VALUES (1,'mkd','rajaaa','2026-01-07','894561','2026-01-16','Pending',1.20,0.00,0.00,62.00,'2026-01-07 18:40:44',0.00,0,'','',1.00,0,2),(2,'rajaa','','2026-01-07','4564258','2026-01-09','Pending',1.20,0.00,0.00,62.00,'2026-01-08 16:47:42',0.00,0,'','res',1.00,0,2);
/*!40000 ALTER TABLE `dc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dc_items`
--

DROP TABLE IF EXISTS `dc_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dc_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dc_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `dc_id` (`dc_id`),
  CONSTRAINT `dc_items_ibfk_1` FOREIGN KEY (`dc_id`) REFERENCES `dc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dc_items`
--

LOCK TABLES `dc_items` WRITE;
/*!40000 ALTER TABLE `dc_items` DISABLE KEYS */;
INSERT INTO `dc_items` VALUES (3,1,'hjse',1.00,60.00,0.00,2.00,5.00,61.74,'2026-01-08 15:26:54','None'),(5,2,'hjse',1.00,60.00,0.00,2.00,5.00,61.74,'2026-01-08 16:47:54','None');
/*!40000 ALTER TABLE `dc_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debit_note`
--

DROP TABLE IF EXISTS `debit_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debit_note` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `debit_note_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debit_note`
--

LOCK TABLES `debit_note` WRITE;
/*!40000 ALTER TABLE `debit_note` DISABLE KEYS */;
INSERT INTO `debit_note` VALUES (1,'rajaa','','2026-01-16','4564258','2026-01-16','Pending',12.00,0.00,0.00,617.00,'2026-01-10 17:47:41',0.00,0,'','res',10.00,0,2),(3,'fvc','rajaaa','2026-01-24','8432156','2026-01-26','Pending',9.60,0.00,0.00,1704.00,'2026-01-25 15:47:36',0.00,0,'','',17.00,0,2);
/*!40000 ALTER TABLE `debit_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debit_note_items`
--

DROP TABLE IF EXISTS `debit_note_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debit_note_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `debit_note_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `debit_note_id` (`debit_note_id`),
  CONSTRAINT `debit_note_items_ibfk_1` FOREIGN KEY (`debit_note_id`) REFERENCES `debit_note` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debit_note_items`
--

LOCK TABLES `debit_note_items` WRITE;
/*!40000 ALTER TABLE `debit_note_items` DISABLE KEYS */;
INSERT INTO `debit_note_items` VALUES (2,1,'hjse',10.00,60.00,0.00,2.00,5.00,617.40,'2026-01-10 17:47:49','None'),(7,3,'hp',9.00,120.00,0.00,0.00,12.00,1209.60,'2026-01-25 15:47:46','None'),(8,3,'hjse',8.00,60.00,0.00,2.00,5.00,493.92,'2026-01-25 15:47:46','None');
/*!40000 ALTER TABLE `debit_note_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dia_master`
--

DROP TABLE IF EXISTS `dia_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dia_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `size_chart_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dia_master`
--

LOCK TABLES `dia_master` WRITE;
/*!40000 ALTER TABLE `dia_master` DISABLE KEYS */;
INSERT INTO `dia_master` VALUES (2,'22-26','2026-02-18 22:02:38',1);
/*!40000 ALTER TABLE `dia_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dia_master_values`
--

DROP TABLE IF EXISTS `dia_master_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dia_master_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_id` int NOT NULL,
  `size` varchar(50) NOT NULL,
  `dia_value` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dia_id` (`dia_id`),
  CONSTRAINT `dia_master_values_ibfk_1` FOREIGN KEY (`dia_id`) REFERENCES `dia_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dia_master_values`
--

LOCK TABLES `dia_master_values` WRITE;
/*!40000 ALTER TABLE `dia_master_values` DISABLE KEYS */;
INSERT INTO `dia_master_values` VALUES (4,2,'S','22'),(5,2,'M','24'),(6,2,'L','26');
/*!40000 ALTER TABLE `dia_master_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_inward`
--

DROP TABLE IF EXISTS `direct_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(50) NOT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inward_no` (`inward_no`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_inward`
--

LOCK TABLES `direct_inward` WRITE;
/*!40000 ALTER TABLE `direct_inward` DISABLE KEYS */;
INSERT INTO `direct_inward` VALUES (1,'DI-0001',NULL,'fvc','2026-03-02','','','2026-03-02 17:20:29');
/*!40000 ALTER TABLE `direct_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_inward_items`
--

DROP TABLE IF EXISTS `direct_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `direct_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `direct_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_inward_items`
--

LOCK TABLES `direct_inward_items` WRITE;
/*!40000 ALTER TABLE `direct_inward_items` DISABLE KEYS */;
INSERT INTO `direct_inward_items` VALUES (1,1,'bn','kl',1.00);
/*!40000 ALTER TABLE `direct_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `aadhar_no` varchar(20) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'rajaaa','985451254','raja@superlabs.in','hsjkhdjh','531254',NULL,'2025-10-29 16:29:51'),(5,'ra','84532123','','','',NULL,'2025-10-30 16:37:32');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estimate`
--

DROP TABLE IF EXISTS `estimate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estimate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `estimate_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estimate`
--

LOCK TABLES `estimate` WRITE;
/*!40000 ALTER TABLE `estimate` DISABLE KEYS */;
INSERT INTO `estimate` VALUES (1,'rajaa','rajaaa','2026-01-17','4564258','2026-01-16','Pending',120.00,0.00,0.00,6174.00,'2026-01-09 16:58:49',0.00,0,'','res',100.00,0,2);
/*!40000 ALTER TABLE `estimate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estimate_items`
--

DROP TABLE IF EXISTS `estimate_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estimate_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estimate_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `estimate_id` (`estimate_id`),
  CONSTRAINT `estimate_items_ibfk_1` FOREIGN KEY (`estimate_id`) REFERENCES `estimate` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estimate_items`
--

LOCK TABLES `estimate_items` WRITE;
/*!40000 ALTER TABLE `estimate_items` DISABLE KEYS */;
INSERT INTO `estimate_items` VALUES (4,1,'hjse',100.00,60.00,0.00,2.00,5.00,6174.00,'2026-01-09 17:02:39','None');
/*!40000 ALTER TABLE `estimate_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_direct_inward`
--

DROP TABLE IF EXISTS `fabric_direct_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_direct_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(50) NOT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inward_no` (`inward_no`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_direct_inward`
--

LOCK TABLES `fabric_direct_inward` WRITE;
/*!40000 ALTER TABLE `fabric_direct_inward` DISABLE KEYS */;
INSERT INTO `fabric_direct_inward` VALUES (1,'FI-0001','','fvc','2026-03-02','rajaaa','','2026-03-02 17:56:08');
/*!40000 ALTER TABLE `fabric_direct_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_direct_inward_items`
--

DROP TABLE IF EXISTS `fabric_direct_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_direct_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `fabric_direct_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `fabric_direct_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_direct_inward_items`
--

LOCK TABLES `fabric_direct_inward_items` WRITE;
/*!40000 ALTER TABLE `fabric_direct_inward_items` DISABLE KEYS */;
INSERT INTO `fabric_direct_inward_items` VALUES (1,1,'20s-single-jersey-200-24-red','Single Jersey',20.00);
/*!40000 ALTER TABLE `fabric_direct_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_grn`
--

DROP TABLE IF EXISTS `fabric_grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `grn_date` datetime DEFAULT NULL,
  `dc_no` varchar(100) DEFAULT NULL,
  `dc_date` datetime DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `po_no` varchar(100) DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_no` (`grn_no`),
  KEY `fk_fabric_grn_year` (`year_id`),
  CONSTRAINT `fk_fabric_grn_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_grn`
--

LOCK TABLES `fabric_grn` WRITE;
/*!40000 ALTER TABLE `fabric_grn` DISABLE KEYS */;
/*!40000 ALTER TABLE `fabric_grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_grn_items`
--

DROP TABLE IF EXISTS `fabric_grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_id` int DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `fabric_sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `rolls` int DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grn_id` (`grn_id`),
  CONSTRAINT `fabric_grn_items_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `fabric_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_grn_items`
--

LOCK TABLES `fabric_grn_items` WRITE;
/*!40000 ALTER TABLE `fabric_grn_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `fabric_grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_planning`
--

DROP TABLE IF EXISTS `fabric_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wastage_pct` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `fabric_planning_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_planning`
--

LOCK TABLES `fabric_planning` WRITE;
/*!40000 ALTER TABLE `fabric_planning` DISABLE KEYS */;
INSERT INTO `fabric_planning` VALUES (1,NULL,'2026-02-20 13:34:29','2026-02-20 13:34:29',0.00),(17,2,'2026-02-22 09:40:09','2026-02-22 09:40:09',0.00),(19,5,'2026-02-23 19:35:22','2026-02-23 19:35:22',0.00),(20,10,'2026-02-24 15:16:37','2026-02-24 15:16:37',0.00),(21,21,'2026-02-27 13:16:55','2026-02-27 13:16:55',0.00);
/*!40000 ALTER TABLE `fabric_planning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_planning_items`
--

DROP TABLE IF EXISTS `fabric_planning_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_planning_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fabric_planning_id` int DEFAULT NULL,
  `style_part` varchar(50) DEFAULT NULL,
  `body_part` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `composition` varchar(255) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `consumption_data` json DEFAULT NULL,
  `avg_wt` decimal(10,3) DEFAULT '0.000',
  `total_req` decimal(12,3) DEFAULT '0.000',
  `wastage_pct` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fabric_type` enum('Yarn','Ready Fabric') DEFAULT 'Yarn',
  PRIMARY KEY (`id`),
  KEY `fabric_planning_id` (`fabric_planning_id`),
  CONSTRAINT `fabric_planning_items_ibfk_1` FOREIGN KEY (`fabric_planning_id`) REFERENCES `fabric_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_planning_items`
--

LOCK TABLES `fabric_planning_items` WRITE;
/*!40000 ALTER TABLE `fabric_planning_items` DISABLE KEYS */;
INSERT INTO `fabric_planning_items` VALUES (1,1,'Top','Test','Test','200','24','Red','100%Cotton','20S','{}',0.000,0.000,0.00,'2026-02-20 13:34:29','Yarn'),(73,17,'Top','Top','Fleece','120','20','blue','100%cotton','20S','{\"L\": \"0.1500\", \"M\": \"0.1500\", \"S\": \"0.1500\", \"XL\": \"0.1500\"}',0.150,60.000,0.00,'2026-02-22 09:40:09','Yarn'),(77,19,'Top','Front','Single Jersey','200','24','red','100%cotton','20S','{\"L\": \"0.2400\", \"M\": \"0.2400\", \"S\": \"0.2400\"}',0.240,72.000,0.00,'2026-02-23 19:35:22','Yarn'),(78,20,'Top','Top','S/J','200','12','Green','100%Cotton','20S','{\"L\": \"0.1600\", \"M\": \"0.1600\", \"S\": \"0.1600\", \"XL\": \"0.1600\"}',0.160,96.000,0.00,'2026-02-24 15:16:37','Yarn'),(79,21,'Top','TOP','S/J','200','12','red','100%Cotton','20S','{\"L\": \"0.1200\", \"M\": \"0.1200\", \"S\": \"0.1200\", \"XL\": \"0.1200\"}',0.120,576.000,0.00,'2026-02-27 13:16:55','Yarn');
/*!40000 ALTER TABLE `fabric_planning_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_po`
--

DROP TABLE IF EXISTS `fabric_po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_no` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_igst` tinyint(1) DEFAULT '0',
  `round_off` decimal(10,2) DEFAULT '0.00',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_no` (`po_no`),
  KEY `fk_fabric_po_year` (`year_id`),
  CONSTRAINT `fk_fabric_po_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_po`
--

LOCK TABLES `fabric_po` WRITE;
/*!40000 ALTER TABLE `fabric_po` DISABLE KEYS */;
/*!40000 ALTER TABLE `fabric_po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_po_items`
--

DROP TABLE IF EXISTS `fabric_po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_po_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `fabric_sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `rolls` int DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `gst_per` decimal(10,2) DEFAULT '0.00',
  `total` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `fabric_po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `fabric_po` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_po_items`
--

LOCK TABLES `fabric_po_items` WRITE;
/*!40000 ALTER TABLE `fabric_po_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `fabric_po_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_to_pcs_inward`
--

DROP TABLE IF EXISTS `fabric_to_pcs_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_to_pcs_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(30) NOT NULL,
  `inward_type` enum('order','lot','internal') NOT NULL,
  `inward_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(200) DEFAULT NULL,
  `internal_lot_no` varchar(100) DEFAULT NULL,
  `internal_lot_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `work_type` varchar(20) DEFAULT 'Jobwork',
  `contractor_name` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT 'Fabric to Pcs',
  `size_chart_name` varchar(100) DEFAULT NULL,
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_qty` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_to_pcs_inward`
--

LOCK TABLES `fabric_to_pcs_inward` WRITE;
/*!40000 ALTER TABLE `fabric_to_pcs_inward` DISABLE KEYS */;
INSERT INTO `fabric_to_pcs_inward` VALUES (1,'0001','order','2026-02-23',NULL,'1','45',NULL,NULL,NULL,NULL,'fvc','fvc','Jobwork',NULL,'Dyeing',NULL,NULL,'rajaaa',NULL,61.200,'2026-02-23 03:43:13',2),(2,'0002','order','2026-02-23',NULL,'1','45',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Compacting',NULL,NULL,'rajaaa',NULL,61.200,'2026-02-23 04:18:38',2),(4,'0003','order','2026-02-23',NULL,'1','45',NULL,NULL,NULL,NULL,'fvc','ht','Jobwork',NULL,'Cutting','S-XL',NULL,'rajaaa',NULL,400.000,'2026-02-23 05:01:54',2),(19,'0004','order','2026-02-24',NULL,'3','NM',NULL,NULL,NULL,NULL,'Hello','ht','Jobwork',NULL,'Dyeing','S-L',NULL,'rajaaa',NULL,72.000,'2026-02-24 07:38:06',2),(20,'0005','order','2026-02-24',NULL,'3','NM',NULL,NULL,NULL,NULL,'fvc','fvc','Jobwork',NULL,'Compacting','S-L',NULL,'rajaaa',NULL,72.000,'2026-02-24 07:39:05',2),(21,'0006','order','2026-02-24',NULL,'3','NM',NULL,NULL,NULL,NULL,'ht','ht','Jobwork',NULL,'Cutting','S-L',NULL,'rajaaa',NULL,300.000,'2026-02-24 07:40:48',2),(23,'0007','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Dyeing','S-XL',NULL,'rajaaa',NULL,100.000,'2026-02-24 17:49:13',2),(30,'0008','order','2026-02-23',NULL,'6','nj',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Compacting','S-XL',NULL,NULL,NULL,50.000,'2026-02-24 18:37:25',2),(31,'0009','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Compacting','S-XL',NULL,'rajaaa',NULL,50.000,'2026-02-24 18:37:52',2),(32,'0010','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'fvc','fvc','Jobwork',NULL,'Cutting','S-XL',NULL,NULL,NULL,200.000,'2026-02-24 19:24:05',2);
/*!40000 ALTER TABLE `fabric_to_pcs_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_to_pcs_inward_items`
--

DROP TABLE IF EXISTS `fabric_to_pcs_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_to_pcs_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int NOT NULL,
  `fabric_sku` varchar(100) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `style_name` varchar(200) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `fabric_color` varchar(100) DEFAULT NULL,
  `style_color` varchar(100) DEFAULT NULL,
  `contractor_name` varchar(200) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT '0.000',
  `sizes_data` json DEFAULT NULL,
  `cut_pcs_wt` decimal(12,3) DEFAULT '0.000',
  `waste_pcs_wt` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `fabric_to_pcs_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `fabric_to_pcs_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_to_pcs_inward_items`
--

LOCK TABLES `fabric_to_pcs_inward_items` WRITE;
/*!40000 ALTER TABLE `fabric_to_pcs_inward_items` DISABLE KEYS */;
INSERT INTO `fabric_to_pcs_inward_items` VALUES (1,1,NULL,'20S','Fleece',NULL,'120','20','blue',NULL,NULL,NULL,61.200,NULL,0.000,0.000),(2,2,NULL,'20S','Fleece',NULL,'120','20','blue',NULL,NULL,NULL,61.200,NULL,0.000,0.000),(4,4,NULL,'20S','Fleece','gh','120','20','blue','blue','blue',NULL,400.000,'{\"L\": \"100\", \"M\": \"100\", \"S\": \"100\", \"XL\": \"100\"}',150.000,20.000),(19,19,NULL,'30s','Single Jersey',NULL,'200','24','red','red','red',NULL,72.000,'{}',0.000,0.000),(20,20,NULL,'30s','Single Jersey',NULL,'200','24','red','red','red',NULL,72.000,'{}',0.000,0.000),(21,21,NULL,'30s','Single Jersey',NULL,'200','24','red','red','red',NULL,300.000,'{\"L\": \"100\", \"M\": \"100\", \"S\": \"100\"}',20.000,5.000),(23,23,NULL,'20S','S/J',NULL,'200','12','Green','Green','Green',NULL,100.000,'{}',0.000,0.000),(35,30,NULL,'20S','S/J',NULL,'200','12','Green','Green','Green',NULL,50.000,'{}',0.000,0.000),(36,31,NULL,'20S','S/J',NULL,'200','12','Green','Green','Green',NULL,50.000,'{}',0.000,0.000),(37,32,NULL,'20S','S/J','VG','200','12','Green','Green','Green',NULL,200.000,'{\"L\": \"50\", \"M\": \"50\", \"S\": \"50\", \"XL\": \"50\"}',95.000,5.000);
/*!40000 ALTER TABLE `fabric_to_pcs_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_to_pcs_outward`
--

DROP TABLE IF EXISTS `fabric_to_pcs_outward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_to_pcs_outward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_no` varchar(30) NOT NULL,
  `outward_type` enum('order','lot','internal') NOT NULL,
  `outward_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(200) DEFAULT NULL,
  `internal_lot_no` varchar(100) DEFAULT NULL,
  `internal_lot_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `work_type` varchar(20) DEFAULT 'Jobwork',
  `contractor_name` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT 'Fabric to Pcs',
  `previous_process` varchar(100) DEFAULT NULL,
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_qty` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_to_pcs_outward`
--

LOCK TABLES `fabric_to_pcs_outward` WRITE;
/*!40000 ALTER TABLE `fabric_to_pcs_outward` DISABLE KEYS */;
INSERT INTO `fabric_to_pcs_outward` VALUES (5,'0001','order','2026-02-23',NULL,'1','45',NULL,NULL,NULL,NULL,'fvc','fvc','Jobwork',NULL,'Dyeing','Knitting',NULL,'rajaaa',NULL,61.200,'2026-02-23 03:42:43',2),(6,'0002','order','2026-02-23',NULL,'1','45',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Compacting','Dyeing',NULL,'rajaaa',NULL,61.200,'2026-02-23 04:17:55',2),(7,'0003','order','2026-02-23',NULL,'1','45',NULL,NULL,NULL,NULL,'fvc','ht','Jobwork',NULL,'Cutting','Compacting',NULL,'rajaaa',NULL,61.200,'2026-02-23 04:27:45',2),(14,'0004','order','2026-02-24',NULL,'3','NM',NULL,NULL,NULL,NULL,'Hello','ht','Jobwork',NULL,'Dyeing','Knitting',NULL,'rajaaa',NULL,72.000,'2026-02-24 07:37:45',2),(15,'0005','order','2026-02-24',NULL,'3','NM',NULL,NULL,NULL,NULL,'fvc','fvc','Jobwork',NULL,'Compacting','Dyeing',NULL,'rajaaa',NULL,72.000,'2026-02-24 07:38:49',2),(16,'0006','order','2026-02-23',NULL,'3','NM',NULL,NULL,NULL,NULL,'ht','ht','Jobwork',NULL,'Cutting','Compacting',NULL,'rajaaa',NULL,72.000,'2026-02-24 07:40:12',2),(17,'0007','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Dyeing','Knitting',NULL,'rajaaa',NULL,100.000,'2026-02-24 15:44:03',2),(19,'0008','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'ht','Hello','Jobwork',NULL,'Compacting','Dyeing',NULL,NULL,NULL,100.000,'2026-02-24 17:49:35',2),(23,'0009','order','2026-02-23',NULL,'6','nj',NULL,NULL,NULL,NULL,'fvc','fvc','Jobwork',NULL,'Cutting','Compacting',NULL,'rajaaa',NULL,50.000,'2026-02-24 19:13:56',2),(24,'0010','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'ht','fvc','Jobwork',NULL,'Cutting','Compacting',NULL,'rajaaa',NULL,50.000,'2026-02-24 19:14:28',2);
/*!40000 ALTER TABLE `fabric_to_pcs_outward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_to_pcs_outward_items`
--

DROP TABLE IF EXISTS `fabric_to_pcs_outward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_to_pcs_outward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_id` int NOT NULL,
  `fabric_sku` varchar(100) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `style_name` varchar(200) DEFAULT NULL,
  `style_color` varchar(100) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `contractor_name` varchar(200) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `outward_id` (`outward_id`),
  CONSTRAINT `fabric_to_pcs_outward_items_ibfk_1` FOREIGN KEY (`outward_id`) REFERENCES `fabric_to_pcs_outward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_to_pcs_outward_items`
--

LOCK TABLES `fabric_to_pcs_outward_items` WRITE;
/*!40000 ALTER TABLE `fabric_to_pcs_outward_items` DISABLE KEYS */;
INSERT INTO `fabric_to_pcs_outward_items` VALUES (1,5,NULL,'20S','Fleece',NULL,NULL,'120','20','blue',NULL,61.200),(2,6,NULL,'20S','Fleece',NULL,NULL,'120','20','blue',NULL,61.200),(3,7,NULL,'20S','Fleece','gh',NULL,'120','20','blue',NULL,61.200),(10,14,NULL,'30s','Single Jersey',NULL,NULL,'200','24','red',NULL,72.000),(11,15,NULL,'30s','Single Jersey',NULL,NULL,'200','24','red',NULL,72.000),(13,16,NULL,'30s','Single Jersey','FT',NULL,'200','24','red',NULL,72.000),(14,17,NULL,'20S','S/J',NULL,NULL,'200','12','Green',NULL,100.000),(16,19,NULL,'20S','S/J',NULL,NULL,'200','12','Green',NULL,100.000),(21,24,NULL,'20S','S/J','VG','Green','200','12','Green',NULL,50.000),(22,23,NULL,'20S','S/J','VG','Green','200','12','Green',NULL,50.000);
/*!40000 ALTER TABLE `fabric_to_pcs_outward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_to_pcs_return`
--

DROP TABLE IF EXISTS `fabric_to_pcs_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_to_pcs_return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_no` varchar(30) NOT NULL,
  `return_type` enum('order','lot','internal') NOT NULL,
  `return_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(200) DEFAULT NULL,
  `internal_lot_no` varchar(100) DEFAULT NULL,
  `internal_lot_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `work_type` varchar(20) DEFAULT 'Jobwork',
  `contractor_name` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT 'Fabric to Pcs',
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_qty` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_to_pcs_return`
--

LOCK TABLES `fabric_to_pcs_return` WRITE;
/*!40000 ALTER TABLE `fabric_to_pcs_return` DISABLE KEYS */;
/*!40000 ALTER TABLE `fabric_to_pcs_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabric_to_pcs_return_items`
--

DROP TABLE IF EXISTS `fabric_to_pcs_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabric_to_pcs_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int NOT NULL,
  `fabric_sku` varchar(100) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `style_name` varchar(200) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `contractor_name` varchar(200) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  CONSTRAINT `fabric_to_pcs_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `fabric_to_pcs_return` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabric_to_pcs_return_items`
--

LOCK TABLES `fabric_to_pcs_return_items` WRITE;
/*!40000 ALTER TABLE `fabric_to_pcs_return_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `fabric_to_pcs_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabrics`
--

DROP TABLE IF EXISTS `fabrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fabric_sku` varchar(255) DEFAULT NULL,
  `counts` varchar(255) DEFAULT NULL,
  `dia_chart_id` int DEFAULT NULL,
  `dia_data` json DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `composition` varchar(255) DEFAULT NULL,
  `current_stock` decimal(10,2) DEFAULT '0.00',
  `minimum_stock` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `fabric_sku` (`fabric_sku`),
  KEY `fk_fabrics_year` (`year_id`),
  CONSTRAINT `fk_fabrics_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabrics`
--

LOCK TABLES `fabrics` WRITE;
/*!40000 ALTER TABLE `fabrics` DISABLE KEYS */;
INSERT INTO `fabrics` VALUES (32,'20s-single-jersey-200-24-red','20S',NULL,NULL,'Single Jersey','red','200','24','100%cotton',164.00,0.00,'2026-02-21 18:50:03',1),(33,'20s-fleece-120-20-blue','20S',NULL,NULL,'Fleece','blue','120','20','100%cotton',0.00,0.00,'2026-02-22 09:40:37',1),(34,'20s-s/j-200-12-green','20S',NULL,NULL,'S/J','Green','200','12','100%Cotton',0.00,0.00,'2026-02-24 15:17:50',1),(35,'20s-s/j-200-12-red','20S',NULL,NULL,'S/J','red','200','12','100%Cotton',0.00,0.00,'2026-02-27 13:17:25',1);
/*!40000 ALTER TABLE `fabrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garment_costing`
--

DROP TABLE IF EXISTS `garment_costing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garment_costing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_planning_id` int DEFAULT NULL,
  `buyer_id` int DEFAULT NULL,
  `buyer_name` varchar(255) DEFAULT NULL,
  `style_no` varchar(100) DEFAULT NULL,
  `description` text,
  `order_qty` int DEFAULT NULL,
  `currency` varchar(20) DEFAULT 'INR',
  `target_fob` decimal(15,2) DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `status` enum('Draft','Approved') DEFAULT 'Draft',
  `cm_cost` decimal(15,2) DEFAULT '0.00',
  `overhead_pct` decimal(5,2) DEFAULT '5.00',
  `profit_pct` decimal(5,2) DEFAULT '10.00',
  `total_fabrics_cost` decimal(15,2) DEFAULT '0.00',
  `total_trims_cost` decimal(15,2) DEFAULT '0.00',
  `total_processing_cost` decimal(15,2) DEFAULT '0.00',
  `total_cost` decimal(15,2) DEFAULT '0.00',
  `final_fob` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` varchar(50) DEFAULT 'v1',
  PRIMARY KEY (`id`),
  KEY `order_planning_id` (`order_planning_id`),
  CONSTRAINT `garment_costing_ibfk_1` FOREIGN KEY (`order_planning_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garment_costing`
--

LOCK TABLES `garment_costing` WRITE;
/*!40000 ALTER TABLE `garment_costing` DISABLE KEYS */;
/*!40000 ALTER TABLE `garment_costing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garment_costing_fabrics`
--

DROP TABLE IF EXISTS `garment_costing_fabrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garment_costing_fabrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `costing_id` int DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `cons_kg_pc` decimal(15,4) DEFAULT NULL,
  `excess_pct` decimal(10,2) DEFAULT '0.00',
  `final_cons` decimal(10,4) DEFAULT '0.0000',
  `rate_kg` decimal(15,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `costing_id` (`costing_id`),
  CONSTRAINT `garment_costing_fabrics_ibfk_1` FOREIGN KEY (`costing_id`) REFERENCES `garment_costing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garment_costing_fabrics`
--

LOCK TABLES `garment_costing_fabrics` WRITE;
/*!40000 ALTER TABLE `garment_costing_fabrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `garment_costing_fabrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garment_costing_processes`
--

DROP TABLE IF EXISTS `garment_costing_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garment_costing_processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `costing_id` int DEFAULT NULL,
  `process_name` varchar(255) DEFAULT NULL,
  `basis` varchar(50) DEFAULT NULL,
  `rate` decimal(15,2) DEFAULT NULL,
  `cost_pc` decimal(15,4) DEFAULT NULL,
  `process_type` varchar(20) DEFAULT 'General',
  PRIMARY KEY (`id`),
  KEY `costing_id` (`costing_id`),
  CONSTRAINT `garment_costing_processes_ibfk_1` FOREIGN KEY (`costing_id`) REFERENCES `garment_costing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garment_costing_processes`
--

LOCK TABLES `garment_costing_processes` WRITE;
/*!40000 ALTER TABLE `garment_costing_processes` DISABLE KEYS */;
/*!40000 ALTER TABLE `garment_costing_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garment_costing_trims`
--

DROP TABLE IF EXISTS `garment_costing_trims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garment_costing_trims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `costing_id` int DEFAULT NULL,
  `trim_name` varchar(255) DEFAULT NULL,
  `cost_pc` decimal(15,4) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `uom` varchar(20) DEFAULT 'Pc',
  `qty_pc` decimal(10,4) DEFAULT '0.0000',
  `excess_pct` decimal(10,2) DEFAULT '0.00',
  `final_qty` decimal(10,4) DEFAULT '0.0000',
  PRIMARY KEY (`id`),
  KEY `costing_id` (`costing_id`),
  CONSTRAINT `garment_costing_trims_ibfk_1` FOREIGN KEY (`costing_id`) REFERENCES `garment_costing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garment_costing_trims`
--

LOCK TABLES `garment_costing_trims` WRITE;
/*!40000 ALTER TABLE `garment_costing_trims` DISABLE KEYS */;
/*!40000 ALTER TABLE `garment_costing_trims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garments_grn`
--

DROP TABLE IF EXISTS `garments_grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garments_grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `grn_date` datetime DEFAULT NULL,
  `dc_no` varchar(100) DEFAULT NULL,
  `dc_date` datetime DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `po_no` varchar(100) DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_no` (`grn_no`),
  KEY `fk_garments_grn_year` (`year_id`),
  CONSTRAINT `fk_garments_grn_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garments_grn`
--

LOCK TABLES `garments_grn` WRITE;
/*!40000 ALTER TABLE `garments_grn` DISABLE KEYS */;
/*!40000 ALTER TABLE `garments_grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garments_grn_items`
--

DROP TABLE IF EXISTS `garments_grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garments_grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_id` int DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grn_id` (`grn_id`),
  CONSTRAINT `garments_grn_items_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `garments_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garments_grn_items`
--

LOCK TABLES `garments_grn_items` WRITE;
/*!40000 ALTER TABLE `garments_grn_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `garments_grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garments_po`
--

DROP TABLE IF EXISTS `garments_po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garments_po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_no` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_order_specific` tinyint(1) DEFAULT '1',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `is_igst` tinyint(1) DEFAULT '0',
  `round_off` decimal(10,2) DEFAULT '0.00',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_no` (`po_no`),
  KEY `fk_garments_po_year` (`year_id`),
  CONSTRAINT `fk_garments_po_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garments_po`
--

LOCK TABLES `garments_po` WRITE;
/*!40000 ALTER TABLE `garments_po` DISABLE KEYS */;
/*!40000 ALTER TABLE `garments_po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garments_po_items`
--

DROP TABLE IF EXISTS `garments_po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garments_po_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `gst_per` decimal(10,2) DEFAULT '0.00',
  `total` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `garments_po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `garments_po` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garments_po_items`
--

LOCK TABLES `garments_po_items` WRITE;
/*!40000 ALTER TABLE `garments_po_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `garments_po_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_grn`
--

DROP TABLE IF EXISTS `general_grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `grn_date` datetime DEFAULT NULL,
  `dc_no` varchar(100) DEFAULT NULL,
  `dc_date` datetime DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `grn_type` varchar(50) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `po_no` varchar(100) DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_no` (`grn_no`),
  KEY `fk_general_grn_year` (`year_id`),
  CONSTRAINT `fk_general_grn_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_grn`
--

LOCK TABLES `general_grn` WRITE;
/*!40000 ALTER TABLE `general_grn` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_grn_items`
--

DROP TABLE IF EXISTS `general_grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_id` int DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `per_bag` decimal(12,3) DEFAULT NULL,
  `per_bag_qty` decimal(12,3) DEFAULT NULL,
  `rolls` int DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grn_id` (`grn_id`),
  CONSTRAINT `general_grn_items_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `general_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_grn_items`
--

LOCK TABLES `general_grn_items` WRITE;
/*!40000 ALTER TABLE `general_grn_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_po`
--

DROP TABLE IF EXISTS `general_po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_no` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `po_type` enum('Yarn','Fabric','Trims') NOT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `is_igst` tinyint(1) DEFAULT '0',
  `round_off` decimal(10,2) DEFAULT '0.00',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_no` (`po_no`),
  KEY `fk_general_po_year` (`year_id`),
  CONSTRAINT `fk_general_po_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_po`
--

LOCK TABLES `general_po` WRITE;
/*!40000 ALTER TABLE `general_po` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_po_items`
--

DROP TABLE IF EXISTS `general_po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_po_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `per_bag` varchar(100) DEFAULT NULL,
  `per_bag_qty` decimal(10,2) DEFAULT NULL,
  `rolls` int DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `gst_per` decimal(10,2) DEFAULT '0.00',
  `total` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `general_po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `general_po` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_po_items`
--

LOCK TABLES `general_po_items` WRITE;
/*!40000 ALTER TABLE `general_po_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_po_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grn`
--

DROP TABLE IF EXISTS `grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `grn_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grn`
--

LOCK TABLES `grn` WRITE;
/*!40000 ALTER TABLE `grn` DISABLE KEYS */;
INSERT INTO `grn` VALUES (1,'rajaa','rajaaa','2026-01-16','4564258','2026-01-16','Pending',3.60,0.00,0.00,185.00,'2026-01-08 17:53:38',0.00,0,'','res',3.00,0,2);
/*!40000 ALTER TABLE `grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grn_items`
--

DROP TABLE IF EXISTS `grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `grn_id` (`grn_id`),
  CONSTRAINT `grn_items_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grn_items`
--

LOCK TABLES `grn_items` WRITE;
/*!40000 ALTER TABLE `grn_items` DISABLE KEYS */;
INSERT INTO `grn_items` VALUES (2,1,'hjse',3.00,60.00,0.00,2.00,5.00,185.22,'2026-01-08 17:53:46','None');
/*!40000 ALTER TABLE `grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internal_lots`
--

DROP TABLE IF EXISTS `internal_lots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internal_lots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `internal_lot_no` varchar(50) NOT NULL,
  `internal_lot_name` varchar(255) NOT NULL,
  `status` enum('Pending','Approved','Hold','Completed') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `internal_lot_no` (`internal_lot_no`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internal_lots`
--

LOCK TABLES `internal_lots` WRITE;
/*!40000 ALTER TABLE `internal_lots` DISABLE KEYS */;
INSERT INTO `internal_lots` VALUES (1,'ILOT-001','tt','Approved','2026-02-20 08:09:03','2026-02-20 08:09:10');
/*!40000 ALTER TABLE `internal_lots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (140,102,'hp',1.00,120.00,0.00,0.00,12.00,134.40,'2025-12-21 14:15:49','None'),(141,102,'hjse',1.00,60.00,0.00,2.00,5.00,61.74,'2025-12-21 14:15:49','None'),(143,104,'hjse',1.00,60.00,0.00,2.00,5.00,61.74,'2026-01-11 13:48:33','None'),(147,103,'hp',1.00,120.00,0.00,0.00,12.00,134.40,'2026-01-25 13:57:03','None'),(148,103,'hjse',1.00,60.00,0.00,2.00,5.00,60.00,'2026-01-25 13:57:03','None'),(197,152,'hjse',1.00,100.00,0.00,2.00,5.00,102.90,'2026-02-15 17:25:16','None'),(198,153,'hp',1.00,200.00,0.00,0.00,12.00,224.00,'2026-02-15 17:26:05','None'),(199,154,'S/J',50.00,12.00,0.00,0.00,5.00,600.00,'2026-02-17 11:15:11','None'),(200,155,'S/J',140.00,12.00,0.00,0.00,5.00,1680.00,'2026-02-17 11:21:18','None'),(201,156,'hjse',1.00,50.00,0.00,2.00,5.00,51.45,'2026-03-01 16:59:53','None'),(202,157,'hjse',1.00,50.00,0.00,2.00,5.00,51.45,'2026-03-04 14:03:37','None');
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `agent_name` varchar(255) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `tds` varchar(45) DEFAULT NULL,
  `tds_percent` varchar(45) DEFAULT NULL,
  `tcs` varchar(45) DEFAULT NULL,
  `tcs_percent` varchar(45) DEFAULT NULL,
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT NULL,
  `transport_name` varchar(255) DEFAULT NULL,
  `dc_no` varchar(255) DEFAULT NULL,
  `manual_invoice_no` varchar(255) DEFAULT NULL,
  `place_of_delivery` varchar(255) DEFAULT NULL,
  `terms` text,
  `is_inclusive` tinyint(1) DEFAULT '0',
  `payment_type` varchar(50) DEFAULT NULL,
  `mode_of_payment` varchar(255) DEFAULT NULL,
  `bank_account` varchar(255) DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `job_inward_id` int DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_invoices_year` (`year_id`),
  CONSTRAINT `fk_invoices_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (102,'mkd','rajaaa',NULL,'2025-12-19','894561','2025-12-25','Pending',1.20,0.00,0.00,NULL,NULL,NULL,NULL,196.00,'2025-12-18 16:13:31',0.00,0,'','',2.00,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,2),(103,'mkd','rajaaa',NULL,'2025-12-17','894561','2025-12-24','Pending',1.20,0.00,0.00,NULL,NULL,NULL,NULL,196.00,'2025-12-22 16:26:20',0.00,0,'','',2.00,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,2),(104,'mkd','rajaaa',NULL,'2026-01-16','894561','2026-01-17','Pending',1.20,0.00,0.00,NULL,NULL,NULL,NULL,62.00,'2026-01-11 13:48:33',0.00,0,NULL,'',1.00,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,2),(152,'test customer','',NULL,'2026-02-15','94561235','2026-02-16','Pending',2.00,4.90,98.00,'0','0','0','0',103.00,'2026-02-15 17:25:16',0.00,0,'test customer','test',1.00,'','','','','',0,'credit',NULL,NULL,NULL,NULL,NULL,2),(153,'tg','',NULL,'2026-02-15','98453','2026-02-16','Pending',0.00,24.00,200.00,'0','0','4.48','2',228.00,'2026-02-15 17:26:05',0.00,0,'tg','',1.00,'','','','','',0,'credit',NULL,NULL,NULL,NULL,NULL,2),(154,'tgr','',NULL,'2026-02-17','','2026-02-18','Pending',0.00,30.00,600.00,'0','0','0','0',630.00,'2026-02-17 11:15:11',0.00,0,NULL,'',50.00,'','','','','',0,'credit',NULL,NULL,NULL,NULL,3,2),(155,'tets','',NULL,'2026-02-17','','2026-02-18','Pending',0.00,84.00,1680.00,'0','0','0','0',1764.00,'2026-02-17 11:21:18',0.00,0,NULL,'',140.00,'','','','','',0,'credit',NULL,NULL,NULL,NULL,5,2),(156,'test customer','',NULL,'2026-03-01','9788452122','2026-03-02','Pending',1.00,2.45,49.00,'0','0','0','0',51.00,'2026-03-01 16:59:53',0.00,0,'test customer','',1.00,'','','','','',0,'credit','','','','',NULL,2),(157,'Hjk','raja',NULL,'2026-03-04','845121','2026-03-05','Pending',1.00,2.45,49.00,'0','0','0','0',51.00,'2026-03-04 14:03:37',0.00,0,NULL,'',0.00,'','','','','',0,'credit','','','','',NULL,2);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inward`
--

DROP TABLE IF EXISTS `inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `supplier_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sales_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_id` int DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `stock_action` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inward`
--

LOCK TABLES `inward` WRITE;
/*!40000 ALTER TABLE `inward` DISABLE KEYS */;
/*!40000 ALTER TABLE `inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inward_items`
--

DROP TABLE IF EXISTS `inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_inward_id` (`inward_id`),
  CONSTRAINT `fk_inward_id` FOREIGN KEY (`inward_id`) REFERENCES `inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inward_items`
--

LOCK TABLES `inward_items` WRITE;
/*!40000 ALTER TABLE `inward_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_grn`
--

DROP TABLE IF EXISTS `job_grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) DEFAULT NULL,
  `inward_from` varchar(255) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `job_no` varchar(100) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `type` enum('Normal','Sample') DEFAULT 'Normal',
  `fabric_in_charge` varchar(255) DEFAULT NULL,
  `fabric_received_condition` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approval_status` enum('Pending','Approved','Cancelled') DEFAULT 'Pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_grn`
--

LOCK TABLES `job_grn` WRITE;
/*!40000 ALTER TABLE `job_grn` DISABLE KEYS */;
INSERT INTO `job_grn` VALUES (5,'tets','tets','','42','2026-02-16','Normal','','','2026-02-17 11:17:32','Approved');
/*!40000 ALTER TABLE `job_grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_grn_items`
--

DROP TABLE IF EXISTS `job_grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_grn_id` int NOT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `colour` varchar(100) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `roll` varchar(50) DEFAULT NULL,
  `received_weight` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_grn_id` (`job_grn_id`),
  CONSTRAINT `job_grn_items_ibfk_1` FOREIGN KEY (`job_grn_id`) REFERENCES `job_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_grn_items`
--

LOCK TABLES `job_grn_items` WRITE;
/*!40000 ALTER TABLE `job_grn_items` DISABLE KEYS */;
INSERT INTO `job_grn_items` VALUES (9,5,'S/J','red','12','15','140');
/*!40000 ALTER TABLE `job_grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_inward`
--

DROP TABLE IF EXISTS `job_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_no` varchar(50) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `inward_from` varchar(255) DEFAULT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `job_no` varchar(255) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `fabric_in_charge` varchar(255) DEFAULT NULL,
  `fabric_received_condition` varchar(255) DEFAULT NULL,
  `approval_status` varchar(50) DEFAULT 'Pending',
  `same_for_all` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_job_inward_year` (`year_id`),
  CONSTRAINT `fk_job_inward_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_inward`
--

LOCK TABLES `job_inward` WRITE;
/*!40000 ALTER TABLE `job_inward` DISABLE KEYS */;
INSERT INTO `job_inward` VALUES (5,'5','tets','tets','','42','2026-02-16','Normal','','','Approved',1,1);
/*!40000 ALTER TABLE `job_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_inward_item_processes`
--

DROP TABLE IF EXISTS `job_inward_item_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_inward_item_processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int DEFAULT NULL,
  `process_name` varchar(255) DEFAULT NULL,
  `machine_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `job_inward_item_processes_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `job_inward_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_inward_item_processes`
--

LOCK TABLES `job_inward_item_processes` WRITE;
/*!40000 ALTER TABLE `job_inward_item_processes` DISABLE KEYS */;
INSERT INTO `job_inward_item_processes` VALUES (11,11,'Dyeing','Top');
/*!40000 ALTER TABLE `job_inward_item_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_inward_items`
--

DROP TABLE IF EXISTS `job_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `colour` varchar(255) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `roll` varchar(50) DEFAULT NULL,
  `received_weight` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `job_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `job_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_inward_items`
--

LOCK TABLES `job_inward_items` WRITE;
/*!40000 ALTER TABLE `job_inward_items` DISABLE KEYS */;
INSERT INTO `job_inward_items` VALUES (11,5,'S/J','red','12','15','140');
/*!40000 ALTER TABLE `job_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_outward`
--

DROP TABLE IF EXISTS `job_outward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_outward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `outward_to` varchar(255) DEFAULT NULL,
  `in_dc_no` varchar(50) DEFAULT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `job_card_no` varchar(255) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `delivery_type` enum('Full Delivery','Partial Delivery') DEFAULT 'Full Delivery',
  `fabric_in_charge` varchar(255) DEFAULT NULL,
  `fabric_received_condition` varchar(255) DEFAULT NULL,
  `roll_reverse` varchar(255) DEFAULT NULL,
  `lab_report` varchar(255) DEFAULT NULL,
  `design_no` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `same_for_all` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  KEY `fk_job_outward_year` (`year_id`),
  CONSTRAINT `fk_job_outward_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`),
  CONSTRAINT `job_outward_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `job_inward` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_outward`
--

LOCK TABLES `job_outward` WRITE;
/*!40000 ALTER TABLE `job_outward` DISABLE KEYS */;
INSERT INTO `job_outward` VALUES (6,5,'tets','','JOB-5','','42','','2026-02-17','Partial Delivery','','','','','','2026-02-17 11:20:41',1,1),(7,5,'tets','','JOB-5','','42','','2026-02-17','Full Delivery','','','','','','2026-02-17 11:20:59',1,1);
/*!40000 ALTER TABLE `job_outward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_outward_item_processes`
--

DROP TABLE IF EXISTS `job_outward_item_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_outward_item_processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_item_id` int DEFAULT NULL,
  `process_name` varchar(255) DEFAULT NULL,
  `machine_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `outward_item_id` (`outward_item_id`),
  CONSTRAINT `job_outward_item_processes_ibfk_1` FOREIGN KEY (`outward_item_id`) REFERENCES `job_outward_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_outward_item_processes`
--

LOCK TABLES `job_outward_item_processes` WRITE;
/*!40000 ALTER TABLE `job_outward_item_processes` DISABLE KEYS */;
INSERT INTO `job_outward_item_processes` VALUES (3,4,'Dyeing','Top');
/*!40000 ALTER TABLE `job_outward_item_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_outward_items`
--

DROP TABLE IF EXISTS `job_outward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_outward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_id` int DEFAULT NULL,
  `inward_item_id` int DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `colour` varchar(255) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `roll` varchar(50) DEFAULT NULL,
  `inward_weight` decimal(10,2) DEFAULT NULL,
  `outward_weight` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `amount` decimal(10,2) DEFAULT '0.00',
  `cgst_pct` decimal(5,2) DEFAULT '0.00',
  `cgst_amt` decimal(10,2) DEFAULT '0.00',
  `sgst_pct` decimal(5,2) DEFAULT '0.00',
  `sgst_amt` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `outward_id` (`outward_id`),
  KEY `inward_item_id` (`inward_item_id`),
  CONSTRAINT `job_outward_items_ibfk_1` FOREIGN KEY (`outward_id`) REFERENCES `job_outward` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_outward_items_ibfk_2` FOREIGN KEY (`inward_item_id`) REFERENCES `job_inward_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_outward_items`
--

LOCK TABLES `job_outward_items` WRITE;
/*!40000 ALTER TABLE `job_outward_items` DISABLE KEYS */;
INSERT INTO `job_outward_items` VALUES (4,6,11,'S/J','red','12','15',140.00,100.00,0.00,0.00,0.00,0.00,0.00,0.00),(5,7,11,'S/J','red','12','15',140.00,40.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `job_outward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_return`
--

DROP TABLE IF EXISTS `job_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `return_from` varchar(255) DEFAULT NULL,
  `in_dc_no` varchar(50) DEFAULT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `job_card_no` varchar(255) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `return_type` enum('Full Return','Partial Return') DEFAULT 'Full Return',
  `fabric_in_charge` varchar(255) DEFAULT NULL,
  `fabric_received_condition` varchar(255) DEFAULT NULL,
  `roll_reverse` varchar(255) DEFAULT NULL,
  `lab_report` varchar(255) DEFAULT NULL,
  `design_no` varchar(255) DEFAULT NULL,
  `same_for_all` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  KEY `fk_job_return_year` (`year_id`),
  CONSTRAINT `fk_job_return_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`),
  CONSTRAINT `job_return_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `job_inward` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_return`
--

LOCK TABLES `job_return` WRITE;
/*!40000 ALTER TABLE `job_return` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_return_item_processes`
--

DROP TABLE IF EXISTS `job_return_item_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_return_item_processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_item_id` int DEFAULT NULL,
  `process_name` varchar(255) DEFAULT NULL,
  `machine_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `return_item_id` (`return_item_id`),
  CONSTRAINT `job_return_item_processes_ibfk_1` FOREIGN KEY (`return_item_id`) REFERENCES `job_return_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_return_item_processes`
--

LOCK TABLES `job_return_item_processes` WRITE;
/*!40000 ALTER TABLE `job_return_item_processes` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_return_item_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_return_items`
--

DROP TABLE IF EXISTS `job_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int DEFAULT NULL,
  `inward_item_id` int DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `colour` varchar(255) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `roll` varchar(50) DEFAULT NULL,
  `inward_weight` decimal(10,2) DEFAULT NULL,
  `return_weight` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `amount` decimal(10,2) DEFAULT '0.00',
  `cgst_pct` decimal(5,2) DEFAULT '0.00',
  `cgst_amt` decimal(10,2) DEFAULT '0.00',
  `sgst_pct` decimal(5,2) DEFAULT '0.00',
  `sgst_amt` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  KEY `inward_item_id` (`inward_item_id`),
  CONSTRAINT `job_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `job_return` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_return_items_ibfk_2` FOREIGN KEY (`inward_item_id`) REFERENCES `job_inward_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_return_items`
--

LOCK TABLES `job_return_items` WRITE;
/*!40000 ALTER TABLE `job_return_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lab_test_no` varchar(50) DEFAULT NULL,
  `test_date` date DEFAULT NULL,
  `buyer_name` varchar(255) DEFAULT NULL,
  `style_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `fabric_type` varchar(100) DEFAULT NULL,
  `fabric_composition` varchar(255) DEFAULT NULL,
  `shade_name` varchar(100) DEFAULT NULL,
  `shade_code` varchar(100) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `dyeing_machine_no` varchar(100) DEFAULT NULL,
  `dyeing_type` varchar(100) DEFAULT NULL,
  `sample_type` varchar(100) DEFAULT NULL,
  `shade_matching_status` varchar(50) DEFAULT NULL,
  `delta_e_value` varchar(50) DEFAULT NULL,
  `spectrophotometer_reading` text,
  `light_source_matching` varchar(100) DEFAULT NULL,
  `buyer_approval_date` date DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `washing_fastness_colour_change` varchar(10) DEFAULT NULL,
  `washing_fastness_colour_staining` varchar(10) DEFAULT NULL,
  `rubbing_fastness_dry` varchar(10) DEFAULT NULL,
  `rubbing_fastness_wet` varchar(10) DEFAULT NULL,
  `perspiration_fastness_acid` varchar(10) DEFAULT NULL,
  `perspiration_fastness_alkaline` varchar(10) DEFAULT NULL,
  `light_fastness_grade` varchar(10) DEFAULT NULL,
  `gsm_before_dyeing` int DEFAULT NULL,
  `gsm_after_dyeing` int DEFAULT NULL,
  `shrinkage_length` varchar(50) DEFAULT NULL,
  `shrinkage_width` varchar(50) DEFAULT NULL,
  `spirality` varchar(50) DEFAULT NULL,
  `ph_value` varchar(50) DEFAULT NULL,
  `water_absorvency_time` varchar(50) DEFAULT NULL,
  `bursting_strength` varchar(100) DEFAULT NULL,
  `azo_free_test` varchar(100) DEFAULT NULL,
  `formaldehyde` varchar(100) DEFAULT NULL,
  `heavy_metals` varchar(100) DEFAULT NULL,
  `reach_zdhc_compliance` varchar(100) DEFAULT NULL,
  `final_decision` varchar(50) DEFAULT NULL,
  `remarks` text,
  `qc_signature` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lab_test_no` (`lab_test_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_sources`
--

DROP TABLE IF EXISTS `lead_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_sources`
--

LOCK TABLES `lead_sources` WRITE;
/*!40000 ALTER TABLE `lead_sources` DISABLE KEYS */;
INSERT INTO `lead_sources` VALUES (6,'New','2026-02-17 16:56:29');
/*!40000 ALTER TABLE `lead_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_statuses`
--

DROP TABLE IF EXISTS `lead_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT '#0d6efd',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_statuses`
--

LOCK TABLES `lead_statuses` WRITE;
/*!40000 ALTER TABLE `lead_statuses` DISABLE KEYS */;
INSERT INTO `lead_statuses` VALUES (1,'New','#0d6efd','2026-02-17 16:50:51'),(3,'Quotation Sent','#ffc107','2026-02-17 16:50:51'),(5,'Won','#198754','2026-02-17 16:50:51'),(7,'Lost','#fd0d55','2026-02-17 16:58:29');
/*!40000 ALTER TABLE `lead_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` varchar(20) NOT NULL,
  `lead_date` date NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `whatsapp_number` varchar(20) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `lead_source` varchar(100) DEFAULT NULL,
  `assigned_sales_person` varchar(100) DEFAULT NULL,
  `product_type` varchar(255) DEFAULT NULL,
  `appointment_date` datetime DEFAULT NULL,
  `reference_image` varchar(255) DEFAULT NULL,
  `gst_number` varchar(20) DEFAULT NULL,
  `address` text,
  `lead_status` varchar(100) DEFAULT 'New',
  `next_followup_date` date DEFAULT NULL,
  `followup_notes` text,
  `expected_closing_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_id` (`lead_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (1,'LD-0001','2026-02-16','Test Lead','test','8974432554','','','Tirupur','Tamilnadu','India','','rajaaa','Test','2026-02-19 16:43:00','lead_1771346695620.jpg','','','Won','2026-02-19','','2026-02-20','2026-02-17 16:44:55','2026-02-17 17:04:18'),(2,'LD-0002','2026-02-17','next lead','tg','98971235','','','Chennai','Tamil Nadu','India','New','rajaaa','test','2026-02-18 22:35:00','lead_1771347920910.jpg','-','','Lost',NULL,'',NULL,'2026-02-17 17:05:20','2026-02-17 17:05:20');
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `life_cycles`
--

DROP TABLE IF EXISTS `life_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `life_cycles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_name` varchar(255) NOT NULL,
  `process_type` varchar(50) NOT NULL,
  `wastage` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `life_cycles`
--

LOCK TABLES `life_cycles` WRITE;
/*!40000 ALTER TABLE `life_cycles` DISABLE KEYS */;
INSERT INTO `life_cycles` VALUES (1,'Knitting','yarn',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(2,'Dyeing','fabric',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(3,'Compacting','fabric',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(4,'Cutting','pcs',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(5,'Stitching','pcs',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(6,'Checking','pcs',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(7,'Ironing','pcs',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0),(8,'Packing','pcs',0.00,'2026-02-18 12:51:00','2026-02-18 12:51:00',0);
/*!40000 ALTER TABLE `life_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lifecycle_template_items`
--

DROP TABLE IF EXISTS `lifecycle_template_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lifecycle_template_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_id` int NOT NULL,
  `sequence_no` int DEFAULT '0',
  `process_name` varchar(255) DEFAULT NULL,
  `process_type` varchar(50) DEFAULT NULL,
  `custom_name` varchar(255) DEFAULT NULL,
  `wastage_pct` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `lifecycle_template_items_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `lifecycle_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lifecycle_template_items`
--

LOCK TABLES `lifecycle_template_items` WRITE;
/*!40000 ALTER TABLE `lifecycle_template_items` DISABLE KEYS */;
INSERT INTO `lifecycle_template_items` VALUES (10,1,1,'Knitting','yarn',NULL,0.00),(11,1,2,'Dyeing','fabric',NULL,0.00),(12,1,3,'Compacting','fabric',NULL,0.00),(13,1,4,'Cutting','pcs',NULL,0.00),(14,1,5,'Stitching','pcs',NULL,0.00),(15,1,6,'Checking','pcs',NULL,0.00),(16,1,7,'Ironing','pcs',NULL,0.00),(17,1,8,'Packing','pcs',NULL,0.00);
/*!40000 ALTER TABLE `lifecycle_template_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lifecycle_templates`
--

DROP TABLE IF EXISTS `lifecycle_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lifecycle_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lifecycle_templates`
--

LOCK TABLES `lifecycle_templates` WRITE;
/*!40000 ALTER TABLE `lifecycle_templates` DISABLE KEYS */;
INSERT INTO `lifecycle_templates` VALUES (1,'Test','','2026-02-21 18:20:38');
/*!40000 ALTER TABLE `lifecycle_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machines`
--

DROP TABLE IF EXISTS `machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `machine_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `machine_name` (`machine_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machines`
--

LOCK TABLES `machines` WRITE;
/*!40000 ALTER TABLE `machines` DISABLE KEYS */;
INSERT INTO `machines` VALUES (1,'Top');
/*!40000 ALTER TABLE `machines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modeofpayment`
--

DROP TABLE IF EXISTS `modeofpayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modeofpayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `modeofpayment` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modeofpayment`
--

LOCK TABLES `modeofpayment` WRITE;
/*!40000 ALTER TABLE `modeofpayment` DISABLE KEYS */;
INSERT INTO `modeofpayment` VALUES (1,'cash'),(3,'UPI'),(4,'che');
/*!40000 ALTER TABLE `modeofpayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `module_name` (`module_name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES (14,'CREDIT NOTE'),(11,'DC'),(16,'DEBIT NOTE'),(12,'ESTIMATE'),(10,'GRN'),(3,'Invoice'),(17,'Inward'),(8,'PI'),(9,'PO'),(2,'Purchase'),(15,'PURCHASE RETURN'),(7,'Quotation'),(5,'Receipt'),(4,'Reports'),(13,'SALES_RETURN'),(1,'Users'),(6,'Voucher');
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balances`
--

DROP TABLE IF EXISTS `opening_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opening_balances` (
  `ob_id` int NOT NULL AUTO_INCREMENT,
  `year_id` int NOT NULL,
  `account_id` int NOT NULL,
  `dr_amount` decimal(15,2) DEFAULT '0.00',
  `cr_amount` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ob_id`),
  KEY `year_id` (`year_id`),
  CONSTRAINT `opening_balances_ibfk_1` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balances`
--

LOCK TABLES `opening_balances` WRITE;
/*!40000 ALTER TABLE `opening_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_bom`
--

DROP TABLE IF EXISTS `order_bom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_bom` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `item_category` enum('Yarn','Fabric','Trims') DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `required_qty` decimal(10,3) DEFAULT '0.000',
  `final_qty` decimal(10,3) DEFAULT '0.000',
  `export_to_po` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `budget_rate` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_bom_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_bom`
--

LOCK TABLES `order_bom` WRITE;
/*!40000 ALTER TABLE `order_bom` DISABLE KEYS */;
INSERT INTO `order_bom` VALUES (36,2,'Yarn','20S - GT',61.200,61.200,0,'2026-02-22 09:40:34',0.00),(37,2,'Fabric','Fleece - 100%cotton - 120G - 20\" - blue',61.200,61.200,0,'2026-02-22 09:40:34',0.00),(38,5,'Yarn','30s - Rl',72.000,72.000,0,'2026-02-23 19:36:16',0.00),(39,5,'Fabric','Single Jersey - 100%cotton - 200G - 24\" - red',72.000,72.000,0,'2026-02-23 19:36:16',0.00),(40,5,'Trims','Rope',60.000,60.000,0,'2026-02-23 19:36:16',0.00),(41,10,'Yarn','20S - Combed Cotton',97.920,100.000,0,'2026-02-24 15:17:47',0.00),(42,10,'Fabric','S/J - 100%Cotton - 200G - 12\" - Green',97.920,97.920,0,'2026-02-24 15:17:47',0.00),(43,10,'Trims','Button - L',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(44,10,'Trims','Button - M',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(45,10,'Trims','Button - S',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(46,10,'Trims','Button - XL',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(47,10,'Trims','Size Label - L',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(48,10,'Trims','Size Label - M',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(49,10,'Trims','Size Label - S',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(50,10,'Trims','Size Label - XL',153.000,153.000,0,'2026-02-24 15:17:47',0.00),(51,21,'Yarn','20S - VL',587.520,587.520,0,'2026-02-27 13:17:21',0.00),(52,21,'Fabric','S/J - 100%Cotton - 200G - 12\" - red',587.520,587.520,0,'2026-02-27 13:17:21',0.00);
/*!40000 ALTER TABLE `order_bom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_lifecycle`
--

DROP TABLE IF EXISTS `order_lifecycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_lifecycle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sequence_no` int DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `process_name` varchar(255) DEFAULT NULL,
  `process_type` varchar(50) DEFAULT NULL,
  `custom_name` varchar(255) DEFAULT NULL,
  `wastage_pct` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_lifecycle_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=265 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_lifecycle`
--

LOCK TABLES `order_lifecycle` WRITE;
/*!40000 ALTER TABLE `order_lifecycle` DISABLE KEYS */;
INSERT INTO `order_lifecycle` VALUES (1,0,NULL,'','PCS',NULL,0.00,'2026-02-20 13:35:01'),(2,0,NULL,'','PCS',NULL,0.00,'2026-02-20 13:35:01'),(185,1,2,'Knitting','yarn',NULL,0.00,'2026-02-22 09:40:29'),(186,2,2,'Dyeing','fabric',NULL,0.00,'2026-02-22 09:40:29'),(187,3,2,'Compacting','fabric',NULL,0.00,'2026-02-22 09:40:29'),(188,4,2,'Cutting','pcs',NULL,0.00,'2026-02-22 09:40:29'),(189,5,2,'Stitching','pcs',NULL,0.00,'2026-02-22 09:40:29'),(190,6,2,'Checking','pcs',NULL,0.00,'2026-02-22 09:40:29'),(191,7,2,'Ironing','pcs',NULL,0.00,'2026-02-22 09:40:29'),(192,8,2,'Packing','pcs',NULL,0.00,'2026-02-22 09:40:29'),(225,1,5,'Knitting','yarn',NULL,0.00,'2026-02-24 06:35:00'),(226,2,5,'Dyeing','fabric',NULL,0.00,'2026-02-24 06:35:00'),(227,3,5,'Compacting','fabric',NULL,0.00,'2026-02-24 06:35:00'),(228,4,5,'Cutting','pcs',NULL,0.00,'2026-02-24 06:35:00'),(229,5,5,'Stitching','pcs',NULL,0.00,'2026-02-24 06:35:00'),(230,6,5,'Checking','pcs',NULL,0.00,'2026-02-24 06:35:00'),(231,7,5,'Ironing','pcs',NULL,0.00,'2026-02-24 06:35:00'),(232,8,5,'Packing','pcs',NULL,0.00,'2026-02-24 06:35:00'),(241,1,10,'Knitting','yarn',NULL,0.00,'2026-02-24 17:48:50'),(242,2,10,'Dyeing','fabric',NULL,0.00,'2026-02-24 17:48:50'),(243,3,10,'Compacting','fabric',NULL,0.00,'2026-02-24 17:48:50'),(244,4,10,'Cutting','pcs',NULL,0.00,'2026-02-24 17:48:50'),(245,5,10,'Stitching','pcs',NULL,0.00,'2026-02-24 17:48:50'),(246,6,10,'Checking','pcs',NULL,0.00,'2026-02-24 17:48:50'),(247,7,10,'Ironing','pcs',NULL,0.00,'2026-02-24 17:48:50'),(248,8,10,'Packing','pcs',NULL,0.00,'2026-02-24 17:48:50'),(249,1,21,'Knitting','yarn',NULL,0.00,'2026-02-27 13:17:17'),(250,2,21,'Dyeing','fabric',NULL,0.00,'2026-02-27 13:17:17'),(251,3,21,'Compacting','fabric',NULL,0.00,'2026-02-27 13:17:17'),(252,4,21,'Cutting','pcs',NULL,0.00,'2026-02-27 13:17:17'),(253,5,21,'Stitching','pcs',NULL,0.00,'2026-02-27 13:17:17'),(254,6,21,'Checking','pcs',NULL,0.00,'2026-02-27 13:17:17'),(255,7,21,'Ironing','pcs',NULL,0.00,'2026-02-27 13:17:17'),(256,8,21,'Packing','pcs',NULL,0.00,'2026-02-27 13:17:17');
/*!40000 ALTER TABLE `order_lifecycle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_planning`
--

DROP TABLE IF EXISTS `order_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) DEFAULT NULL,
  `order_type` varchar(50) DEFAULT NULL,
  `own_brand_name` varchar(100) DEFAULT NULL,
  `buyer_id` int DEFAULT NULL,
  `buyer_name` varchar(100) DEFAULT NULL,
  `buyer_po` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `order_category` varchar(50) DEFAULT NULL,
  `style_type` varchar(100) DEFAULT 'new style planning',
  `season_id` int DEFAULT NULL,
  `season_name` varchar(100) DEFAULT NULL,
  `merchandiser_id` int DEFAULT NULL,
  `merchandiser_name` varchar(100) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `factory_date` date DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `lifecycle_type` varchar(50) DEFAULT 'not planned',
  `is_bundle` varchar(20) DEFAULT 'no',
  `order_image` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `fabric_in_house_process` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `fk_order_planning_year` (`year_id`),
  CONSTRAINT `fk_order_planning_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_planning`
--

LOCK TABLES `order_planning` WRITE;
/*!40000 ALTER TABLE `order_planning` DISABLE KEYS */;
INSERT INTO `order_planning` VALUES (2,'1','Buyer',NULL,17,'test customer',NULL,'45','Bulk','New Style',1,'Summer',1,'rajaaa','Medium','2026-02-18','2026-02-19','2026-02-19','order wise','no',NULL,'Completed',NULL,'2026-02-22 09:39:19',2),(5,'3','Buyer',NULL,17,'test customer',NULL,'NM','Bulk','New Style',1,'Summer',1,'rajaaa','Medium','2026-02-18','2026-02-18','2026-02-18','order wise','no',NULL,'Approved','Compacting','2026-02-23 11:00:39',2),(10,'6','Buyer',NULL,18,'kia',NULL,'nj','Bulk','New Style',1,'Summer',1,'rajaaa','Medium','2026-02-20','2026-02-20','2026-02-20','order wise','no',NULL,'Completed','Compacting','2026-02-24 15:15:40',2),(21,'11','Buyer',NULL,17,'test customer',NULL,'TN','Bulk','New Style',1,'Summer',1,'rajaaa','Medium','2026-02-22','2026-02-22','2026-02-22','order wise','no',NULL,'Approved',NULL,'2026-02-27 13:16:17',2);
/*!40000 ALTER TABLE `order_planning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_trims_lifecycle`
--

DROP TABLE IF EXISTS `order_trims_lifecycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_trims_lifecycle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `trim_name` varchar(255) DEFAULT NULL,
  `process_name` varchar(255) DEFAULT NULL,
  `wastage_pct` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_trims_lifecycle_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_trims_lifecycle`
--

LOCK TABLES `order_trims_lifecycle` WRITE;
/*!40000 ALTER TABLE `order_trims_lifecycle` DISABLE KEYS */;
INSERT INTO `order_trims_lifecycle` VALUES (20,5,'Rope','Stitching',0.00,'2026-02-24 06:35:00'),(23,10,'Button','',0.00,'2026-02-24 17:48:50'),(24,10,'Size Label','',0.00,'2026-02-24 17:48:50');
/*!40000 ALTER TABLE `order_trims_lifecycle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_direct_inward`
--

DROP TABLE IF EXISTS `pcs_direct_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_direct_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inward_no` (`inward_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_direct_inward`
--

LOCK TABLES `pcs_direct_inward` WRITE;
/*!40000 ALTER TABLE `pcs_direct_inward` DISABLE KEYS */;
/*!40000 ALTER TABLE `pcs_direct_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_direct_inward_items`
--

DROP TABLE IF EXISTS `pcs_direct_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_direct_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `pcs_direct_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `pcs_direct_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_direct_inward_items`
--

LOCK TABLES `pcs_direct_inward_items` WRITE;
/*!40000 ALTER TABLE `pcs_direct_inward_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `pcs_direct_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_inward`
--

DROP TABLE IF EXISTS `pcs_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(30) NOT NULL,
  `inward_type` enum('order') NOT NULL DEFAULT 'order',
  `work_type` enum('Jobwork','Contractor') DEFAULT 'Jobwork',
  `contractor_name` varchar(255) DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT NULL,
  `size_chart_name` varchar(100) DEFAULT NULL,
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_pcs` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_inward`
--

LOCK TABLES `pcs_inward` WRITE;
/*!40000 ALTER TABLE `pcs_inward` DISABLE KEYS */;
INSERT INTO `pcs_inward` VALUES (1,'PCS-IN-0001','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','ht','Stitching','S-XL','','','',400,'2026-02-23 09:05:10',2),(3,'PCS-IN-0002','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','fvc','Checking','S-XL','','','',400,'2026-02-23 09:11:45',2),(4,'PCS-IN-0003','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','fvc','Ironing','S-XL','','','',400,'2026-02-23 09:12:23',2),(5,'PCS-IN-0004','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','fvc','Packing','S-XL','','','',400,'2026-02-23 09:12:49',2),(6,'PCS-IN-0005','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Stitching','S-L','','rajaaa','',300,'2026-02-24 07:41:42',2),(7,'PCS-IN-0006','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Checking','S-L','','rajaaa','',300,'2026-02-24 07:42:58',2),(8,'PCS-IN-0007','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Ironing','S-L','','rajaaa','',300,'2026-02-24 07:43:37',2),(10,'PCS-IN-0008','order','Contractor','Test','2026-02-25','','6','nj','','','Stitching','S-XL','','rajaaa','',200,'2026-02-25 05:18:31',2),(11,'PCS-IN-0009','order','Contractor','Test','2026-02-25','','6','nj','','','Checking','S-XL','','rajaaa','',200,'2026-02-25 05:44:46',2),(12,'PCS-IN-0010','order','Contractor','Test','2026-02-25','','6','nj','','','Ironing','S-XL','','rajaaa','',200,'2026-02-25 05:45:31',2),(13,'PCS-IN-0011','order','Contractor','Test','2026-02-24','','6','nj','','','Packing','S-XL','','rajaaa','',40,'2026-02-25 05:46:10',2);
/*!40000 ALTER TABLE `pcs_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_inward_items`
--

DROP TABLE IF EXISTS `pcs_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int NOT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `style_color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `contractor_name` varchar(255) DEFAULT NULL,
  `pcs` int DEFAULT '0',
  `sizes_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `pcs_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `pcs_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_inward_items`
--

LOCK TABLES `pcs_inward_items` WRITE;
/*!40000 ALTER TABLE `pcs_inward_items` DISABLE KEYS */;
INSERT INTO `pcs_inward_items` VALUES (1,1,'gh','gh','blue','blue','',NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(3,3,'gh','gh','blue','blue','',NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(4,4,'gh','gh','blue','blue','',NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(5,5,'gh','gh','blue','blue','',NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(6,6,'Single Jersey','Single Jersey','red','red','',NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(7,7,'Single Jersey','Single Jersey','red','red','',NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(8,8,'Single Jersey','Single Jersey','red','red','',NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(10,10,'VG',NULL,'Green',NULL,'','Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}'),(11,11,'VG',NULL,'Green',NULL,'','Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}'),(12,12,'VG',NULL,'Green',NULL,'','Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}'),(14,13,'VG','VG','Green','Green','','Test',40,'{\"L\": \"10\", \"M\": \"10\", \"S\": \"10\", \"XL\": \"10\"}');
/*!40000 ALTER TABLE `pcs_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_outward`
--

DROP TABLE IF EXISTS `pcs_outward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_outward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_no` varchar(30) NOT NULL,
  `outward_type` enum('order') NOT NULL DEFAULT 'order',
  `work_type` enum('Jobwork','Contractor') DEFAULT 'Jobwork',
  `contractor_name` varchar(255) DEFAULT NULL,
  `outward_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT NULL,
  `previous_process` varchar(100) DEFAULT NULL,
  `size_chart_name` varchar(100) DEFAULT NULL,
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_pcs` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_outward`
--

LOCK TABLES `pcs_outward` WRITE;
/*!40000 ALTER TABLE `pcs_outward` DISABLE KEYS */;
INSERT INTO `pcs_outward` VALUES (1,'PCS-OUT-0001','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','ht','Stitching',NULL,'S-XL','','','',400,'2026-02-23 09:04:51',2),(2,'PCS-OUT-0002','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','fvc','Checking',NULL,'S-XL','','rajaaa','',400,'2026-02-23 09:05:36',2),(5,'PCS-OUT-0003','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','fvc','Ironing',NULL,'S-XL','','','',400,'2026-02-23 09:12:02',2),(6,'PCS-OUT-0004','order','Jobwork',NULL,'2026-02-23','','1','45','fvc','fvc','Packing',NULL,'S-XL','','','',400,'2026-02-23 09:12:36',2),(7,'PCS-OUT-0005','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Stitching','Cutting','S-L','','rajaaa','',300,'2026-02-24 07:41:23',2),(8,'PCS-OUT-0006','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Checking','Stitching','S-L','','rajaaa','',300,'2026-02-24 07:41:59',2),(9,'PCS-OUT-0007','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Ironing','Checking','S-L','','rajaaa','',300,'2026-02-24 07:43:18',2),(10,'PCS-OUT-0008','order','Jobwork',NULL,'2026-02-24','','3','NM','ht','ht','Packing','Ironing','S-L','','rajaaa','',300,'2026-02-24 07:43:53',2),(12,'PCS-OUT-0009','order','Contractor','Test','2026-02-24','','6','nj','','','Stitching','Cutting','S-XL','','rajaaa','',200,'2026-02-25 04:54:09',2),(13,'PCS-OUT-0010','order','Contractor','Test','2026-02-25','','6','nj','','','Checking','Stitching','S-XL','','rajaaa','',200,'2026-02-25 05:44:29',2),(14,'PCS-OUT-0011','order','Contractor','Test','2026-02-25','','6','nj','','','Ironing','Checking','S-XL','','rajaaa','',200,'2026-02-25 05:45:13',2),(15,'PCS-OUT-0012','order','Contractor','Test','2026-02-25','','6','nj','','','Packing','Ironing','S-XL','','','',200,'2026-02-25 05:45:54',2);
/*!40000 ALTER TABLE `pcs_outward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_outward_items`
--

DROP TABLE IF EXISTS `pcs_outward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_outward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_id` int NOT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `style_color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `contractor_name` varchar(255) DEFAULT NULL,
  `pcs` int DEFAULT '0',
  `sizes_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `outward_id` (`outward_id`),
  CONSTRAINT `pcs_outward_items_ibfk_1` FOREIGN KEY (`outward_id`) REFERENCES `pcs_outward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_outward_items`
--

LOCK TABLES `pcs_outward_items` WRITE;
/*!40000 ALTER TABLE `pcs_outward_items` DISABLE KEYS */;
INSERT INTO `pcs_outward_items` VALUES (1,1,'gh','gh','blue','blue',NULL,NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(2,2,'gh','gh','blue','blue',NULL,NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(5,5,'gh','gh','blue','blue',NULL,NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(6,6,'gh','gh','blue','blue',NULL,NULL,400,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}'),(7,7,'Single Jersey','Single Jersey','red','red',NULL,NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(8,8,'Single Jersey','Single Jersey','red','red',NULL,NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(9,9,'Single Jersey','Single Jersey','red','red',NULL,NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(10,10,'Single Jersey','Single Jersey','red','red',NULL,NULL,300,'{\"L\": 100, \"M\": 100, \"S\": 100}'),(13,12,'VG','VG','Green','Green','','Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}'),(14,13,'VG',NULL,'Green',NULL,NULL,'Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}'),(15,14,'VG',NULL,'Green',NULL,NULL,'Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}'),(16,15,'VG',NULL,'Green',NULL,NULL,'Test',200,'{\"L\": 50, \"M\": 50, \"S\": 50, \"XL\": 50}');
/*!40000 ALTER TABLE `pcs_outward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_return`
--

DROP TABLE IF EXISTS `pcs_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_no` varchar(30) NOT NULL,
  `return_type` enum('order') NOT NULL DEFAULT 'order',
  `work_type` enum('Jobwork','Contractor') DEFAULT 'Jobwork',
  `contractor_name` varchar(255) DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT NULL,
  `size_chart_name` varchar(100) DEFAULT NULL,
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_pcs` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_return`
--

LOCK TABLES `pcs_return` WRITE;
/*!40000 ALTER TABLE `pcs_return` DISABLE KEYS */;
/*!40000 ALTER TABLE `pcs_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_return_items`
--

DROP TABLE IF EXISTS `pcs_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int NOT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `style_color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `contractor_name` varchar(255) DEFAULT NULL,
  `pcs` int DEFAULT '0',
  `sizes_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  CONSTRAINT `pcs_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `pcs_return` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_return_items`
--

LOCK TABLES `pcs_return_items` WRITE;
/*!40000 ALTER TABLE `pcs_return_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `pcs_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pi`
--

DROP TABLE IF EXISTS `pi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `pi_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pi`
--

LOCK TABLES `pi` WRITE;
/*!40000 ALTER TABLE `pi` DISABLE KEYS */;
INSERT INTO `pi` VALUES (1,'rajaa','rajaaa','2026-01-15','4564258','2026-01-10','Pending',24.00,0.00,0.00,1235.00,'2026-01-09 15:56:04',0.00,0,'','res',20.00,0,2);
/*!40000 ALTER TABLE `pi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pi_items`
--

DROP TABLE IF EXISTS `pi_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pi_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pi_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `pi_id` (`pi_id`),
  CONSTRAINT `pi_items_ibfk_1` FOREIGN KEY (`pi_id`) REFERENCES `pi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pi_items`
--

LOCK TABLES `pi_items` WRITE;
/*!40000 ALTER TABLE `pi_items` DISABLE KEYS */;
INSERT INTO `pi_items` VALUES (2,1,'hjse',20.00,60.00,0.00,2.00,5.00,1234.80,'2026-01-09 15:56:18','None');
/*!40000 ALTER TABLE `pi_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `po`
--

DROP TABLE IF EXISTS `po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po`
--

LOCK TABLES `po` WRITE;
/*!40000 ALTER TABLE `po` DISABLE KEYS */;
INSERT INTO `po` VALUES (1,'rajaa','rajaaa','2026-01-10','4564258','2026-01-11','Pending',0.00,0.00,0.00,1478.00,'2026-01-08 16:48:40',0.00,0,NULL,'res',11.00,0,2),(2,'bn','rajaaa','2026-01-15','89456123','2026-01-17','Pending',1.20,0.00,0.00,62.00,'2026-01-08 17:00:29',0.00,0,NULL,'',1.00,0,2),(4,'raaaa','rajaaa','2026-01-16','9645123','2026-01-24','Pending',120.00,0.00,0.00,6174.00,'2026-01-08 17:23:14',0.00,0,NULL,'',100.00,0,2),(5,'rajaa','rajaaa','2026-01-10','4564258','2026-01-22','Pending',120.00,0.00,0.00,6174.00,'2026-01-08 17:25:32',0.00,0,NULL,'res',100.00,0,2),(6,'mkd','rajaaa',NULL,'894561','2026-01-11','Pending',12.00,0.00,0.00,617.00,'2026-01-08 17:52:09',0.00,0,NULL,'',10.00,0,2);
/*!40000 ALTER TABLE `po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `po_items`
--

DROP TABLE IF EXISTS `po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `po_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `po` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `po_items`
--

LOCK TABLES `po_items` WRITE;
/*!40000 ALTER TABLE `po_items` DISABLE KEYS */;
INSERT INTO `po_items` VALUES (1,5,'hjse',100.00,60.00,0.00,2.00,5.00,6174.00,'2026-01-08 17:25:32','None'),(2,6,'hjse',10.00,60.00,0.00,2.00,5.00,617.40,'2026-01-08 17:52:09','None');
/*!40000 ALTER TABLE `po_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_list_details`
--

DROP TABLE IF EXISTS `price_list_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_list_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `price_list_id` int NOT NULL,
  `product_id` int NOT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `price_list_id` (`price_list_id`,`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_list_details`
--

LOCK TABLES `price_list_details` WRITE;
/*!40000 ALTER TABLE `price_list_details` DISABLE KEYS */;
INSERT INTO `price_list_details` VALUES (1,1,13,16.00,15.00,5.00),(2,1,14,0.00,0.00,0.00),(3,1,10,120.00,100.00,NULL),(4,1,1,60.00,50.00,2.00),(5,1,9,0.00,0.00,0.00),(6,1,4,0.00,0.00,0.00);
/*!40000 ALTER TABLE `price_list_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_lists_master`
--

DROP TABLE IF EXISTS `price_lists_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_lists_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_lists_master`
--

LOCK TABLES `price_lists_master` WRITE;
/*!40000 ALTER TABLE `price_lists_master` DISABLE KEYS */;
INSERT INTO `price_lists_master` VALUES (1,'test');
/*!40000 ALTER TABLE `price_lists_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `privileges`
--

DROP TABLE IF EXISTS `privileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `privileges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usertype_id` int NOT NULL,
  `module_id` int NOT NULL,
  `can_add` tinyint DEFAULT '0',
  `can_update` tinyint DEFAULT '0',
  `can_delete` tinyint DEFAULT '0',
  `can_view` tinyint DEFAULT '1',
  `can_print` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_usertype_module` (`usertype_id`,`module_id`),
  KEY `module_id` (`module_id`),
  CONSTRAINT `privileges_ibfk_1` FOREIGN KEY (`usertype_id`) REFERENCES `user_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `privileges_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `privileges`
--

LOCK TABLES `privileges` WRITE;
/*!40000 ALTER TABLE `privileges` DISABLE KEYS */;
INSERT INTO `privileges` VALUES (1,4,3,0,0,0,1,0),(3,2,1,1,1,1,1,1),(4,2,2,1,1,1,1,1),(5,2,3,1,1,1,1,1),(6,2,4,1,1,1,1,1),(29,2,5,1,1,1,1,1),(32,4,5,0,0,0,1,0),(33,4,2,0,0,0,1,0),(34,2,6,1,1,1,1,1),(35,4,6,0,0,0,1,0),(38,2,7,1,1,1,1,1),(40,4,7,0,0,0,1,0),(42,2,8,1,1,1,1,1),(43,4,8,0,0,0,1,0),(45,2,9,1,1,1,1,1),(46,4,9,0,0,0,1,0),(48,2,10,1,1,1,1,1),(49,4,10,0,0,0,1,0),(51,2,11,1,1,1,1,1),(52,4,11,0,0,0,1,0),(54,2,12,1,1,1,1,1),(55,4,12,0,0,0,1,0),(57,2,13,1,1,1,1,1),(58,4,13,0,0,0,1,0),(60,2,14,1,1,1,1,1),(61,4,14,0,0,0,1,0),(63,2,15,1,1,1,1,1),(64,4,15,0,0,0,1,0),(66,2,16,1,1,1,1,1),(67,4,16,0,0,0,1,0);
/*!40000 ALTER TABLE `privileges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `processes`
--

DROP TABLE IF EXISTS `processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `process_name` (`process_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `processes`
--

LOCK TABLES `processes` WRITE;
/*!40000 ALTER TABLE `processes` DISABLE KEYS */;
INSERT INTO `processes` VALUES (1,'Dyeing');
/*!40000 ALTER TABLE `processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_types`
--

DROP TABLE IF EXISTS `product_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_types`
--

LOCK TABLES `product_types` WRITE;
/*!40000 ALTER TABLE `product_types` DISABLE KEYS */;
INSERT INTO `product_types` VALUES (1,'test','2026-02-17 16:57:01');
/*!40000 ALTER TABLE `product_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_lot_orders`
--

DROP TABLE IF EXISTS `production_lot_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_lot_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int DEFAULT NULL,
  `order_planning_id` int DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `production_lot_orders_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `production_lots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_lot_orders`
--

LOCK TABLES `production_lot_orders` WRITE;
/*!40000 ALTER TABLE `production_lot_orders` DISABLE KEYS */;
INSERT INTO `production_lot_orders` VALUES (2,2,2,'ORD-7835','2026-02-16');
/*!40000 ALTER TABLE `production_lot_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_lots`
--

DROP TABLE IF EXISTS `production_lots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_lots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_no` varchar(50) NOT NULL,
  `lot_name` varchar(255) NOT NULL,
  `status` enum('Pending','Approved','Hold','Completed') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lot_no` (`lot_no`),
  KEY `fk_production_lots_year` (`year_id`),
  CONSTRAINT `fk_production_lots_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_lots`
--

LOCK TABLES `production_lots` WRITE;
/*!40000 ALTER TABLE `production_lots` DISABLE KEYS */;
INSERT INTO `production_lots` VALUES (2,'LOT-001','tr','Approved','2026-02-20 08:09:24','2026-02-20 08:09:29',1);
/*!40000 ALTER TABLE `production_lots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(60) DEFAULT NULL,
  `product_name` varchar(50) DEFAULT NULL,
  `product_type` varchar(50) DEFAULT 'Product',
  `category` varchar(20) DEFAULT NULL,
  `sub_category` varchar(50) DEFAULT NULL,
  `super_sub_category` varchar(50) DEFAULT NULL,
  `hsn_code` varchar(50) DEFAULT NULL,
  `gst` decimal(5,2) DEFAULT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `brand_name` varchar(100) DEFAULT NULL,
  `uom` varchar(45) DEFAULT NULL,
  `boxes` varchar(45) DEFAULT NULL,
  `current_stock` decimal(10,2) DEFAULT '0.00',
  `minimum_stock` decimal(10,2) DEFAULT '0.00',
  `selling_price` decimal(10,2) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'hjse','hj','Product','rr','fgs','fd','89451',5.00,2.00,'1','RA','blue','puma',NULL,NULL,26.00,30.00,50.00,0.00,60.00,'','2025-10-19 16:54:18'),(4,'bn','kl','Product',NULL,NULL,NULL,'54',18.00,0.00,'3',NULL,NULL,NULL,NULL,NULL,1.00,0.00,0.00,0.00,0.00,'','2025-10-20 07:34:59'),(9,'dfg','wes','Product','gfs','ra',NULL,'843123',5.00,0.00,'6','RA','black',NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,'','2025-10-30 16:38:40'),(10,'hp','harry','Product','kl','nm',NULL,'48421',12.00,NULL,'7',NULL,NULL,NULL,NULL,NULL,20.00,21.00,100.00,0.00,120.00,'','2025-10-31 16:07:13'),(63,'htj','htj','Product','rr','vb',NULL,'50',5.00,0.00,'10',NULL,NULL,NULL,'PCS',NULL,0.00,0.00,0.00,0.00,0.00,NULL,'2026-02-15 13:53:49'),(64,'new','new','Product',NULL,NULL,NULL,'50',0.00,0.00,'200',NULL,NULL,NULL,'PCS',NULL,0.00,0.00,0.00,0.00,0.00,NULL,'2026-02-15 13:55:10'),(65,'S/J','S/J','Fabric','Fabric',NULL,NULL,NULL,5.00,0.00,'201',NULL,NULL,NULL,'KGS',NULL,0.00,0.00,12.00,0.00,0.00,'','2026-02-16 16:24:34');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(5,2) DEFAULT '0.00',
  `gst_percent` decimal(5,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
INSERT INTO `purchase_items` VALUES (56,35,'hjse',6.00,60.00,0.00,2.00,5.00,370.44,'2025-12-05 16:03:15'),(59,34,'hp',9.00,120.00,0.00,0.00,12.00,1209.60,'2025-12-05 16:36:42'),(60,34,'hjse',8.00,60.00,0.00,2.00,5.00,493.92,'2025-12-05 16:36:42');
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_return`
--

DROP TABLE IF EXISTS `purchase_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `purchase_return_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_return`
--

LOCK TABLES `purchase_return` WRITE;
/*!40000 ALTER TABLE `purchase_return` DISABLE KEYS */;
INSERT INTO `purchase_return` VALUES (1,'rajaa','rajaaa','2026-01-16','4564258','2026-01-17','Pending',2.40,0.00,0.00,123.00,'2026-01-09 19:19:30',0.00,0,'','res',2.00,0,2);
/*!40000 ALTER TABLE `purchase_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_return_items`
--

DROP TABLE IF EXISTS `purchase_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_return_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `purchase_return_id` (`purchase_return_id`),
  CONSTRAINT `purchase_return_items_ibfk_1` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_return` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_return_items`
--

LOCK TABLES `purchase_return_items` WRITE;
/*!40000 ALTER TABLE `purchase_return_items` DISABLE KEYS */;
INSERT INTO `purchase_return_items` VALUES (3,1,'hjse',2.00,60.00,0.00,2.00,5.00,123.48,'2026-01-09 19:20:12','None');
/*!40000 ALTER TABLE `purchase_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `purchase_person` varchar(255) DEFAULT NULL,
  `billing_address` text,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_purchases_year` (`year_id`),
  CONSTRAINT `fk_purchases_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (34,'fvc','','8432156','2025-04-10','2025-05-10','Pending','','',17.00,9.60,1704.00,'2025-12-05 15:22:00',0,2),(35,'ht','','894561','2025-12-05','2025-12-06','Pending','rajaaa','',6.00,7.20,370.00,'2025-12-05 16:03:15',0,2);
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation`
--

DROP TABLE IF EXISTS `quotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `quotation_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation`
--

LOCK TABLES `quotation` WRITE;
/*!40000 ALTER TABLE `quotation` DISABLE KEYS */;
INSERT INTO `quotation` VALUES (1,'rajaa','rajaaa','2026-01-08','4564258','2026-01-09','Pending',0.00,0.00,0.00,134.00,'2026-01-07 16:30:06',0.00,0,NULL,'res',1.00,0,2);
/*!40000 ALTER TABLE `quotation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation_items`
--

DROP TABLE IF EXISTS `quotation_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotation_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `quotation_id` (`quotation_id`),
  CONSTRAINT `quotation_items_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation_items`
--

LOCK TABLES `quotation_items` WRITE;
/*!40000 ALTER TABLE `quotation_items` DISABLE KEYS */;
INSERT INTO `quotation_items` VALUES (1,1,'hp',1.00,120.00,0.00,0.00,12.00,134.40,'2026-01-07 16:30:06','None');
/*!40000 ALTER TABLE `quotation_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) DEFAULT NULL,
  `TransactionDate` date DEFAULT NULL,
  `ModeOfPayment` varchar(100) DEFAULT NULL,
  `ReceiptRefNo` varchar(50) DEFAULT NULL,
  `TransactionAmount` decimal(10,2) DEFAULT NULL,
  `Details` text,
  `PaymentAgainst` varchar(100) DEFAULT NULL,
  `ReferenceNo` varchar(100) DEFAULT NULL,
  `BankAccountName` varchar(255) DEFAULT NULL,
  `AccountHead` varchar(255) DEFAULT NULL,
  `StaffName` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `upi_id` varchar(255) DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_receipts_year` (`year_id`),
  CONSTRAINT `fk_receipts_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
INSERT INTO `receipts` VALUES (1,'test','2024-02-02','cash','512',1200.00,'te','Invoice','454','HDFC Bank','sales','rajaaa','2025-11-11 14:25:37',NULL,1),(19,'mkd','2025-12-26','cash','5',134.00,'','Invoice','103','canar','sales','rajaaa','2025-12-27 14:05:37',NULL,2),(20,'mkd','2025-12-11','cash','5',50.00,'','Invoice','102','Cash','sales','rajaaa','2025-12-27 14:05:37',NULL,2),(24,'bn','2026-01-20','cash','510',60.00,'','Invoice','106','Cash','sales',NULL,'2026-01-20 15:50:29',NULL,2),(25,'mkd','2026-01-29','cash','50',600.00,'','Invoice','110','Cash','sales',NULL,'2026-01-29 14:58:04',NULL,2),(26,'mkd','2026-01-29','cash','541',21.00,'','Invoice','108','canar','sales',NULL,'2026-01-29 14:58:53',NULL,2),(27,'JK','2026-02-12','Cash',NULL,106.00,'Auto-generated receipt for Cash Invoice','Invoice','139',NULL,NULL,NULL,'2026-02-12 03:08:31',NULL,2),(28,'tg','2026-02-12','UPI',NULL,114.00,'Auto-generated receipt for Cash Invoice','Invoice','140','axis',NULL,'rajaaa','2026-02-12 03:16:00',NULL,2),(29,'hey','2026-02-12','Cash',NULL,51.00,'Auto-generated receipt for Cash Invoice','Invoice','142','',NULL,'','2026-02-12 15:15:43',NULL,2),(30,'tgr','2026-02-12','Cash',NULL,112.00,'Auto-generated receipt for Cash Invoice','Invoice','143','',NULL,'','2026-02-12 15:26:59',NULL,2),(31,'tgr','2026-02-12','Cash',NULL,100.00,'Auto-generated receipt for Cash Invoice','Invoice','145','',NULL,'','2026-02-12 16:42:20',NULL,2),(32,'tg','2026-02-14','cash','5',114.00,'','Invoice','141','test','sales',NULL,'2026-02-14 17:49:35',NULL,2),(33,'hey','2026-02-14','Cash',NULL,51.00,'Auto-generated receipt for Cash Invoice','Invoice','150','',NULL,'','2026-02-14 18:05:24',NULL,2),(36,'hey','2026-02-14','cash','1',100.00,'','Invoice','149','test','sales',NULL,'2026-02-14 18:07:34',NULL,2),(37,'hey','2026-02-14','cash','1',50.00,'','Invoice','151','test','sales',NULL,'2026-02-14 18:07:34',NULL,2);
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_return`
--

DROP TABLE IF EXISTS `sales_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `sales_return_date` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `gst_total` decimal(10,2) DEFAULT '0.00',
  `net_total` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `round_off` decimal(10,2) DEFAULT '0.00',
  `igst` tinyint(1) DEFAULT '0',
  `ship_to` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `is_inclusive` tinyint(1) DEFAULT '0',
  `year_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_return`
--

LOCK TABLES `sales_return` WRITE;
/*!40000 ALTER TABLE `sales_return` DISABLE KEYS */;
INSERT INTO `sales_return` VALUES (1,'mkd','rajaaa','2026-01-16','894561','2026-01-10','Pending',2.40,0.00,0.00,123.00,'2026-01-09 18:28:09',0.00,0,'','',2.00,0,2),(2,'mkd','rajaaa','2026-01-16','894561','2026-01-30','Pending',1.20,0.00,0.00,196.00,'2026-01-25 13:57:31',0.00,0,'','',2.00,0,2);
/*!40000 ALTER TABLE `sales_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_return_items`
--

DROP TABLE IF EXISTS `sales_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_return_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(10,2) DEFAULT '0.00',
  `disc_val` decimal(10,2) DEFAULT '0.00',
  `disc_percent` decimal(10,2) DEFAULT '0.00',
  `gst_percent` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_action` enum('Add','Reduce','None') DEFAULT 'None',
  PRIMARY KEY (`id`),
  KEY `sales_return_id` (`sales_return_id`),
  CONSTRAINT `sales_return_items_ibfk_1` FOREIGN KEY (`sales_return_id`) REFERENCES `sales_return` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_return_items`
--

LOCK TABLES `sales_return_items` WRITE;
/*!40000 ALTER TABLE `sales_return_items` DISABLE KEYS */;
INSERT INTO `sales_return_items` VALUES (2,1,'hjse',2.00,60.00,0.00,2.00,5.00,123.48,'2026-01-09 18:31:15','None'),(5,2,'hp',1.00,120.00,0.00,0.00,12.00,134.40,'2026-02-11 18:26:39','None'),(6,2,'hjse',1.00,60.00,0.00,2.00,5.00,60.00,'2026-02-11 18:26:39','None');
/*!40000 ALTER TABLE `sales_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
INSERT INTO `seasons` VALUES (1,'Summer','2026-02-17 20:44:14');
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size`
--

DROP TABLE IF EXISTS `size`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `size` (`size`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size`
--

LOCK TABLES `size` WRITE;
/*!40000 ALTER TABLE `size` DISABLE KEYS */;
INSERT INTO `size` VALUES (2,'A'),(6,'jg'),(9,'L'),(8,'M'),(3,'RA'),(7,'S');
/*!40000 ALTER TABLE `size` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size_chart_values`
--

DROP TABLE IF EXISTS `size_chart_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size_chart_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size_chart_id` int DEFAULT NULL,
  `size_value` varchar(50) NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `size_chart_id` (`size_chart_id`),
  CONSTRAINT `size_chart_values_ibfk_1` FOREIGN KEY (`size_chart_id`) REFERENCES `size_charts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size_chart_values`
--

LOCK TABLES `size_chart_values` WRITE;
/*!40000 ALTER TABLE `size_chart_values` DISABLE KEYS */;
INSERT INTO `size_chart_values` VALUES (1,1,'S',0,'2026-02-11 15:29:04'),(2,1,'M',0,'2026-02-11 15:29:04'),(3,1,'L',0,'2026-02-11 15:29:04'),(4,3,'S',0,'2026-02-21 15:29:39'),(5,3,'M',0,'2026-02-21 15:29:39'),(6,3,'L',0,'2026-02-21 15:29:39'),(7,3,'XL',0,'2026-02-21 15:29:39'),(8,4,'75',0,'2026-02-26 11:02:54'),(9,4,'80',0,'2026-02-26 11:02:54');
/*!40000 ALTER TABLE `size_chart_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size_charts`
--

DROP TABLE IF EXISTS `size_charts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size_charts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chart_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chart_name` (`chart_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size_charts`
--

LOCK TABLES `size_charts` WRITE;
/*!40000 ALTER TABLE `size_charts` DISABLE KEYS */;
INSERT INTO `size_charts` VALUES (1,'S-L','2026-02-11 15:29:04'),(3,'S-XL','2026-02-21 15:29:39'),(4,'75-80','2026-02-26 11:02:54');
/*!40000 ALTER TABLE `size_charts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size_quantity`
--

DROP TABLE IF EXISTS `size_quantity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size_quantity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `style_id` int DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `color_id` int DEFAULT NULL,
  `color_name` varchar(255) DEFAULT NULL,
  `size_chart_id` int DEFAULT NULL,
  `size_chart_name` varchar(255) DEFAULT NULL,
  `total_qty` decimal(10,2) DEFAULT '0.00',
  `excess_pct` decimal(10,2) DEFAULT '0.00',
  `final_qty` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size_quantity`
--

LOCK TABLES `size_quantity` WRITE;
/*!40000 ALTER TABLE `size_quantity` DISABLE KEYS */;
INSERT INTO `size_quantity` VALUES (3,NULL,NULL,NULL,NULL,NULL,1,NULL,300.00,2.00,306.00,'2026-02-20 12:24:17','2026-02-20 12:24:17'),(4,NULL,NULL,NULL,NULL,NULL,1,NULL,300.00,2.00,306.00,'2026-02-20 13:20:22','2026-02-20 13:20:22'),(5,NULL,NULL,NULL,NULL,NULL,1,'S-L',600.00,2.00,612.00,'2026-02-20 13:33:56','2026-02-20 13:33:56'),(28,NULL,NULL,NULL,NULL,NULL,1,'S-L',300.00,2.00,306.00,'2026-02-21 05:49:39','2026-02-21 05:49:39'),(29,NULL,NULL,NULL,NULL,NULL,1,'S-L',30.00,0.00,30.00,'2026-02-21 05:57:16','2026-02-21 05:57:16'),(31,6,NULL,NULL,NULL,NULL,1,'S-L',300.00,2.00,306.00,'2026-02-21 06:12:10','2026-02-21 06:12:10'),(49,7,NULL,NULL,NULL,NULL,1,'S-L',30.00,0.00,30.00,'2026-02-21 14:54:44','2026-02-21 14:54:44'),(73,1,NULL,NULL,NULL,NULL,1,'S-L',300.00,2.00,306.00,'2026-02-22 09:38:44','2026-02-22 09:38:44'),(74,2,NULL,NULL,NULL,NULL,3,'S-XL',400.00,2.00,408.00,'2026-02-22 09:39:37','2026-02-22 09:39:37'),(79,3,NULL,NULL,NULL,NULL,1,'S-L',300.00,2.00,306.00,'2026-02-23 10:47:54','2026-02-23 10:47:54'),(81,4,NULL,NULL,NULL,NULL,1,'S-L',300.00,0.00,300.00,'2026-02-23 10:57:58','2026-02-23 10:57:58'),(85,5,NULL,NULL,NULL,NULL,1,'S-L',300.00,0.00,300.00,'2026-02-23 19:35:11','2026-02-23 19:35:11'),(86,10,NULL,NULL,NULL,NULL,3,'S-XL',600.00,2.00,612.00,'2026-02-24 15:16:01','2026-02-24 15:16:01'),(93,21,NULL,NULL,NULL,NULL,3,'S-XL',4800.00,2.00,4896.00,'2026-02-27 13:16:35','2026-02-27 13:16:35');
/*!40000 ALTER TABLE `size_quantity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size_quantity_items`
--

DROP TABLE IF EXISTS `size_quantity_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size_quantity_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size_quantity_id` int DEFAULT NULL,
  `style_name` varchar(255) DEFAULT NULL,
  `style_part` varchar(100) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `pcs_qty` decimal(10,2) DEFAULT '0.00',
  `sizes_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `size_quantity_id` (`size_quantity_id`),
  CONSTRAINT `size_quantity_items_ibfk_1` FOREIGN KEY (`size_quantity_id`) REFERENCES `size_quantity` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size_quantity_items`
--

LOCK TABLES `size_quantity_items` WRITE;
/*!40000 ALTER TABLE `size_quantity_items` DISABLE KEYS */;
INSERT INTO `size_quantity_items` VALUES (3,3,'test','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-20 12:24:17'),(4,4,'Test','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-20 13:20:22'),(5,5,'Test','Top','red',600.00,'{\"L\": 200, \"M\": 200, \"S\": 200}','2026-02-20 13:33:56'),(28,28,'ST','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-21 05:49:39'),(29,29,'test','Top','red',30.00,'{\"L\": 10, \"M\": 10, \"S\": 10}','2026-02-21 05:57:16'),(31,31,'Test','Top','blue',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-21 06:12:10'),(49,49,'test','Top','red',30.00,'{\"L\": 10, \"M\": 10, \"S\": 10}','2026-02-21 14:54:44'),(78,73,'BN','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-22 09:38:44'),(79,74,'gh','Top','blue',400.00,'{\"L\": 100, \"M\": 100, \"S\": 100, \"XL\": 100}','2026-02-22 09:39:37'),(84,79,'jt','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-23 10:47:54'),(86,81,'JK','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-23 10:57:58'),(90,85,'FT','Top','red',300.00,'{\"L\": 100, \"M\": 100, \"S\": 100}','2026-02-23 19:35:11'),(91,86,'VG','Top','Green',600.00,'{\"L\": 150, \"M\": 150, \"S\": 150, \"XL\": 150}','2026-02-24 15:16:01'),(100,93,'VB','Top','red',4800.00,'{\"L\": 1200, \"M\": 1200, \"S\": 1200, \"XL\": 1200}','2026-02-27 13:16:35');
/*!40000 ALTER TABLE `size_quantity_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `country_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `country_id` (`country_id`),
  CONSTRAINT `states_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,1,'Tamil Nadu'),(2,1,'Karnataka'),(3,1,'Maharashtra'),(4,2,'California'),(5,2,'Texas'),(6,2,'New York'),(7,3,'London'),(8,3,'Manchester'),(9,3,'Liverpool'),(11,11,'test state');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_fabrics`
--

DROP TABLE IF EXISTS `style_fabrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_fabrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `style_id` int NOT NULL,
  `style_part` varchar(255) DEFAULT NULL,
  `fabric_sku` varchar(255) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `body_part` varchar(255) DEFAULT NULL,
  `counts` varchar(255) DEFAULT NULL,
  `dia_chart_id` int DEFAULT NULL,
  `dia_data` json DEFAULT NULL,
  `size_data` json DEFAULT NULL,
  `avg_weight` decimal(10,3) DEFAULT '0.000',
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `composition` varchar(255) DEFAULT NULL,
  `fabric_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `style_id` (`style_id`),
  CONSTRAINT `style_fabrics_ibfk_1` FOREIGN KEY (`style_id`) REFERENCES `style_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_fabrics`
--

LOCK TABLES `style_fabrics` WRITE;
/*!40000 ALTER TABLE `style_fabrics` DISABLE KEYS */;
INSERT INTO `style_fabrics` VALUES (28,20,'Top','20s-single-jersey-200-24-red','Single Jersey','Front','20S',NULL,'{}','{\"L\": \"0.2500\", \"M\": \"0.2500\", \"S\": \"0.2500\", \"XL\": \"0.2500\"}',0.250,'200','24','red','100%cotton','Fabric'),(29,21,'Top','20s-single-jersey-200-24-red','Single Jersey','Front','20S',NULL,'{}','{\"L\": \"0.2600\", \"M\": \"0.2600\", \"S\": \"0.2600\", \"XL\": \"0.2600\"}',0.260,'200','24','red','100%cotton','Fabric'),(30,22,'Top','20s-single-jersey-200-24-red','Single Jersey','Front','20S',NULL,'{}','{\"L\": \"0.2500\", \"M\": \"0.2500\", \"S\": \"0.2500\", \"XL\": \"0.2500\"}',0.250,'200','24','red','100%cotton','Fabric'),(31,23,'Top','20s-fleece-120-20-blue','Fleece','Top','20S',NULL,'{}','{\"L\": \"0.1500\", \"M\": \"0.1500\", \"S\": \"0.1500\", \"XL\": \"0.1500\"}',0.150,'120','20','blue','100%cotton','Fabric'),(32,24,'Top','20s-single-jersey-200-24-red','Single Jersey','Front','20S',NULL,'{}','{\"L\": \"0.2400\", \"M\": \"0.2400\", \"S\": \"0.2400\"}',0.240,'200','24','red','100%cotton','Fabric'),(33,25,'Top','20s-s/j-200-12-green','S/J','Top','20S',NULL,'{}','{\"L\": \"0.1600\", \"M\": \"0.1600\", \"S\": \"0.1600\", \"XL\": \"0.1600\"}',0.160,'200','12','Green','100%Cotton','Fabric'),(34,26,'Top','20s-s/j-200-12-red','S/J','TOP','20S',NULL,'{}','{\"L\": \"0.1200\", \"M\": \"0.1200\", \"S\": \"0.1200\", \"XL\": \"0.1200\"}',0.120,'200','12','red','100%Cotton','Fabric');
/*!40000 ALTER TABLE `style_fabrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_planning`
--

DROP TABLE IF EXISTS `style_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `style_name` varchar(255) NOT NULL,
  `style_color` varchar(100) DEFAULT NULL,
  `size_chart_id` int DEFAULT NULL,
  `size_chart_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Planned',
  `life_cycle` json DEFAULT NULL,
  `style_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `average_weight` decimal(10,3) DEFAULT '0.000',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_style_name_color` (`style_name`,`style_color`),
  KEY `fk_style_planning_year` (`year_id`),
  CONSTRAINT `fk_style_planning_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_planning`
--

LOCK TABLES `style_planning` WRITE;
/*!40000 ALTER TABLE `style_planning` DISABLE KEYS */;
INSERT INTO `style_planning` VALUES (20,'ORD-0001','',3,'S-XL','Planned','[{\"id\": 175, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"Knitting\", \"process_type\": \"yarn\"}, {\"id\": 176, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 2, \"wastage_pct\": \"0.00\", \"process_name\": \"Dyeing\", \"process_type\": \"fabric\"}, {\"id\": 177, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 3, \"wastage_pct\": \"0.00\", \"process_name\": \"Compacting\", \"process_type\": \"fabric\"}, {\"id\": 178, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 4, \"wastage_pct\": \"0.00\", \"process_name\": \"Cutting\", \"process_type\": \"pcs\"}, {\"id\": 179, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 5, \"wastage_pct\": \"0.00\", \"process_name\": \"Stitching\", \"process_type\": \"pcs\"}, {\"id\": 180, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 6, \"wastage_pct\": \"0.00\", \"process_name\": \"Checking\", \"process_type\": \"pcs\"}, {\"id\": 181, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 7, \"wastage_pct\": \"0.00\", \"process_name\": \"Ironing\", \"process_type\": \"pcs\"}, {\"id\": 182, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 8, \"wastage_pct\": \"0.00\", \"process_name\": \"Packing\", \"process_type\": \"pcs\"}]',NULL,'2026-02-21 18:50:03',0.000,'2026-02-21 18:50:03',1),(21,'Test','',3,'S-XL','Planned','[{\"id\": 184, \"order_id\": 20, \"created_at\": \"2026-02-22T08:38:09.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"\", \"process_type\": null}]',NULL,'2026-02-22 08:38:21',0.000,'2026-02-22 08:38:21',1),(22,'TG','',3,'S-XL','Planned','[{\"id\": 175, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"Knitting\", \"process_type\": \"yarn\"}, {\"id\": 176, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 2, \"wastage_pct\": \"0.00\", \"process_name\": \"Dyeing\", \"process_type\": \"fabric\"}, {\"id\": 177, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 3, \"wastage_pct\": \"0.00\", \"process_name\": \"Compacting\", \"process_type\": \"fabric\"}, {\"id\": 178, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 4, \"wastage_pct\": \"0.00\", \"process_name\": \"Cutting\", \"process_type\": \"pcs\"}, {\"id\": 179, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 5, \"wastage_pct\": \"0.00\", \"process_name\": \"Stitching\", \"process_type\": \"pcs\"}, {\"id\": 180, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 6, \"wastage_pct\": \"0.00\", \"process_name\": \"Checking\", \"process_type\": \"pcs\"}, {\"id\": 181, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 7, \"wastage_pct\": \"0.00\", \"process_name\": \"Ironing\", \"process_type\": \"pcs\"}, {\"id\": 182, \"order_id\": 19, \"created_at\": \"2026-02-21T18:48:21.000Z\", \"custom_name\": null, \"sequence_no\": 8, \"wastage_pct\": \"0.00\", \"process_name\": \"Packing\", \"process_type\": \"pcs\"}]',NULL,'2026-02-22 09:19:02',0.000,'2026-02-22 09:19:02',1),(23,'45','',3,'S-XL','Planned','[{\"id\": 185, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"Knitting\", \"process_type\": \"yarn\"}, {\"id\": 186, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 2, \"wastage_pct\": \"0.00\", \"process_name\": \"Dyeing\", \"process_type\": \"fabric\"}, {\"id\": 187, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 3, \"wastage_pct\": \"0.00\", \"process_name\": \"Compacting\", \"process_type\": \"fabric\"}, {\"id\": 188, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 4, \"wastage_pct\": \"0.00\", \"process_name\": \"Cutting\", \"process_type\": \"pcs\"}, {\"id\": 189, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 5, \"wastage_pct\": \"0.00\", \"process_name\": \"Stitching\", \"process_type\": \"pcs\"}, {\"id\": 190, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 6, \"wastage_pct\": \"0.00\", \"process_name\": \"Checking\", \"process_type\": \"pcs\"}, {\"id\": 191, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 7, \"wastage_pct\": \"0.00\", \"process_name\": \"Ironing\", \"process_type\": \"pcs\"}, {\"id\": 192, \"order_id\": 2, \"created_at\": \"2026-02-22T09:40:29.000Z\", \"custom_name\": null, \"sequence_no\": 8, \"wastage_pct\": \"0.00\", \"process_name\": \"Packing\", \"process_type\": \"pcs\"}]',NULL,'2026-02-22 09:40:36',0.000,'2026-02-22 09:40:36',1),(24,'NM','',1,'S-L','Planned','[{\"id\": 209, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"Knitting\", \"process_type\": \"yarn\"}, {\"id\": 210, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 2, \"wastage_pct\": \"0.00\", \"process_name\": \"Dyeing\", \"process_type\": \"fabric\"}, {\"id\": 211, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 3, \"wastage_pct\": \"0.00\", \"process_name\": \"Compacting\", \"process_type\": \"fabric\"}, {\"id\": 212, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 4, \"wastage_pct\": \"0.00\", \"process_name\": \"Cutting\", \"process_type\": \"pcs\"}, {\"id\": 213, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 5, \"wastage_pct\": \"0.00\", \"process_name\": \"Stitching\", \"process_type\": \"pcs\"}, {\"id\": 214, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 6, \"wastage_pct\": \"0.00\", \"process_name\": \"Checking\", \"process_type\": \"pcs\"}, {\"id\": 215, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 7, \"wastage_pct\": \"0.00\", \"process_name\": \"Ironing\", \"process_type\": \"pcs\"}, {\"id\": 216, \"order_id\": 5, \"created_at\": \"2026-02-23T19:36:11.000Z\", \"custom_name\": null, \"sequence_no\": 8, \"wastage_pct\": \"0.00\", \"process_name\": \"Packing\", \"process_type\": \"pcs\"}]',NULL,'2026-02-23 19:36:20',0.000,'2026-02-23 19:36:20',1),(25,'nj','',3,'S-XL','Planned','[{\"id\": 233, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"Knitting\", \"process_type\": \"yarn\"}, {\"id\": 234, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 2, \"wastage_pct\": \"0.00\", \"process_name\": \"Dyeing\", \"process_type\": \"fabric\"}, {\"id\": 235, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 3, \"wastage_pct\": \"0.00\", \"process_name\": \"Compacting\", \"process_type\": \"fabric\"}, {\"id\": 236, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 4, \"wastage_pct\": \"0.00\", \"process_name\": \"Cutting\", \"process_type\": \"pcs\"}, {\"id\": 237, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 5, \"wastage_pct\": \"0.00\", \"process_name\": \"Stitching\", \"process_type\": \"pcs\"}, {\"id\": 238, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 6, \"wastage_pct\": \"0.00\", \"process_name\": \"Checking\", \"process_type\": \"pcs\"}, {\"id\": 239, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 7, \"wastage_pct\": \"0.00\", \"process_name\": \"Ironing\", \"process_type\": \"pcs\"}, {\"id\": 240, \"order_id\": 10, \"created_at\": \"2026-02-24T15:17:33.000Z\", \"custom_name\": null, \"sequence_no\": 8, \"wastage_pct\": \"0.00\", \"process_name\": \"Packing\", \"process_type\": \"pcs\"}]',NULL,'2026-02-24 15:17:50',0.000,'2026-02-24 15:17:50',1),(26,'TN','',3,'S-XL','Planned','[{\"id\": 249, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 1, \"wastage_pct\": \"0.00\", \"process_name\": \"Knitting\", \"process_type\": \"yarn\"}, {\"id\": 250, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 2, \"wastage_pct\": \"0.00\", \"process_name\": \"Dyeing\", \"process_type\": \"fabric\"}, {\"id\": 251, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 3, \"wastage_pct\": \"0.00\", \"process_name\": \"Compacting\", \"process_type\": \"fabric\"}, {\"id\": 252, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 4, \"wastage_pct\": \"0.00\", \"process_name\": \"Cutting\", \"process_type\": \"pcs\"}, {\"id\": 253, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 5, \"wastage_pct\": \"0.00\", \"process_name\": \"Stitching\", \"process_type\": \"pcs\"}, {\"id\": 254, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 6, \"wastage_pct\": \"0.00\", \"process_name\": \"Checking\", \"process_type\": \"pcs\"}, {\"id\": 255, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 7, \"wastage_pct\": \"0.00\", \"process_name\": \"Ironing\", \"process_type\": \"pcs\"}, {\"id\": 256, \"order_id\": 21, \"created_at\": \"2026-02-27T13:17:17.000Z\", \"custom_name\": null, \"sequence_no\": 8, \"wastage_pct\": \"0.00\", \"process_name\": \"Packing\", \"process_type\": \"pcs\"}]',NULL,'2026-02-27 13:17:24',0.000,'2026-02-27 13:17:24',1);
/*!40000 ALTER TABLE `style_planning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_trims`
--

DROP TABLE IF EXISTS `style_trims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_trims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `style_id` int NOT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `trims_sku` varchar(255) DEFAULT NULL,
  `is_sizable` varchar(50) DEFAULT NULL,
  `size_data` json DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `style_id` (`style_id`),
  CONSTRAINT `style_trims_ibfk_1` FOREIGN KEY (`style_id`) REFERENCES `style_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_trims`
--

LOCK TABLES `style_trims` WRITE;
/*!40000 ALTER TABLE `style_trims` DISABLE KEYS */;
INSERT INTO `style_trims` VALUES (37,20,'button','button','Non-Sizable','{}',''),(38,22,'button','button','Non-Sizable','{}',''),(39,24,'Rope','Rope','Non-Sizable','{}',''),(40,25,'Button','Button','Non-Sizable','{\"L\": \"1\", \"M\": \"1\", \"S\": \"1\", \"XL\": \"1\"}',''),(41,25,'Size Label','Size-Label','Non-Sizable','{\"L\": \"1\", \"M\": \"1\", \"S\": \"1\", \"XL\": \"1\"}','');
/*!40000 ALTER TABLE `style_trims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_yarns`
--

DROP TABLE IF EXISTS `style_yarns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_yarns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `style_id` int NOT NULL,
  `fabric_id_ref` varchar(255) DEFAULT NULL,
  `fabric_sku` varchar(255) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `yarn_counts` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `yarn_color` varchar(100) DEFAULT NULL,
  `consumption` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `style_id` (`style_id`),
  CONSTRAINT `style_yarns_ibfk_1` FOREIGN KEY (`style_id`) REFERENCES `style_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_yarns`
--

LOCK TABLES `style_yarns` WRITE;
/*!40000 ALTER TABLE `style_yarns` DISABLE KEYS */;
INSERT INTO `style_yarns` VALUES (24,20,'28','single-jersey','Single Jersey','30s','Rl','','100.000'),(25,22,'30','single-jersey','Single Jersey','30s','Rl','','100.000'),(26,23,'31','fleece','Fleece','20S','GT','','100.000'),(27,24,'32','single-jersey','Single Jersey','30s','Rl','','100.000'),(28,25,'33','s/j','S/J','20S','Combed Cotton','','100.000'),(29,26,'34','s/j','S/J','20S','VL','','100.000');
/*!40000 ALTER TABLE `style_yarns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_categories`
--

DROP TABLE IF EXISTS `sub_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sub_category` (`sub_category`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_categories`
--

LOCK TABLES `sub_categories` WRITE;
/*!40000 ALTER TABLE `sub_categories` DISABLE KEYS */;
INSERT INTO `sub_categories` VALUES (6,'fgs'),(3,'ra'),(1,'sd'),(8,'vb');
/*!40000 ALTER TABLE `sub_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `super_sub_categories`
--

DROP TABLE IF EXISTS `super_sub_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `super_sub_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `super_sub_category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `super_sub_category` (`super_sub_category`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_sub_categories`
--

LOCK TABLES `super_sub_categories` WRITE;
/*!40000 ALTER TABLE `super_sub_categories` DISABLE KEYS */;
INSERT INTO `super_sub_categories` VALUES (7,'fd'),(1,'hj'),(3,'ra'),(6,'vn');
/*!40000 ALTER TABLE `super_sub_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `whatsapp_no` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `cin` varchar(45) DEFAULT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `contact_type` varchar(50) DEFAULT NULL,
  `receivable_opening_balance` decimal(10,2) DEFAULT NULL,
  `payable_opening_balance` decimal(10,2) DEFAULT NULL,
  `bank_name` varchar(45) DEFAULT NULL,
  `branch` varchar(45) DEFAULT NULL,
  `account_number` varchar(45) DEFAULT NULL,
  `ifsc_code` varchar(45) DEFAULT NULL,
  `upi_name` varchar(45) DEFAULT NULL,
  `upi_id` varchar(45) DEFAULT NULL,
  `gst_tin` varchar(50) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `billing_country` varchar(100) DEFAULT NULL,
  `billing_state` varchar(100) DEFAULT NULL,
  `billing_city` varchar(100) DEFAULT NULL,
  `billing_zip` varchar(20) DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT NULL,
  `shipping_state` varchar(100) DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_zip` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (1,'ht','894561','541','ht@gmail.com',NULL,NULL,NULL,NULL,100.00,NULL,NULL,NULL,NULL,NULL,NULL,'5',NULL,NULL,'Tamilnadu','Chennai',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19 11:57:10'),(7,'fvc','8432156','','',NULL,0.00,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','','','','','','','','','','','2025-10-30 16:39:39'),(8,'nm','84352153','','',NULL,0.00,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','','','','','','','','','','','2025-11-06 18:00:36'),(10,'test sup','8946321','','',NULL,0.00,'',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'','tst','India','Tamil Nadu','Chennai','94512','tst','India','Tamil Nadu','Chennai','94512','2026-01-16 07:59:13'),(12,'jkl','864321','564321','','20',0.00,'supplier',0.00,0.00,'JKL','TUP','864321','53412','JKL','455','33AGKJJ','','','','','','','','','','','2026-02-02 17:17:11'),(13,'Hello','842312',NULL,NULL,NULL,0.00,NULL,0.00,10.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-11 02:40:43');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_name` varchar(100) NOT NULL,
  `stock_action` varchar(50) NOT NULL,
  `is_sku` tinyint(1) DEFAULT '1',
  `is_inclusive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (10,'invoice','none',1,0),(11,'purchase','add',1,0),(12,'quotation','none',1,0),(14,'dc','reduce',1,0),(15,'po','none',1,0),(16,'grn','add',1,0),(17,'pi','none',1,0),(18,'estimate','none',1,0),(19,'salesreturn','add',1,0),(20,'purchasereturn','reduce',1,0),(21,'creditnote','none',1,0),(22,'debitnote','none',1,0),(24,'Inward','add',1,0);
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tna_headers`
--

DROP TABLE IF EXISTS `tna_headers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tna_headers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(100) NOT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `customer_name` varchar(200) DEFAULT NULL,
  `style_name` varchar(200) DEFAULT NULL,
  `order_qty` int DEFAULT '0',
  `overall_due_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'In Progress',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tna_headers`
--

LOCK TABLES `tna_headers` WRITE;
/*!40000 ALTER TABLE `tna_headers` DISABLE KEYS */;
INSERT INTO `tna_headers` VALUES (2,'6','nj','kia','nj',600,'2026-02-20','In Progress','2026-02-25 09:43:50',2);
/*!40000 ALTER TABLE `tna_headers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tna_process_master`
--

DROP TABLE IF EXISTS `tna_process_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tna_process_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_name` varchar(255) NOT NULL,
  `sequence_no` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `process_name` (`process_name`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tna_process_master`
--

LOCK TABLES `tna_process_master` WRITE;
/*!40000 ALTER TABLE `tna_process_master` DISABLE KEYS */;
INSERT INTO `tna_process_master` VALUES (13,'Yarn',1,'2026-02-25 09:41:47'),(14,'Knitting',2,'2026-02-25 09:41:59'),(15,'Dyeing',3,'2026-02-25 09:42:05'),(16,'Compacting',4,'2026-02-25 09:42:13'),(17,'Cutting',5,'2026-02-25 09:42:20'),(18,'Stitching',6,'2026-02-25 09:42:30'),(19,'Checking',7,'2026-02-25 09:42:44');
/*!40000 ALTER TABLE `tna_process_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tna_processes`
--

DROP TABLE IF EXISTS `tna_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tna_processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tna_id` int NOT NULL,
  `sequence_no` int DEFAULT '0',
  `process_name` varchar(100) NOT NULL,
  `assigned_member_id` int DEFAULT NULL,
  `assigned_member_name` varchar(200) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `exceptional_days` int DEFAULT '0',
  `completed_qty` int DEFAULT '0',
  `status` enum('Not Started','In Progress','Completed','Delayed') DEFAULT 'Not Started',
  `completion_date` date DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `tna_id` (`tna_id`),
  CONSTRAINT `tna_processes_ibfk_1` FOREIGN KEY (`tna_id`) REFERENCES `tna_headers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tna_processes`
--

LOCK TABLES `tna_processes` WRITE;
/*!40000 ALTER TABLE `tna_processes` DISABLE KEYS */;
INSERT INTO `tna_processes` VALUES (9,2,1,'Yarn',3,'raja','2026-02-25',2,60,'Completed','2026-02-25',''),(10,2,2,'Knitting',3,'raja','2026-02-27',1,0,'Completed','2026-02-25',''),(11,2,3,'Dyeing',4,'test','2026-02-28',2,0,'Not Started',NULL,''),(12,2,4,'Compacting',3,'raja','2026-03-02',3,0,'Not Started',NULL,''),(13,2,5,'Cutting',3,'raja','2026-03-05',0,0,'Not Started',NULL,'');
/*!40000 ALTER TABLE `tna_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims`
--

DROP TABLE IF EXISTS `trims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trims_name` varchar(255) DEFAULT NULL,
  `trims_sku` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `uom` varchar(50) DEFAULT NULL,
  `is_sizable` tinyint(1) DEFAULT '0',
  `size_chart_id` int DEFAULT NULL,
  `current_stock` decimal(10,2) DEFAULT '0.00',
  `minimum_stock` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `trims_sku` (`trims_sku`),
  KEY `size_chart_id` (`size_chart_id`),
  KEY `fk_trims_year` (`year_id`),
  CONSTRAINT `fk_trims_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`),
  CONSTRAINT `trims_ibfk_1` FOREIGN KEY (`size_chart_id`) REFERENCES `size_charts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims`
--

LOCK TABLES `trims` WRITE;
/*!40000 ALTER TABLE `trims` DISABLE KEYS */;
INSERT INTO `trims` VALUES (33,'button','button','','Pcs',0,NULL,0.00,0.00,'2026-02-21 18:50:03',1),(34,'Rope','rope','','Pcs',0,NULL,0.00,0.00,'2026-02-23 19:36:21',1),(35,'Size Label','size-label','','Pcs',0,NULL,0.00,0.00,'2026-02-24 15:17:50',1);
/*!40000 ALTER TABLE `trims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_direct_inward`
--

DROP TABLE IF EXISTS `trims_direct_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_direct_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(50) NOT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inward_no` (`inward_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_direct_inward`
--

LOCK TABLES `trims_direct_inward` WRITE;
/*!40000 ALTER TABLE `trims_direct_inward` DISABLE KEYS */;
/*!40000 ALTER TABLE `trims_direct_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_direct_inward_items`
--

DROP TABLE IF EXISTS `trims_direct_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_direct_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `trims_direct_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `trims_direct_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_direct_inward_items`
--

LOCK TABLES `trims_direct_inward_items` WRITE;
/*!40000 ALTER TABLE `trims_direct_inward_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `trims_direct_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_grn`
--

DROP TABLE IF EXISTS `trims_grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `grn_date` datetime DEFAULT NULL,
  `dc_no` varchar(100) DEFAULT NULL,
  `dc_date` datetime DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `po_no` varchar(100) DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_no` (`grn_no`),
  KEY `fk_trims_grn_year` (`year_id`),
  CONSTRAINT `fk_trims_grn_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_grn`
--

LOCK TABLES `trims_grn` WRITE;
/*!40000 ALTER TABLE `trims_grn` DISABLE KEYS */;
/*!40000 ALTER TABLE `trims_grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_grn_items`
--

DROP TABLE IF EXISTS `trims_grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_id` int DEFAULT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `trims_sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grn_id` (`grn_id`),
  CONSTRAINT `trims_grn_items_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `trims_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_grn_items`
--

LOCK TABLES `trims_grn_items` WRITE;
/*!40000 ALTER TABLE `trims_grn_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `trims_grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_planning`
--

DROP TABLE IF EXISTS `trims_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `style_part` varchar(50) DEFAULT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `trim_type` enum('Sizeable','Non-Sizeable') DEFAULT NULL,
  `qty_per_pcs` decimal(10,3) DEFAULT '0.000',
  `consumption_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `trims_planning_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_planning`
--

LOCK TABLES `trims_planning` WRITE;
/*!40000 ALTER TABLE `trims_planning` DISABLE KEYS */;
INSERT INTO `trims_planning` VALUES (39,5,'Top','Rope','','Non-Sizeable',0.200,'{}','2026-02-23 19:35:53'),(40,10,'Top','Button','','Sizeable',1.000,'{\"L\": \"1\", \"M\": \"1\", \"S\": \"1\", \"XL\": \"1\"}','2026-02-24 15:17:25'),(41,10,'Top','Size Label','','Sizeable',1.000,'{\"L\": \"1\", \"M\": \"1\", \"S\": \"1\", \"XL\": \"1\"}','2026-02-24 15:17:25');
/*!40000 ALTER TABLE `trims_planning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_po`
--

DROP TABLE IF EXISTS `trims_po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_no` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_igst` tinyint(1) DEFAULT '0',
  `round_off` decimal(10,2) DEFAULT '0.00',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_no` (`po_no`),
  KEY `fk_trims_po_year` (`year_id`),
  CONSTRAINT `fk_trims_po_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_po`
--

LOCK TABLES `trims_po` WRITE;
/*!40000 ALTER TABLE `trims_po` DISABLE KEYS */;
/*!40000 ALTER TABLE `trims_po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trims_po_items`
--

DROP TABLE IF EXISTS `trims_po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trims_po_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int DEFAULT NULL,
  `trims_name` varchar(255) DEFAULT NULL,
  `trims_sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `gst_per` decimal(10,2) DEFAULT '0.00',
  `total` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `trims_po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `trims_po` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trims_po_items`
--

LOCK TABLES `trims_po_items` WRITE;
/*!40000 ALTER TABLE `trims_po_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `trims_po_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uom`
--

DROP TABLE IF EXISTS `uom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uom` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uom`
--

LOCK TABLES `uom` WRITE;
/*!40000 ALTER TABLE `uom` DISABLE KEYS */;
INSERT INTO `uom` VALUES (2,'KGS'),(3,'Meter'),(1,'PCS');
/*!40000 ALTER TABLE `uom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'User','2026-01-16 08:11:24'),(2,'Admin','2026-01-16 08:11:24'),(4,'Accounts','2026-01-16 08:23:43');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'raja','$2b$10$sRngu4b1RZJrOjPkoSudpen7kJEtFyl32Z4PNKYxGqP.gek.y/SZC','raja','raja@gmail.com','Admin'),(4,'test','$2b$10$fwej98cc9AT5De09v43xN..F2rLxM9dpdzH16hWQqHfcbXGnUiX8y','test','test@gmail.com','user'),(7,'tes1','$2b$10$lIUZNElEr4/hwEJKp/kkMOSK9l.46paYEoljmDmEAxmFCxWDGASzq','test1','test@gmail.com','Accounts');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_sequences`
--

DROP TABLE IF EXISTS `voucher_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_sequences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year_id` int NOT NULL,
  `voucher_type` varchar(50) NOT NULL,
  `prefix` varchar(20) DEFAULT NULL,
  `last_no` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_year` (`voucher_type`,`year_id`),
  KEY `year_id` (`year_id`),
  CONSTRAINT `voucher_sequences_ibfk_1` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_sequences`
--

LOCK TABLES `voucher_sequences` WRITE;
/*!40000 ALTER TABLE `voucher_sequences` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `SupplierName` varchar(255) DEFAULT NULL,
  `VoucherDate` date NOT NULL,
  `VoucherRefNo` varchar(100) NOT NULL,
  `AccountHead` varchar(255) NOT NULL,
  `BankAccountName` varchar(255) DEFAULT NULL,
  `ModeOfPayment` varchar(150) NOT NULL,
  `StaffName` varchar(255) DEFAULT NULL,
  `Details` text,
  `PaymentAgainst` varchar(100) DEFAULT NULL,
  `ReferenceNo` varchar(150) DEFAULT NULL,
  `Amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_vouchers_year` (`year_id`),
  CONSTRAINT `fk_vouchers_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (1,'nm','2025-02-25','5231','sales','canar','cash','','','','',500.00,'2025-11-19 14:41:35',1),(2,'fvc','2025-02-26','21','sales','Cash','UPI',NULL,'sd','Purchase Bill','3',200.00,'2025-11-19 16:45:06',1),(3,'ht','2025-11-23','784','sales','canar','cash',NULL,'','Purchase Bill','',800.00,'2025-11-24 16:24:24',1),(4,'fvc','2026-01-27','','sales','Cash','cash',NULL,'','Other','',10.00,'2026-01-28 17:28:37',1),(5,'ht','2026-02-14','','sales','test','cash','rajaaa','','Other','',100.00,'2026-02-14 17:52:35',1);
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn`
--

DROP TABLE IF EXISTS `yarn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `yarn_sku` varchar(255) DEFAULT NULL,
  `counts` varchar(255) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `composition` varchar(255) DEFAULT NULL,
  `current_stock` decimal(10,2) DEFAULT '0.00',
  `minimum_stock` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `yarn_sku` (`yarn_sku`),
  KEY `fk_yarn_year` (`year_id`),
  CONSTRAINT `fk_yarn_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn`
--

LOCK TABLES `yarn` WRITE;
/*!40000 ALTER TABLE `yarn` DISABLE KEYS */;
INSERT INTO `yarn` VALUES (16,'30s-rl','30s','Rl','',NULL,10.00,0.00,'2026-02-21 18:50:03',1),(17,'20s-gt','20S','GT','',NULL,0.00,0.00,'2026-02-22 09:40:37',1),(18,'20s-combed-cotton','20S','Combed Cotton','',NULL,0.00,0.00,'2026-02-24 15:17:50',1),(19,'20s-vl','20S','VL','',NULL,0.00,0.00,'2026-02-27 13:17:25',1);
/*!40000 ALTER TABLE `yarn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_direct_inward`
--

DROP TABLE IF EXISTS `yarn_direct_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_direct_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(50) NOT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `inward_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inward_no` (`inward_no`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_direct_inward`
--

LOCK TABLES `yarn_direct_inward` WRITE;
/*!40000 ALTER TABLE `yarn_direct_inward` DISABLE KEYS */;
INSERT INTO `yarn_direct_inward` VALUES (1,'YI-0001','','fvc','2026-03-02','rajaaa','','2026-03-02 17:37:35');
/*!40000 ALTER TABLE `yarn_direct_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_direct_inward_items`
--

DROP TABLE IF EXISTS `yarn_direct_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_direct_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `yarn_direct_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `yarn_direct_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_direct_inward_items`
--

LOCK TABLES `yarn_direct_inward_items` WRITE;
/*!40000 ALTER TABLE `yarn_direct_inward_items` DISABLE KEYS */;
INSERT INTO `yarn_direct_inward_items` VALUES (1,1,'30s-rl','Rl',10.00);
/*!40000 ALTER TABLE `yarn_direct_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_dyeing_inward`
--

DROP TABLE IF EXISTS `yarn_dyeing_inward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_dyeing_inward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_no` varchar(30) NOT NULL,
  `inward_type` enum('order','lot','internal') NOT NULL,
  `inward_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(200) DEFAULT NULL,
  `internal_lot_no` varchar(100) DEFAULT NULL,
  `internal_lot_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT 'Yarn Dyeing',
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_qty` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_dyeing_inward`
--

LOCK TABLES `yarn_dyeing_inward` WRITE;
/*!40000 ALTER TABLE `yarn_dyeing_inward` DISABLE KEYS */;
INSERT INTO `yarn_dyeing_inward` VALUES (6,'YDI-ORD-0001','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'test sup',NULL,'Knitting',NULL,'rajaaa',NULL,8.000,'2026-02-19 12:44:57',2),(7,'YDI-ORD-0002','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'ht',NULL,'Yarn Dyeing',NULL,NULL,NULL,2.000,'2026-02-19 12:46:06',2),(8,'0003','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'ht',NULL,'Knitting',NULL,NULL,NULL,10.000,'2026-02-19 14:18:34',2),(9,'0004','order','2026-02-22',NULL,'1','45',NULL,NULL,NULL,NULL,'test sup',NULL,'Knitting',NULL,NULL,NULL,61.200,'2026-02-22 19:08:26',2),(12,'0005','order','2026-02-24',NULL,'3','NM',NULL,NULL,NULL,NULL,'fvc','fvc','Knitting',NULL,'rajaaa',NULL,72.000,'2026-02-24 06:35:29',2),(13,'0006','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'fvc',NULL,'Knitting',NULL,'rajaaa',NULL,100.000,'2026-02-24 15:39:42',2);
/*!40000 ALTER TABLE `yarn_dyeing_inward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_dyeing_inward_items`
--

DROP TABLE IF EXISTS `yarn_dyeing_inward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_dyeing_inward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inward_id` int NOT NULL,
  `yarn_name` varchar(200) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `fabric_sku` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `fabric_color` varchar(100) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `store` varchar(100) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `inward_id` (`inward_id`),
  CONSTRAINT `yarn_dyeing_inward_items_ibfk_1` FOREIGN KEY (`inward_id`) REFERENCES `yarn_dyeing_inward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_dyeing_inward_items`
--

LOCK TABLES `yarn_dyeing_inward_items` WRITE;
/*!40000 ALTER TABLE `yarn_dyeing_inward_items` DISABLE KEYS */;
INSERT INTO `yarn_dyeing_inward_items` VALUES (6,6,'TR','20S','',NULL,'FT',NULL,NULL,NULL,NULL,8.000),(7,7,'TR','20S','',NULL,'',NULL,NULL,NULL,NULL,2.000),(8,8,'TR','20S','',NULL,'FT',NULL,'20','20',NULL,10.000),(9,9,'20s-gt','20S','',NULL,'Fleece',NULL,'120','20',NULL,61.200),(12,12,'30s-rl','30s','',NULL,'Single Jersey',NULL,'200','24',NULL,72.000),(13,13,'20s-combed-cotton','20S','',NULL,'S/J',NULL,'200','12',NULL,100.000);
/*!40000 ALTER TABLE `yarn_dyeing_inward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_dyeing_outward`
--

DROP TABLE IF EXISTS `yarn_dyeing_outward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_dyeing_outward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_no` varchar(50) DEFAULT NULL,
  `outward_type` enum('order','lot','internal') NOT NULL DEFAULT 'order',
  `outward_date` date DEFAULT NULL,
  `ref_no` varchar(50) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `internal_lot_no` varchar(100) DEFAULT NULL,
  `internal_lot_name` varchar(255) DEFAULT NULL,
  `party_name` varchar(255) DEFAULT NULL,
  `ship_to` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT 'Yarn Dyeing',
  `remarks` text,
  `total_qty` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `staff_name` varchar(255) DEFAULT NULL,
  `staff_remarks` text,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `outward_no` (`outward_no`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_dyeing_outward`
--

LOCK TABLES `yarn_dyeing_outward` WRITE;
/*!40000 ALTER TABLE `yarn_dyeing_outward` DISABLE KEYS */;
INSERT INTO `yarn_dyeing_outward` VALUES (7,'YD-ORD-0001','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'test sup',NULL,'Knitting',NULL,10.000,'2026-02-19 11:49:37','rajaaa',NULL,2),(8,'YD-ORD-0002','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'ht',NULL,'Yarn Dyeing',NULL,10.000,'2026-02-19 12:45:49','rajaaa',NULL,2),(9,'YD-ORD-0003','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'ht',NULL,'Knitting',NULL,10.000,'2026-02-19 14:13:12','rajaaa',NULL,2),(13,'0004','order','2026-02-22',NULL,'1','45',NULL,NULL,NULL,NULL,'test sup',NULL,'Knitting',NULL,61.200,'2026-02-22 17:27:29',NULL,NULL,2),(15,'0005','order','2026-02-23',NULL,'3','NM',NULL,NULL,NULL,NULL,'fvc','ht','Knitting',NULL,72.000,'2026-02-23 20:14:01','rajaaa',NULL,2),(16,'0006','order','2026-02-24',NULL,'6','nj',NULL,NULL,NULL,NULL,'fvc','ht','Knitting',NULL,100.000,'2026-02-24 15:39:16','rajaaa',NULL,2);
/*!40000 ALTER TABLE `yarn_dyeing_outward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_dyeing_outward_items`
--

DROP TABLE IF EXISTS `yarn_dyeing_outward_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_dyeing_outward_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outward_id` int NOT NULL,
  `yarn_sku` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `outward_id` (`outward_id`),
  CONSTRAINT `yarn_dyeing_outward_items_ibfk_1` FOREIGN KEY (`outward_id`) REFERENCES `yarn_dyeing_outward` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_dyeing_outward_items`
--

LOCK TABLES `yarn_dyeing_outward_items` WRITE;
/*!40000 ALTER TABLE `yarn_dyeing_outward_items` DISABLE KEYS */;
INSERT INTO `yarn_dyeing_outward_items` VALUES (7,7,NULL,'TR','20S',NULL,'FT',NULL,NULL,10.000),(8,8,NULL,'TR','20S',NULL,'',NULL,NULL,10.000),(9,9,NULL,'TR','20S',NULL,'FT','20','20',10.000),(13,13,NULL,'20s-gt','20S',NULL,'Fleece','120','20',61.200),(15,15,NULL,'30s-rl','30s',NULL,'Single Jersey','200','24',72.000),(16,16,'20s-combed-cotton','20s-combed-cotton','20S',NULL,'S/J','200','12',100.000);
/*!40000 ALTER TABLE `yarn_dyeing_outward_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_dyeing_return`
--

DROP TABLE IF EXISTS `yarn_dyeing_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_dyeing_return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_no` varchar(30) NOT NULL,
  `return_type` enum('order','lot','internal') NOT NULL,
  `return_date` date DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(200) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(200) DEFAULT NULL,
  `internal_lot_no` varchar(100) DEFAULT NULL,
  `internal_lot_name` varchar(200) DEFAULT NULL,
  `party_name` varchar(200) DEFAULT NULL,
  `ship_to` varchar(200) DEFAULT NULL,
  `process` varchar(100) DEFAULT 'Yarn Dyeing',
  `remarks` text,
  `staff_name` varchar(200) DEFAULT NULL,
  `staff_remarks` text,
  `total_qty` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_dyeing_return`
--

LOCK TABLES `yarn_dyeing_return` WRITE;
/*!40000 ALTER TABLE `yarn_dyeing_return` DISABLE KEYS */;
INSERT INTO `yarn_dyeing_return` VALUES (1,'YDR-ORD-0001','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'test sup',NULL,'Knitting',NULL,'rajaaa',NULL,2.000,'2026-02-19 12:45:19',2),(2,'YDR-ORD-0002','order','2026-02-19',NULL,'ORD-7835','8453 -- ',NULL,NULL,NULL,NULL,'fvc',NULL,'Yarn Dyeing',NULL,'rajaaa',NULL,8.000,'2026-02-19 12:46:28',2);
/*!40000 ALTER TABLE `yarn_dyeing_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_dyeing_return_items`
--

DROP TABLE IF EXISTS `yarn_dyeing_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_dyeing_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int NOT NULL,
  `yarn_name` varchar(200) DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `gsm` varchar(50) DEFAULT NULL,
  `dia` varchar(50) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  CONSTRAINT `yarn_dyeing_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `yarn_dyeing_return` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_dyeing_return_items`
--

LOCK TABLES `yarn_dyeing_return_items` WRITE;
/*!40000 ALTER TABLE `yarn_dyeing_return_items` DISABLE KEYS */;
INSERT INTO `yarn_dyeing_return_items` VALUES (1,1,'TR','20S','','FT',NULL,NULL,2.000),(2,2,'TR','20S','','',NULL,NULL,8.000);
/*!40000 ALTER TABLE `yarn_dyeing_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_grn`
--

DROP TABLE IF EXISTS `yarn_grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_grn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_no` varchar(50) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `grn_date` datetime DEFAULT NULL,
  `dc_no` varchar(100) DEFAULT NULL,
  `dc_date` datetime DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `po_no` varchar(100) DEFAULT NULL,
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_no` (`grn_no`),
  KEY `fk_yarn_grn_year` (`year_id`),
  CONSTRAINT `fk_yarn_grn_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_grn`
--

LOCK TABLES `yarn_grn` WRITE;
/*!40000 ALTER TABLE `yarn_grn` DISABLE KEYS */;
INSERT INTO `yarn_grn` VALUES (5,'YGRN-0001','fvc','2026-02-22 00:00:00','',NULL,'',1,0,2,'1','45','','','','2026-02-22 15:39:55','YPO-0001',1),(6,'YGRN-0002','test sup','2026-02-23 00:00:00','',NULL,'rajaaa',1,0,5,'3','NM','','','','2026-02-23 19:44:48','YPO-0002',1),(7,'YGRN-0003','test sup','2026-02-24 00:00:00','',NULL,'rajaaa',1,0,10,'6','nj','','','','2026-02-24 15:18:25','YPO-0003',1),(8,'YGRN-0004','test sup','2026-02-24 00:00:00','',NULL,'rajaaa',1,0,10,'6','nj','','','','2026-02-24 15:18:44','YPO-0003',1);
/*!40000 ALTER TABLE `yarn_grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_grn_items`
--

DROP TABLE IF EXISTS `yarn_grn_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_grn_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grn_id` int DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `yarn_sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `per_bag` decimal(12,3) DEFAULT NULL,
  `per_bag_qty` decimal(12,3) DEFAULT NULL,
  `qty` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grn_id` (`grn_id`),
  CONSTRAINT `yarn_grn_items_ibfk_1` FOREIGN KEY (`grn_id`) REFERENCES `yarn_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_grn_items`
--

LOCK TABLES `yarn_grn_items` WRITE;
/*!40000 ALTER TABLE `yarn_grn_items` DISABLE KEYS */;
INSERT INTO `yarn_grn_items` VALUES (7,5,'20S','GT','20s-gt','',NULL,NULL,61.200),(8,6,'30s','Rl','30s-rl','',NULL,NULL,72.000),(9,7,'20S','Combed Cotton','20s-combed-cotton','',NULL,NULL,50.000),(10,8,'20S','Combed Cotton','20s-combed-cotton','',NULL,NULL,50.000);
/*!40000 ALTER TABLE `yarn_grn_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_planning`
--

DROP TABLE IF EXISTS `yarn_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_planning` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `fabric_id_ref` int DEFAULT NULL,
  `fabric_name` varchar(255) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `yarn_counts` varchar(100) DEFAULT NULL,
  `yarn_color` varchar(100) DEFAULT NULL,
  `consumption` decimal(10,3) DEFAULT '0.000',
  `wastage_pct` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `yarn_planning_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order_planning` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_planning`
--

LOCK TABLES `yarn_planning` WRITE;
/*!40000 ALTER TABLE `yarn_planning` DISABLE KEYS */;
INSERT INTO `yarn_planning` VALUES (94,2,73,'Fleece','GT','20S','',100.000,0.00,'2026-02-22 09:40:22'),(97,5,77,'Single Jersey','Rl','30s','',100.000,0.00,'2026-02-23 19:35:34'),(98,10,78,'S/J','Combed Cotton','20S','',100.000,0.00,'2026-02-24 15:16:51'),(99,21,79,'S/J','VL','20S','',100.000,0.00,'2026-02-27 13:17:11');
/*!40000 ALTER TABLE `yarn_planning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_po`
--

DROP TABLE IF EXISTS `yarn_po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_po` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_no` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `ship_to` varchar(255) DEFAULT NULL,
  `create_date` date DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `is_order_specific` tinyint(1) DEFAULT '0',
  `is_lot_specific` tinyint(1) DEFAULT '0',
  `order_id` int DEFAULT NULL,
  `order_no` varchar(100) DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `lot_no` varchar(100) DEFAULT NULL,
  `lot_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_igst` tinyint(1) DEFAULT '0',
  `round_off` decimal(10,2) DEFAULT '0.00',
  `year_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_no` (`po_no`),
  KEY `fk_yarn_po_year` (`year_id`),
  CONSTRAINT `fk_yarn_po_year` FOREIGN KEY (`year_id`) REFERENCES `accounting_years` (`year_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_po`
--

LOCK TABLES `yarn_po` WRITE;
/*!40000 ALTER TABLE `yarn_po` DISABLE KEYS */;
INSERT INTO `yarn_po` VALUES (1,'YPO-0001','test sup','fvc','2026-02-20','rajaaa',1,0,2,'1','45','','','','2026-02-22 09:54:15','2026-02-22 14:07:13',0,0.00,1),(2,'YPO-0002','test sup','test sup','2026-02-23','rajaaa',1,0,5,'3','NM','','','','2026-02-23 19:44:35','2026-02-23 19:44:35',0,0.00,1),(3,'YPO-0003','test sup','test sup','2026-02-24','rajaaa',1,0,10,'6','nj','','','','2026-02-24 15:18:15','2026-02-24 15:18:15',0,0.00,1);
/*!40000 ALTER TABLE `yarn_po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yarn_po_items`
--

DROP TABLE IF EXISTS `yarn_po_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yarn_po_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int DEFAULT NULL,
  `counts` varchar(100) DEFAULT NULL,
  `yarn_name` varchar(255) DEFAULT NULL,
  `yarn_sku` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `per_bag` varchar(100) DEFAULT NULL,
  `per_bag_qty` decimal(10,2) DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT '0.00',
  `gst_per` decimal(10,2) DEFAULT '0.00',
  `total` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  CONSTRAINT `yarn_po_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `yarn_po` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yarn_po_items`
--

LOCK TABLES `yarn_po_items` WRITE;
/*!40000 ALTER TABLE `yarn_po_items` DISABLE KEYS */;
INSERT INTO `yarn_po_items` VALUES (3,1,'20S','GT','20s-gt','',NULL,NULL,61.20,120.00,0.00,7344.00),(4,2,'30s','Rl','30s-rl','',NULL,NULL,72.00,60.00,5.00,4320.00),(5,3,'20S','Combed Cotton','20s-combed-cotton','',NULL,NULL,100.00,120.00,0.00,12000.00);
/*!40000 ALTER TABLE `yarn_po_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-14 13:34:36
