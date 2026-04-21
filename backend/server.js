import "./env.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import express from "express";
import cors from "cors";
import multer from "multer";

import db from "./db.js";
import jwt from "jsonwebtoken";
import { logActivity } from "./utils/logger.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import outstandingRouter from "./routes/outstanding.js";
import customersRouter from "./routes/customers.js";
import supplierRouter from "./routes/supplier.js";
import employeeRouter from "./routes/employee.js";
import categoryRouter from "./routes/category.js";
import subcategoryRouter from "./routes/subcategory.js";
import supersubcategoryRouter from "./routes/supersubcategory.js";
import sizeRouter from "./routes/size.js";
import colorRouter from "./routes/color.js";
import brandnameRouter from "./routes/brandname.js";
import productsRouter from "./routes/product.js";
import invoiceRouter from "./routes/invoice.js";
import estimateRouter from "./routes/estimate.js";
import piRouter from "./routes/pi.js";
import dcRouter from "./routes/dc.js";
import poRouter from "./routes/po.js";
import grnRouter from "./routes/grn.js";
import debitnoteRouter from "./routes/debitnote.js";
import creditnoteRouter from "./routes/creditnote.js";
import quotationRouter from "./routes/quotation.js";
import purchaseRouter from "./routes/purchase.js";
import purchasereturnRouter from "./routes/purchasereturn.js";
import salesreturnRouter from "./routes/salesreturn.js";
import invoicedownloadRouter from "./routes/invoicedownload.js";
import templatesRouter from "./routes/templates.js";
import receiptRoutes from "./routes/receipts.js";
import modeofpaymentRoutes from "./routes/modeofpayment.js";
import bankaccountRoutes from "./routes/bankaccount.js";
import accountheadRoutes from "./routes/accounthead.js";
import voucherRoutes from "./routes/vouchers.js";
import printinvoiceRoutes from "./routes/printinvoice.js";
import printpiRoutes from "./routes/printpi.js";
import printpoRoutes from "./routes/printpo.js";
import printgrnRoutes from "./routes/printgrn.js";
import printdcRoutes from "./routes/printdc.js";
import printestimateRoutes from "./routes/printestimate.js";
import printsalesreturnRoutes from "./routes/printsalesreturn.js";
import printpurchasereturnRoutes from "./routes/printpurchasereturn.js";
import printdebitnoteRoutes from "./routes/printdebitnote.js";
import printcreditnoteRoutes from "./routes/printcreditnote.js";
import printquotationRoutes from "./routes/printquotation.js";
import printpurchaseRoutes from "./routes/printpurchase.js";
import printreceiptRoutes from "./routes/printreceipt.js";
import printvoucherRoutes from "./routes/printvoucher.js";
import printYarnPoRoutes from "./routes/printyarnpo.js";
import printFabricPoRoutes from "./routes/printfabricpo.js";
import printTrimsPoRoutes from "./routes/printtrimspo.js";
import printGarmentsPoRoutes from "./routes/printgarmentspo.js";
import printGeneralPoRoutes from "./routes/printgeneralpo.js";
import printYarnGrnRoutes from "./routes/printyarngrn.js";
import printFabricGrnRoutes from "./routes/printfabricgrn.js";
import printTrimsGrnRoutes from "./routes/printtrimsgrn.js";
import printGarmentsGrnRoutes from "./routes/printgarmentsgrn.js";
import printGeneralGrnRoutes from "./routes/printgeneralgrn.js";
import countryRouter from "./routes/country.js";
import stateRouter from "./routes/state.js";
import cityRouter from "./routes/city.js";
import userTypeRoutes from "./routes/userType.js";
import privilegeRoutes from "./routes/privileges.js";
import moduleRoutes from "./routes/module.js";
import agentRouter from "./routes/agent.js";
import dashboardRouter from "./routes/dashboard.js";
import ledgerRouter from "./routes/invoiceledger.js";
import quotationReportsRouter from "./routes/quotation_reports.js";
import poReportsRouter from "./routes/po_reports.js";
import dcReportsRouter from "./routes/dc_reports.js";
import piReportsRouter from "./routes/pi_reports.js";
import purchaseReportsRouter from "./routes/purchase_reports.js";
import salesreturnReportsRouter from "./routes/salesreturn_reports.js";
import debitnoteReportsRouter from "./routes/debitnote_reports.js";
import purchasereturnReportsRouter from "./routes/purchasereturn_reports.js";
import creditnoteReportsRouter from "./routes/creditnote_reports.js";
import pricelistMasterRouter from "./routes/pricelist_master.js";
import pricelistDetailsRouter from "./routes/pricelist_details.js";
import sizeChartRouter from "./routes/size_chart.js";
import uomRouter from "./routes/uom.js";
import companyProfileRouter from "./routes/company_profile.js";
import profitlossRouter from "./routes/profitloss.js";
import hsnReportRouter from "./routes/hsnreport.js";
import companyStatementRouter from "./routes/companystatement.js";
import bankReportsRouter from "./routes/bank_reports.js";
import inwardRoutes from "./routes/inward.js";
import stockReportsRouter from "./routes/stock_reports.js";
import gstr1ReportsRouter from "./routes/gstr1_reports.js";
import ageingReportsRouter from "./routes/ageing_reports.js";
import taxExtraReportsRouter from "./routes/tax_extra_reports.js";
import financialReportsRouter from "./routes/financial_reports.js";
import advancedAccountingRouter from "./routes/advanced_accounting.js";
import leadMastersRouter from "./routes/lead_masters.js";
import seasonsRouter from "./routes/seasons.js";
import leadsRouter from "./routes/leads.js";
import yarnRouter from "./routes/yarn.js";
import fabricsRouter from "./routes/fabrics.js";
import trimsRouter from "./routes/trims.js";
import orderPlanningRouter from "./routes/order_planning.js";
import stylePlanningRouter from "./routes/style_planning.js";
import lifeCycleRouter from "./routes/life_cycle.js";
import bodyPartsRouter from "./routes/body_parts.js";
import diaMasterRouter from "./routes/dia_master.js";
import yarnDyeingOutwardRouter from "./routes/yarn_dyeing_outward.js";
import yarnDyeingInwardRouter from "./routes/yarn_dyeing_inward.js";
import yarnDyeingReturnRouter from "./routes/yarn_dyeing_return.js";
import fabricToPcsOutwardRouter from "./routes/fabric_to_pcs_outward.js";
import fabricToPcsInwardRouter from "./routes/fabric_to_pcs_inward.js";
import fabricToPcsReturnRouter from "./routes/fabric_to_pcs_return.js";
import pcsOutwardRouter from "./routes/pcs_outward.js";
import pcsInwardRouter from "./routes/pcs_inward.js";
import pcsReturnRouter from "./routes/pcs_return.js";
import yarnPoRouter from "./routes/yarn_po.js";
import fabricPoRouter from "./routes/fabric_po.js";
import trimsPoRouter from "./routes/trims_po.js";
import garmentsPoRouter from "./routes/garments_po.js";
import generalPoRouter from "./routes/general_po.js";
import yarnGrnRouter from "./routes/yarn_grn.js";
import fabricGrnRouter from "./routes/fabric_grn.js";
import trimsGrnRouter from "./routes/trims_grn.js";
import garmentsGrnRouter from "./routes/garments_grn.js";
import generalGrnRouter from "./routes/general_grn.js";
import directInwardRouter from "./routes/direct_inward_general.js";
import yarnDirectInwardRouter from "./routes/yarn_direct_inward.js";
import fabricDirectInwardRouter from "./routes/fabric_direct_inward.js";
import trimsDirectInwardRouter from "./routes/trims_direct_inward.js";
import pcsDirectInwardRouter from "./routes/pcs_direct_inward.js";
import productionLotsRouter from "./routes/production_lots.js";
import internalLotsRouter from "./routes/internal_lots.js";
import garmentCostingRouter from "./routes/garment_costing.js";
import tnaRouter from "./routes/tna.js";
import sizeQuantityRouter from "./routes/size_quantity.js";
import fabricPlanningRouter from "./routes/fabric_planning.js";
import orderPlanningV2Router from "./routes/order_planning_v2.js";
import contractorWagesRouter from "./routes/contractor_wages.js";
import lifecycleTemplatesRouter from "./routes/lifecycle_templates.js";
import erpReportsV2Router from "./routes/erp_reports_v2.js";
import contractorRouter from "./routes/contractor.js";
import activityLogsRouter from "./routes/activity_logs.js";
import accountingRouter from "./routes/accounting.js";
import { checkYearLock } from "./middleware/yearLock.js";

const app = express();
const require = createRequire(import.meta.url);
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow production and local development
const allowedOrigins = [
  'https://superlabsgarments.in',
  'https://www.superlabsgarments.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:3001'
];

// CORS Logging & Implementation
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS DEBUG] ${req.method} ${req.url} | Origin: ${origin}`);

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-year-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Accounting Year Protection Middleware
app.use(checkYearLock);

// Safety filter to handle double-api prefixes
app.use((req, res, next) => {
  // If the URL has double /api/api, fix it automatically
  if (req.url.startsWith('/api/api')) {
    req.url = req.url.replace('/api/api', '/api');
    console.log(`Fixed double-api URL: ${req.url}`);
  }
  next();
});

// Root check
app.get(['/', '/api'], (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Helper function to mount routes on both "/" and "/api/"
const mountRoute = (path, router) => {
  app.use(path, router);
  app.use(`/api${path}`, router);
};

// Redirect alias for /api/years to accounting-years
app.use(['/years', '/api/years'], (req, res, next) => {
  req.url = req.url.replace('/years', '/accounting-years');
  next();
});

// Global Activity Logger Interceptor
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return next();

  const originalUrl = req.originalUrl || req.url;
  if (originalUrl.includes('/auth') || originalUrl.includes('/activity-logs')) return next();

  // Decode user from token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      if (!process.env.JWT_SECRET) {
        console.error("⚠️ JWT_SECRET is missing from environment!");
        return next();
      }
      req.globalUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.error("❌ JWT Verify Error:", e.message);
    }
  }

  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Determine action
      let action = 'UPDATE';
      if (req.method === 'POST') action = 'INSERT';
      else if (req.method === 'DELETE') action = 'DELETE';

      // Determine table name
      const cleanUrl = originalUrl.split('?')[0];
      const parts = cleanUrl.split('/').filter(Boolean);
      let tableName = parts.length > 1 && parts[0] === 'api' ? parts[1] : parts[0];

      if (tableName && tableName !== 'auth' && tableName !== 'activity-logs') {
        let rowId = body?.id || body?.insertId || null;
        if (!rowId && req.params && req.params.id) rowId = req.params.id;
        if (!rowId && parts.length > 2) rowId = parts[2]; // fallback 

        logActivity({
          user_id: req.globalUser?.id || null,
          user_name: req.globalUser?.username || 'System',
          action: action,
          table_name: tableName,
          row_id: rowId || 0,
          new_data: req.method !== 'DELETE' ? req.body : null
        });
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

// Auth Routes
mountRoute('/auth', authRoutes);

// All other routes with dual support
mountRoute("/users", userRoutes);
mountRoute("/outstanding", outstandingRouter);
mountRoute("/customers", customersRouter);
mountRoute("/supplier", supplierRouter);
mountRoute("/employees", employeeRouter);
mountRoute("/categories", categoryRouter);
mountRoute("/sub_categories", subcategoryRouter);
mountRoute("/super_sub_categories", supersubcategoryRouter);
mountRoute("/size", sizeRouter);
mountRoute("/color", colorRouter);
mountRoute("/brandname", brandnameRouter);
mountRoute("/products", productsRouter);
mountRoute("/invoices", invoiceRouter);
mountRoute("/quotation", quotationRouter);
mountRoute("/pi", piRouter);
mountRoute("/estimate", estimateRouter);
mountRoute("/dc", dcRouter);
mountRoute("/po", poRouter);
mountRoute("/grn", grnRouter);
mountRoute("/debitnote", debitnoteRouter);
mountRoute("/creditnote", creditnoteRouter);
mountRoute("/purchasereturn", purchasereturnRouter);
mountRoute("/salesreturn", salesreturnRouter);
mountRoute("/purchases", purchaseRouter);
mountRoute("/invoicedownload", invoicedownloadRouter);
mountRoute("/templates", templatesRouter);
mountRoute("/receipts", receiptRoutes);
mountRoute("/vouchers", voucherRoutes);
mountRoute("/modeofpayment", modeofpaymentRoutes);
mountRoute("/bankaccount", bankaccountRoutes);
mountRoute("/accounthead", accountheadRoutes);

// Print routes
mountRoute("/printinvoice", printinvoiceRoutes);
mountRoute("/printpi", printpiRoutes);
mountRoute("/printpo", printpoRoutes);
mountRoute("/printgrn", printgrnRoutes);
mountRoute("/printdc", printdcRoutes);
mountRoute("/printestimate", printestimateRoutes);
mountRoute("/printsalesreturn", printsalesreturnRoutes);
mountRoute("/printpurchasereturn", printpurchasereturnRoutes);
mountRoute("/printdebitnote", printdebitnoteRoutes);
mountRoute("/printcreditnote", printcreditnoteRoutes);
mountRoute("/printquotation", printquotationRoutes);
mountRoute("/printpurchase", printpurchaseRoutes);
mountRoute("/printreceipt", printreceiptRoutes);
mountRoute("/printvoucher", printvoucherRoutes);
mountRoute("/printyarnpo", printYarnPoRoutes);
mountRoute("/printfabricpo", printFabricPoRoutes);
mountRoute("/printtrimspo", printTrimsPoRoutes);
mountRoute("/printgarmentspo", printGarmentsPoRoutes);
mountRoute("/printgeneralpo", printGeneralPoRoutes);
mountRoute("/printyarngrn", printYarnGrnRoutes);
mountRoute("/printfabricgrn", printFabricGrnRoutes);
mountRoute("/printtrimsgrn", printTrimsGrnRoutes);
mountRoute("/printgarmentsgrn", printGarmentsGrnRoutes);
mountRoute("/printgeneralgrn", printGeneralGrnRoutes);

// Master & Report routes
mountRoute("/countries", countryRouter);
mountRoute("/states", stateRouter);
mountRoute("/cities", cityRouter);
mountRoute("/usertype", userTypeRoutes);
mountRoute("/privileges", privilegeRoutes);
mountRoute("/module", moduleRoutes);
mountRoute("/agents", agentRouter);
mountRoute("/dashboard", dashboardRouter);
mountRoute("/reports", ledgerRouter);
mountRoute("/reports/quotation", quotationReportsRouter);
mountRoute("/reports/po", poReportsRouter);
mountRoute("/reports/dc", dcReportsRouter);
mountRoute("/reports/pi", piReportsRouter);
mountRoute("/reports/purchase", purchaseReportsRouter);
mountRoute("/reports/salesreturn", salesreturnReportsRouter);
mountRoute("/reports/debitnote", debitnoteReportsRouter);
mountRoute("/reports/purchasereturn", purchasereturnReportsRouter);
mountRoute("/reports/creditnote", creditnoteReportsRouter);
mountRoute("/pricelist-master", pricelistMasterRouter);
mountRoute("/pricelist-details", pricelistDetailsRouter);
mountRoute("/size-charts", sizeChartRouter);
mountRoute("/uom", uomRouter);
mountRoute("/company-profile", companyProfileRouter);
mountRoute("/reports/profit-loss", profitlossRouter);
mountRoute("/reports/hsn", hsnReportRouter);
mountRoute("/reports/company-statement", companyStatementRouter);
mountRoute("/reports/bank-ledger", bankReportsRouter);
mountRoute("/reports/stock", stockReportsRouter);
mountRoute("/reports/gstr1", gstr1ReportsRouter);
mountRoute("/reports/ageing", ageingReportsRouter);
mountRoute("/reports/tax-extra", taxExtraReportsRouter);
mountRoute("/reports/financial", financialReportsRouter);
mountRoute("/reports/advanced", advancedAccountingRouter);
mountRoute("/inward", inwardRoutes);
mountRoute("/leads", leadsRouter);
mountRoute("/lead-masters", leadMastersRouter);
mountRoute("/seasons", seasonsRouter);
mountRoute("/yarn", yarnRouter);
mountRoute("/fabrics", fabricsRouter);
mountRoute("/trims", trimsRouter);
mountRoute("/order_planning", orderPlanningRouter);
mountRoute("/style-planning", stylePlanningRouter);
mountRoute("/tna", tnaRouter);
mountRoute("/life-cycles", lifeCycleRouter);
mountRoute("/body-parts", bodyPartsRouter);
mountRoute("/dia-masters", diaMasterRouter);
mountRoute("/yarn-dyeing-outward", yarnDyeingOutwardRouter);
mountRoute("/yarn-dyeing-inward", yarnDyeingInwardRouter);
mountRoute("/yarn-dyeing-return", yarnDyeingReturnRouter);
mountRoute("/fabric-to-pcs-outward", fabricToPcsOutwardRouter);
mountRoute("/fabric-to-pcs-inward", fabricToPcsInwardRouter);
mountRoute("/fabric-to-pcs-return", fabricToPcsReturnRouter);
mountRoute("/pcs-outward", pcsOutwardRouter);
mountRoute("/pcs-inward", pcsInwardRouter);
mountRoute("/pcs-return", pcsReturnRouter);
mountRoute("/yarn-po", yarnPoRouter);
mountRoute("/fabric-po", fabricPoRouter);
mountRoute("/trims-po", trimsPoRouter);
mountRoute("/garments-po", garmentsPoRouter);
mountRoute("/general-po", generalPoRouter);
mountRoute("/yarn-grn", yarnGrnRouter);
mountRoute("/fabric-grn", fabricGrnRouter);
mountRoute("/trims-grn", trimsGrnRouter);
mountRoute("/garments-grn", garmentsGrnRouter);
mountRoute("/general-grn", generalGrnRouter);
mountRoute("/direct-inward", directInwardRouter);
mountRoute("/yarn-direct-inward", yarnDirectInwardRouter);
mountRoute("/fabric-direct-inward", fabricDirectInwardRouter);
mountRoute("/trims-direct-inward", trimsDirectInwardRouter);
mountRoute("/pcs-direct-inward", pcsDirectInwardRouter);
mountRoute("/production-lots", productionLotsRouter);
mountRoute("/internal-lots", internalLotsRouter);
mountRoute("/garment-costing", garmentCostingRouter);
mountRoute("/size-quantity", sizeQuantityRouter);
mountRoute("/fabric-planning", fabricPlanningRouter);
mountRoute("/order-planning-v2", orderPlanningV2Router);
mountRoute("/contractor", contractorRouter);
mountRoute("/contractor-wages", contractorWagesRouter);
mountRoute("/lifecycle-templates", lifecycleTemplatesRouter);
mountRoute("/erp-reports", erpReportsV2Router);
mountRoute("/activity-logs", activityLogsRouter);
mountRoute("/accounting-years", accountingRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});