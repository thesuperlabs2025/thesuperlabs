import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";


// Components
import Navbar from "./Navbar";
import Customers from "./Customers";
import Customermy from "./Customermy";
import EditCustomer from "./EditCustomer";
import Supplier from "./Supplier";
import Suppliermy from "./Suppliermy";
import EditSupplier from "./EditSupplier";
import Product from "./Product";
import ProductMy from "./Productmy";
import EditProduct from "./EditProduct";
import CategoryForm from "./CategoryForm";
import SubCategoryForm from "./SubcategoryForm";
import SupersubcategoryForm from "./SupersubcategoryForm";
import Size from "./Size";
import Color from "./Color";
import BrandForm from "./BrandForm";
import Contacts from "./Contacts";
import Accounts from "./Accounts";
import InvoiceForm from "./InvoiceForm";
import CreditnoteForm from "./CreditnoteForm";
import DebitnoteForm from "./DebitnoteForm";
import DcForm from "./DcForm";
import PoForm from "./PoForm";
import GrnForm from "./GrnForm";
import PiForm from "./PiForm";
import EstimateForm from "./EstimateForm";
import Quotationform from "./Quotationform";
import PurchaseForm from "./PurchaseForm";
import ReceiptForm from "./ReceiptForm";
import PurchasereturnForm from "./PurchasereturnForm";
import SalesreturnForm from "./SalesreturnForm";
import EditPurchasereturnForm from "./EditPurchasereturnForm";

import YarnPOList from "./YarnPOList";
import YarnPO from "./YarnPO";
import EditYarnPO from "./EditYarnPO";
import FabricPOList from "./FabricPOList";
import FabricPO from "./FabricPO";
import EditFabricPO from "./EditFabricPO";
import TrimsPOList from "./TrimsPOList";
import TrimsPO from "./TrimsPO";
import EditTrimsPO from "./EditTrimsPO";
import GarmentsPOList from "./GarmentsPOList";
import GarmentsPO from "./GarmentsPO";
import EditGarmentsPO from "./EditGarmentsPO";
import GeneralPOList from "./GeneralPOList";
import GeneralPO from "./GeneralPO";
import EditGeneralPO from "./EditGeneralPO";
import YarnGRN from './YarnGRN';
import YarnGRNList from './YarnGRNList';
import EditYarnGRN from './EditYarnGRN';
import FabricGRN from './FabricGRN';
import FabricGRNList from './FabricGRNList';
import EditFabricGRN from './EditFabricGRN';
import TrimsGRN from './TrimsGRN';
import TrimsGRNList from './TrimsGRNList';
import EditTrimsGRN from './EditTrimsGRN';
import GarmentsGRN from './GarmentsGRN';
import GarmentsGRNList from './GarmentsGRNList';
import EditGarmentsGRN from './EditGarmentsGRN';
import GeneralGRN from './GeneralGRN';
import GeneralGRNList from './GeneralGRNList';
import EditGeneralGRN from './EditGeneralGRN';
import ContractorWagesList from "./ContractorWagesList";
import ContractorWagesAdd from "./ContractorWagesAdd";
import ContractorList from "./ContractorList";
import ContractorAdd from "./ContractorAdd";
import ContractorEdit from "./ContractorEdit";
import DirectInward from "./DirectInward.jsx";
import DirectInwardList from "./DirectInwardList.jsx";
import EditSalesreturnForm from "./EditSalesreturnForm";
import EditReceiptForm from "./EditReceiptForm";
import EditCreditnoteForm from "./EditCreditnoteForm";
import EditDebitnoteForm from "./EditDebitnoteForm";
import EditVoucherForm from "./EditVoucherForm";
import Dashboard from "./Dashboard";
import Employee from "./Employee";
import Employeemy from "./Employeemy";
import EditEmployee from "./EditEmployee";
import EditinvoiceForm from "./EditinvoiceForm";
import EditQuotationForm from "./EditQuotationForm";
import EditPiForm from "./EditPiForm";
import EditEstimateForm from "./EditEstimateForm";
import EditPurchaseForm from "./EditPurchaseForm";
import EditDcForm from "./EditDcForm";
import EditPoForm from "./EditPoForm";
import EditGrnForm from "./EditGrnForm";
import ReceiptMy from "./Receiptmy";
import VoucherMy from "./Vouchermy";
import Modeofpayment from "./Modeofpayment";
import Bankaccount from "./Bankaccount";
import Accounthead from "./Accounthead";
import Template from "./Template";
import YarnInward from "./YarnInward";
import YarnInwardList from "./YarnInwardList";
import FabricInward from "./FabricInward";
import FabricInwardList from "./FabricInwardList";
import TrimsInward from "./TrimsInward";
import TrimsInwardList from "./TrimsInwardList";
import VoucherForm from "./VoucherForm";
import Invoicemy from "./Invoicemy";
import Creditnotemy from "./Creditnotemy";
import Debitnotemy from "./Debitnotemy";
import Dcmy from "./Dcmy";
import Pomy from "./Pomy";
import Grnmy from "./Grnmy";
import Pimy from "./Pimy";
import Salesreturnmy from "./Salesreturnmy";
import Purchasereturnmy from "./Purchasereturnmy";
import Estimatemy from "./Estimatemy";
import Quotationmy from "./Quotationmy";
import Purchasemy from "./Purchasemy";
import InvoiceDownload from "./InvoiceDownload";
import Login from "./Login";
import UserList from "./userlist";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import OutstandingReport from "./OutstandingReport";
import Reports from "./Reports";
import CountryMaster from "./CountryMaster";
import StateMaster from "./StateMaster";
import CityMaster from "./CityMaster";
import UserTypeMaster from "./UserTypeMaster";
import InvoiceLedger from "./InvoiceLedger";
import InvoiceSummary from "./InvoiceSummary";
import QuotationLedger from "./QuotationLedger";
import QuotationSummary from "./QuotationSummary";
import POLedger from "./POLedger";
import POSummary from "./POSummary";
import DCLedger from "./DCLedger";
import DCSummary from "./DCSummary";
import PILedger from "./PILedger";
import PISummary from "./PISummary";
import PurchaseLedger from "./PurchaseLedger";
import PurchaseSummary from "./PurchaseSummary";
import SalesReturnLedger from "./SalesReturnLedger";
import SalesReturnSummary from "./SalesReturnSummary";
import DebitNoteLedger from "./DebitNoteLedger";
import DebitNoteSummary from "./DebitNoteSummary";
import PurchaseReturnLedger from "./PurchaseReturnLedger";
import PurchaseReturnSummary from "./PurchaseReturnSummary";
import CreditNoteLedger from "./CreditNoteLedger";
import CreditNoteSummary from "./CreditNoteSummary";
import ProfitLossReport from "./ProfitLossReport";
import HsnReport from "./HsnReport";
import CompanyStatement from "./CompanyStatement";
import BankBalanceReport from "./BankBalanceReport";
import InwardMy from "./InwardMy";
import InwardForm from "./InwardForm";
import StockReport from "./StockReport";
import Gstr1Report from "./Gstr1Report";
import AgeingReport from "./AgeingReport";
import TaxExtraReport from "./TaxExtraReport";
import CashBookReport from "./CashBookReport";
import TaxReport from "./TaxReport";
import AdvancedReport from "./AdvancedReport";
import UserPrivilege from "./UserPrivilege";
import ProductionLot from "./ProductionLot";
import ProductionLotList from "./ProductionLotList";
import InternalLot from "./InternalLot";
import InternalLotList from "./InternalLotList";
import ModuleMaster from "./ModuleMaster";
import Masters from "./Masters";
import AccountingYearMaster from "./AccountingYearMaster";
import AgentForm from "./AgentForm";
import CustomerBulkImport from "./CustomerBulkImport";
import SupplierBulkImport from "./SupplierBulkImport";
import ProductBulkImport from "./ProductBulkImport";
import ProductBulkCreator from "./ProductBulkCreator";
import PriceList from "./PriceList";
import PriceListMaster from "./PriceListMaster";
import Inventory from "./Inventory";
import SizeChartMy from "./SizeChartMy";
import SizeChartForm from "./SizeChartForm";
import UomMy from "./UomMy";
import UomForm from "./UomForm";
import CompanyProfile from "./CompanyProfile";
import UniversalSearch from "./UniversalSearch";
import NotificationBell from "./NotificationBell";
import LeadMy from "./LeadMy";
import LeadForm from "./LeadForm";
import LeadSourceMaster from "./LeadSourceMaster";
import ProductTypeMaster from "./ProductTypeMaster";
import LeadStatusMaster from "./LeadStatusMaster";
import Garments from "./Garments";
import OrderPlanning from "./OrderPlanning";
import OrderPlanningmy from "./OrderPlanningmy";
import StylePlanning from "./StylePlanning";
import StylePlanningmy from "./StylePlanningmy";
import SeasonMaster from "./SeasonMaster";
import ActivityLogs from "./ActivityLogs";
import LifeCycleForm from "./LifeCycleForm";
import YarnStock from "./YarnStock";
import FabricStock from "./FabricStock";
import YarnStockReport from "./YarnStockReport";
import FabricStockReport from "./FabricStockReport";
import TrimsStock from "./TrimsStock";
import BodyPartForm from "./BodyPartForm";
import DiaChartMy from "./DiaChartMy";
import DiaChartForm from "./DiaChartForm";
import OrderJobworkYarnToFabricOutward from "./OrderJobworkYarnToFabricOutward";
import LotJobworkYarnToFabricOutward from "./LotJobworkYarnToFabricOutward";
import InternalLotYarnToFabricOutward from "./InternalLotYarnToFabricOutward";
import OrderJobworkYarnToFabricList from "./OrderJobworkYarnToFabricList";
import LotJobworkYarnToFabricList from "./LotJobworkYarnToFabricList";
import InternalLotYarnToFabricList from "./InternalLotYarnToFabricList";
import EditOrderJobworkYarnToFabricOutward from "./EditOrderJobworkYarnToFabricOutward";
import EditLotJobworkYarnToFabricOutward from "./EditLotJobworkYarnToFabricOutward";
import EditInternalLotYarnToFabricOutward from "./EditInternalLotYarnToFabricOutward";
import OrderJobworkYarnToFabricInward from "./OrderJobworkYarnToFabricInward";
import LotJobworkYarnToFabricInward from "./LotJobworkYarnToFabricInward";
import InternalLotYarnToFabricInward from "./InternalLotYarnToFabricInward";
import OrderJobworkYarnToFabricInwardList from "./OrderJobworkYarnToFabricInwardList";
import LotJobworkYarnToFabricInwardList from "./LotJobworkYarnToFabricInwardList";
import InternalLotYarnToFabricInwardList from "./InternalLotYarnToFabricInwardList";
import EditOrderJobworkYarnToFabricInward from "./EditOrderJobworkYarnToFabricInward";
import EditLotJobworkYarnToFabricInward from "./EditLotJobworkYarnToFabricInward";
import EditInternalLotYarnToFabricInward from "./EditInternalLotYarnToFabricInward";
import OrderJobworkYarnToFabricReturn from "./OrderJobworkYarnToFabricReturn";
import LotJobworkYarnToFabricReturn from "./LotJobworkYarnToFabricReturn";
import InternalLotYarnToFabricReturn from "./InternalLotYarnToFabricReturn";
import OrderJobworkYarnToFabricReturnList from "./OrderJobworkYarnToFabricReturnList";
import LotJobworkYarnToFabricReturnList from "./LotJobworkYarnToFabricReturnList";
import InternalLotYarnToFabricReturnList from "./InternalLotYarnToFabricReturnList";
import EditOrderJobworkYarnToFabricReturn from "./EditOrderJobworkYarnToFabricReturn";
import EditLotJobworkYarnToFabricReturn from "./EditLotJobworkYarnToFabricReturn";
import EditInternalLotYarnToFabricReturn from "./EditInternalLotYarnToFabricReturn";
import OrderJobworkFabricToPcsOutward from "./OrderJobworkFabricToPcsOutward";
import OrderJobworkFabricToPcsOutwardList from "./OrderJobworkFabricToPcsOutwardList";
import EditOrderJobworkFabricToPcsOutward from "./EditOrderJobworkFabricToPcsOutward";
import LotJobworkFabricToPcsOutward from "./LotJobworkFabricToPcsOutward";
import LotJobworkFabricToPcsOutwardList from "./LotJobworkFabricToPcsOutwardList";
import EditLotJobworkFabricToPcsOutward from "./EditLotJobworkFabricToPcsOutward";
import InternalLotFabricToPcsOutward from "./InternalLotFabricToPcsOutward";
import InternalLotFabricToPcsOutwardList from "./InternalLotFabricToPcsOutwardList";
import EditInternalLotFabricToPcsOutward from "./EditInternalLotFabricToPcsOutward";
import OrderJobworkFabricToPcsInward from "./OrderJobworkFabricToPcsInward";
import OrderJobworkFabricToPcsInwardList from "./OrderJobworkFabricToPcsInwardList";
import EditOrderJobworkFabricToPcsInward from "./EditOrderJobworkFabricToPcsInward";
import LotJobworkFabricToPcsInward from "./LotJobworkFabricToPcsInward";
import LotJobworkFabricToPcsInwardList from "./LotJobworkFabricToPcsInwardList";
import EditLotJobworkFabricToPcsInward from "./EditLotJobworkFabricToPcsInward";
import InternalLotFabricToPcsInward from "./InternalLotFabricToPcsInward";
import InternalLotFabricToPcsInwardList from "./InternalLotFabricToPcsInwardList";
import EditInternalLotFabricToPcsInward from "./EditInternalLotFabricToPcsInward";
import OrderJobworkFabricToPcsReturn from "./OrderJobworkFabricToPcsReturn";
import OrderJobworkFabricToPcsReturnList from "./OrderJobworkFabricToPcsReturnList";
import EditOrderJobworkFabricToPcsReturn from "./EditOrderJobworkFabricToPcsReturn";
import LotJobworkFabricToPcsReturn from "./LotJobworkFabricToPcsReturn";
import LotJobworkFabricToPcsReturnList from "./LotJobworkFabricToPcsReturnList";
import EditLotJobworkFabricToPcsReturn from "./EditLotJobworkFabricToPcsReturn";
import InternalLotFabricToPcsReturn from "./InternalLotFabricToPcsReturn";
import InternalLotFabricToPcsReturnList from "./InternalLotFabricToPcsReturnList";
import EditInternalLotFabricToPcsReturn from "./EditInternalLotFabricToPcsReturn";
import LifeCycleTemplateMaster from "./LifeCycleTemplateMaster";
import OrderJobworkPcsOutward from "./OrderJobworkPcsOutward";
import OrderJobworkPcsOutwardList from "./OrderJobworkPcsOutwardList";
import EditOrderJobworkPcsOutward from "./EditOrderJobworkPcsOutward";
import OrderJobworkPcsInward from "./OrderJobworkPcsInward";
import OrderJobworkPcsInwardList from "./OrderJobworkPcsInwardList";
import EditOrderJobworkPcsInward from "./EditOrderJobworkPcsInward";
import OrderJobworkPcsReturn from "./OrderJobworkPcsReturn";
import OrderJobworkPcsReturnList from "./OrderJobworkPcsReturnList";
import EditOrderJobworkPcsReturn from "./EditOrderJobworkPcsReturn";
import GenericERPReport from "./GenericERPReport";
import OrderDetailedReport from "./OrderDetailedReport";
import OrderSheetReport from "./OrderSheetReport";
import OrderStatusReport from "./OrderStatusReport";
import PcsWipReport from "./PcsWipReport";
import TnaAdd from "./TnaAdd";
import TnaTrack from "./TnaTrack";
import TnaMyPage from "./TnaMyPage";
import TnaProcessMaster from "./TnaProcessMaster";
import TnaStatusUpdate from "./TnaStatusUpdate";
import BarcodeCreation from "./BarcodeCreation";
import LandingPage from "./LandingPage/LandingPage";

// CSS
import "./App.css";
import "./Api.jsx";
import "./responsive.css";

// Global Axios Interceptor for Auth & Year
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const selectedYear = localStorage.getItem("selectedYear");
    if (selectedYear) {
      try {
        const yearData = JSON.parse(selectedYear);
        config.headers["x-year-id"] = yearData.year_id;
      } catch (e) {
        console.error("Error parsing selectedYear:", e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const API = process.env.REACT_APP_API_URL;

function AppRoutes({ company }) {
  const isLogged = localStorage.getItem("token");
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");


  React.useEffect(() => {
    // Start with sidebar closed as requested by user
    setIsSidebarOpen(false);
    
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
      // On larger screens, we still respect the user's manual choice or initial closed state
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className={`app-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {location.pathname !== "/login" && location.pathname !== "/design-card" && location.pathname !== "/design" && location.pathname !== "/" && (
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} company={company} />
      )}

      <main className="main-content">
        {location.pathname !== "/login" && location.pathname !== "/design-card" && location.pathname !== "/design" && location.pathname !== "/" && (
          <header className="top-header px-2 px-md-4 shadow-sm bg-white no-print d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button className="btn btn-light toggle-btn" onClick={toggleSidebar}>
                <i className="bi bi-layout-sidebar-inset fs-5"></i>
              </button>
            </div>

            <div className="flex-grow-1 mx-2 d-flex justify-content-center">
              <div style={{ width: "100%", maxWidth: "600px" }}>
                <UniversalSearch />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-end gap-2 gap-md-3">
              {selectedYear.year_name && (
                <div
                  className="d-none d-lg-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "#4f46e5",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    border: "1px solid rgba(99, 102, 241, 0.2)"
                  }}
                >
                  <i className="bi bi-calendar3"></i>
                  <span>Accounting Year: {selectedYear.year_name}</span>
                </div>
              )}
              <NotificationBell />
            </div>
          </header>
        )}


        <div className={(location.pathname === "/design-card" || location.pathname === "/design" || location.pathname === "/") ? "" : "content-area p-3 p-md-4"}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/design" element={<LandingPage />} />
            <Route path="/design-card" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={isLogged ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/users" element={isLogged ? <UserList /> : <Navigate to="/login" />} />
            <Route path="/users/add" element={isLogged ? <AddUser /> : <Navigate to="/login" />} />
            <Route path="/users/edit/:id" element={isLogged ? <EditUser /> : <Navigate to="/login" />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/customermy" element={<Customermy />} />
            <Route path="/editcustomer/:id" element={<EditCustomer />} />

            <Route path="/supplier" element={<Supplier />} />
            <Route path="/suppliermy" element={<Suppliermy />} />
            <Route path="/editsupplier/:id" element={<EditSupplier />} />

            <Route path="/employee" element={<Employee />} />
            <Route path="/employeemy" element={<Employeemy />} />
            <Route path="/editemployee/:id" element={<EditEmployee />} />

            <Route path="/contractor-list" element={<ContractorList />} />
            <Route path="/contractor-add" element={<ContractorAdd />} />
            <Route path="/contractor-edit/:id" element={<ContractorEdit />} />
            <Route path="/pcs-return-list" element={<OrderJobworkPcsReturnList />} />
            <Route path="/pcs-return-add" element={<OrderJobworkPcsReturn />} />
            <Route path="/yarn-po-list" element={<YarnPOList />} />
            <Route path="/yarn-po-add" element={<YarnPO />} />
            <Route path="/yarn-po-edit/:id" element={<EditYarnPO />} />
            <Route path="/fabric-po-list" element={<FabricPOList />} />
            <Route path="/fabric-po-add" element={<FabricPO />} />
            <Route path="/fabric-po-edit/:id" element={<EditFabricPO />} />
            <Route path="/trims-po-list" element={<TrimsPOList />} />
            <Route path="/trims-po-add" element={<TrimsPO />} />
            <Route path="/trims-po-edit/:id" element={<EditTrimsPO />} />
            <Route path="/garments-po-list" element={<GarmentsPOList />} />
            <Route path="/garments-po-add" element={<GarmentsPO />} />
            <Route path="/garments-po-edit/:id" element={<EditGarmentsPO />} />
            <Route path="/general-po-list" element={<GeneralPOList />} />
            <Route path="/general-po-add" element={<GeneralPO />} />
            <Route path="/general-po-edit/:id" element={<EditGeneralPO />} />
            <Route path="/yarn-grn-add" element={<YarnGRN />} />
            <Route path="/yarn-grn-list" element={<YarnGRNList />} />
            <Route path="/yarn-grn-edit/:id" element={<EditYarnGRN />} />
            <Route path="/fabric-grn-add" element={<FabricGRN />} />
            <Route path="/fabric-grn-list" element={<FabricGRNList />} />
            <Route path="/fabric-grn-edit/:id" element={<EditFabricGRN />} />
            <Route path="/trims-grn-add" element={<TrimsGRN />} />
            <Route path="/trims-grn-list" element={<TrimsGRNList />} />
            <Route path="/trims-grn-edit/:id" element={<EditTrimsGRN />} />
            <Route path="/garments-grn-add" element={<GarmentsGRN />} />
            <Route path="/garments-grn-list" element={<GarmentsGRNList />} />
            <Route path="/garments-grn-edit/:id" element={<EditGarmentsGRN />} />
            <Route path="/general-grn-add" element={<GeneralGRN />} />
            <Route path="/general-grn-list" element={<GeneralGRNList />} />
            <Route path="/general-grn-edit/:id" element={<EditGeneralGRN />} />
            <Route path="/product" element={<Product />} />
            <Route path="/productmy" element={<ProductMy />} />
            <Route path="/editproduct/:id" element={<EditProduct />} />
            <Route path="/categoryform" element={<CategoryForm />} />
            <Route path="/subcategoryform" element={<SubCategoryForm />} />
            <Route path="/supersubcategoryform" element={<SupersubcategoryForm />} />
            <Route path="/size" element={<Size />} />
            <Route path="/color" element={<Color />} />
            <Route path="/brandform" element={<BrandForm />} />
            <Route path="/inventory" element={<Inventory />} />

            <Route path="/accounts" element={<Accounts />} />
            <Route path="/salesreturnform" element={<SalesreturnForm />} />
            <Route path="/purchasereturnform" element={<PurchasereturnForm />} />
            <Route path="/invoiceform" element={<InvoiceForm />} />
            <Route path="/estimateform" element={<EstimateForm />} />
            <Route path="/dcform" element={<DcForm />} />
            <Route path="/grnform" element={<GrnForm />} />
            <Route path="/inwardform" element={<InwardForm />} />
            <Route path="/inwardmy" element={<InwardMy />} />
            <Route path="/poform" element={<PoForm />} />
            <Route path="/piform" element={<PiForm />} />
            <Route path="/creditnoteform" element={<CreditnoteForm />} />
            <Route path="/debitnoteform" element={<DebitnoteForm />} />
            <Route path="/quotationform" element={<Quotationform />} />
            <Route path="/purchaseform" element={<PurchaseForm />} />
            <Route path="/template" element={<Template />} />
            <Route path="/receiptform" element={<ReceiptForm />} />
            <Route path="/editpurchasereturnform/:id" element={<EditPurchasereturnForm />} />
            <Route path="/editsalesreturnform/:id" element={<EditSalesreturnForm />} />
            <Route path="/editpoform/:id" element={<EditPoForm />} />
            <Route path="/editgrnform/:id" element={<EditGrnForm />} />
            <Route path="/editdcform/:id" element={<EditDcForm />} />
            <Route path="/editpiform/:id" element={<EditPiForm />} />
            <Route path="/editcreditnoteform/:id" element={<EditCreditnoteForm />} />
            <Route path="/editdebitnoteform/:id" element={<EditDebitnoteForm />} />
            <Route path="/editestimateform/:id" element={<EditEstimateForm />} />
            <Route path="/editquotationform/:id" element={<EditQuotationForm />} />
            <Route path="/editinvoiceform/:id" element={<EditinvoiceForm />} />
            <Route path="/editpurchaseform/:id" element={<EditPurchaseForm />} />
            <Route path="/editreceipt/:id" element={<EditReceiptForm />} />
            <Route path="/editvoucher/:id" element={<EditVoucherForm />} />
            <Route path="/voucherform" element={<VoucherForm />} />
            <Route path="/receiptmy" element={<ReceiptMy />} />
            <Route path="/vouchermy" element={<VoucherMy />} />
            <Route path="/salesreturnmy" element={<Salesreturnmy />} />
            <Route path="/purchasereturnmy" element={<Purchasereturnmy />} />
            <Route path="/dcmy" element={<Dcmy />} />
            <Route path="/grnmy" element={<Grnmy />} />
            <Route path="/creditnotemy" element={<Creditnotemy />} />
            <Route path="/debitnotemy" element={<Debitnotemy />} />
            <Route path="/estimatemy" element={<Estimatemy />} />
            <Route path="/pomy" element={<Pomy />} />
            <Route path="/pimy" element={<Pimy />} />
            <Route path="/invoicemy" element={<Invoicemy />} />
            <Route path="/quotationmy" element={<Quotationmy />} />
            <Route path="/purchasemy" element={<Purchasemy />} />
            <Route path="/modeofpayment" element={<Modeofpayment />} />
            <Route path="/bankaccount" element={<Bankaccount />} />
            <Route path="/accounthead" element={<Accounthead />} />
            <Route path="/invoicedownload" element={<InvoiceDownload />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/outstanding" element={<OutstandingReport />} />
            <Route path="/invoice-ledger" element={<InvoiceLedger />} />
            <Route path="/invoice-summary" element={<InvoiceSummary />} />
            <Route path="/quotation-ledger" element={<QuotationLedger />} />
            <Route path="/quotation-summary" element={<QuotationSummary />} />
            <Route path="/po-ledger" element={<POLedger />} />
            <Route path="/po-summary" element={<POSummary />} />
            <Route path="/dc-ledger" element={<DCLedger />} />
            <Route path="/dc-summary" element={<DCSummary />} />
            <Route path="/pi-ledger" element={<PILedger />} />
            <Route path="/pi-summary" element={<PISummary />} />
            <Route path="/profit-loss" element={<ProfitLossReport />} />
            <Route path="/hsn-report" element={<HsnReport />} />
            <Route path="/company-statement" element={<CompanyStatement />} />
            <Route path="/bank-balance-report" element={isLogged ? <BankBalanceReport /> : <Navigate to="/login" />} />
            <Route path="/stock-report" element={<StockReport />} />
            <Route path="/gstr1-report" element={<Gstr1Report />} />
            <Route path="/customer-ageing" element={<AgeingReport type="customer" />} />
            <Route path="/supplier-ageing" element={<AgeingReport type="supplier" />} />
            <Route path="/invoice-ageing" element={<AgeingReport type="invoice" />} />
            <Route path="/rcm-report" element={<TaxExtraReport type="rcm" />} />
            <Route path="/amended-invoice-report" element={<TaxExtraReport type="amended" />} />
            <Route path="/cash-book-report" element={<CashBookReport />} />
            <Route path="/tds-report" element={<TaxReport type="tds" />} />
            <Route path="/tcs-report" element={<TaxReport type="tcs" />} />
            <Route path="/balance-sheet" element={<AdvancedReport type="balance-sheet" />} />
            <Route path="/trial-balance" element={<AdvancedReport type="trial-balance" />} />
            <Route path="/general-ledger" element={<AdvancedReport type="general-ledger" />} />
            <Route path="/daily-sales-report" element={<AdvancedReport type="daily-sales" />} />
            <Route path="/purchase-ledger" element={<PurchaseLedger />} />
            <Route path="/purchase-summary" element={<PurchaseSummary />} />
            <Route path="/sales-return-ledger" element={<SalesReturnLedger />} />
            <Route path="/sales-return-summary" element={<SalesReturnSummary />} />
            <Route path="/debit-note-ledger" element={<DebitNoteLedger />} />
            <Route path="/debit-note-summary" element={<DebitNoteSummary />} />
            <Route path="/purchase-return-ledger" element={<PurchaseReturnLedger />} />
            <Route path="/purchase-return-summary" element={<PurchaseReturnSummary />} />
            <Route path="/credit-note-ledger" element={<CreditNoteLedger />} />
            <Route path="/credit-note-summary" element={<CreditNoteSummary />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/countrymaster" element={<CountryMaster />} />
            <Route path="/statemaster" element={<StateMaster />} />
            <Route path="/citymaster" element={<CityMaster />} />
            <Route path="/usertypemaster" element={<UserTypeMaster />} />
            <Route path="/userprivilege" element={<UserPrivilege />} />
            <Route path="/modulemaster" element={<ModuleMaster />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/accounting-years" element={<AccountingYearMaster />} />
            <Route path="/agent" element={<AgentForm />} />
            <Route path="/customer-bulk-import" element={<CustomerBulkImport />} />
            <Route path="/supplier-bulk-import" element={<SupplierBulkImport />} />
            <Route path="/product-bulk-import" element={<ProductBulkImport />} />
            <Route path="/product-bulk-creator" element={<ProductBulkCreator />} />
            <Route path="/price-list" element={<PriceList />} />
            <Route path="/price-list-master" element={<PriceListMaster />} />
            <Route path="/size-charts" element={<SizeChartMy />} />
            <Route path="/size-chart/add" element={<SizeChartForm />} />
            <Route path="/size-chart/edit/:id" element={<SizeChartForm />} />
            <Route path="/uom" element={<UomMy />} />
            <Route path="/uom/add" element={<UomForm />} />
            <Route path="/uom/edit/:id" element={<UomForm />} />
            <Route path="/dia-charts" element={<DiaChartMy />} />
            <Route path="/dia-chart/add" element={<DiaChartForm />} />
            <Route path="/dia-chart/edit/:id" element={<DiaChartForm />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/barcode-creation" element={<BarcodeCreation />} />

            <Route path="/lead-my" element={<LeadMy />} />
            <Route path="/lead-form" element={<LeadForm />} />
            <Route path="/edit-lead/:id" element={<LeadForm />} />
            <Route path="/lead-source" element={<LeadSourceMaster />} />
            <Route path="/product-type" element={<ProductTypeMaster />} />
            <Route path="/lead-status" element={<LeadStatusMaster />} />
            <Route path="/garments" element={<Garments />} />
            <Route path="/tna-add" element={isLogged ? <TnaAdd /> : <Navigate to="/login" />} />
            <Route path="/tna-track" element={isLogged ? <TnaTrack /> : <Navigate to="/login" />} />
            <Route path="/tna-my-page" element={isLogged ? <TnaMyPage /> : <Navigate to="/login" />} />
            <Route path="/tna-process-master" element={isLogged ? <TnaProcessMaster /> : <Navigate to="/login" />} />
            <Route path="/tna-status-update/:id" element={isLogged ? <TnaStatusUpdate /> : <Navigate to="/login" />} />
            <Route path="/tna-status-update/:id/:processId" element={isLogged ? <TnaStatusUpdate /> : <Navigate to="/login" />} />
            <Route path="/order-planning" element={<OrderPlanning />} />
            <Route path="/order-planning/:id" element={<OrderPlanning />} />
            <Route path="/order-planning-my" element={<OrderPlanningmy />} />
            <Route path="/style-planning" element={<StylePlanning />} />
            <Route path="/style-planning/:id" element={<StylePlanning />} />
            <Route path="/style-planning-my" element={<StylePlanningmy />} />
            <Route path="/season-master" element={<SeasonMaster />} />
            <Route path="/yarn-stock" element={<YarnStock />} />
            <Route path="/yarn-stock-report" element={<YarnStockReport />} />
            <Route path="/fabric-stock" element={<FabricStock />} />
            <Route path="/fabric-stock-report" element={<FabricStockReport />} />
            <Route path="/trims-stock" element={<TrimsStock />} />
            <Route path="/lifecycle" element={<LifeCycleForm />} />
            <Route path="/body-part-master" element={<BodyPartForm />} />
            <Route path="/order-jobwork-yarn-to-fabric-outward" element={<OrderJobworkYarnToFabricOutward />} />
            <Route path="/lot-jobwork-yarn-to-fabric-outward" element={<LotJobworkYarnToFabricOutward />} />
            <Route path="/internal-lot-yarn-to-fabric-outward" element={<InternalLotYarnToFabricOutward />} />
            <Route path="/order-jobwork-yarn-to-fabric-list" element={<OrderJobworkYarnToFabricList />} />
            <Route path="/lot-jobwork-yarn-to-fabric-list" element={<LotJobworkYarnToFabricList />} />
            <Route path="/internal-lot-yarn-to-fabric-list" element={<InternalLotYarnToFabricList />} />
            <Route path="/edit-order-jobwork-yarn-to-fabric-outward/:id" element={<EditOrderJobworkYarnToFabricOutward />} />
            <Route path="/edit-lot-jobwork-yarn-to-fabric-outward/:id" element={<EditLotJobworkYarnToFabricOutward />} />
            <Route path="/edit-internal-lot-yarn-to-fabric-outward/:id" element={<EditInternalLotYarnToFabricOutward />} />
            <Route path="/order-jobwork-yarn-to-fabric-inward" element={<OrderJobworkYarnToFabricInward />} />
            <Route path="/lot-jobwork-yarn-to-fabric-inward" element={<LotJobworkYarnToFabricInward />} />
            <Route path="/internal-lot-yarn-to-fabric-inward" element={<InternalLotYarnToFabricInward />} />
            <Route path="/order-jobwork-yarn-to-fabric-inward-list" element={<OrderJobworkYarnToFabricInwardList />} />
            <Route path="/lot-jobwork-yarn-to-fabric-inward-list" element={<LotJobworkYarnToFabricInwardList />} />
            <Route path="/internal-lot-yarn-to-fabric-inward-list" element={<InternalLotYarnToFabricInwardList />} />
            <Route path="/edit-order-jobwork-yarn-to-fabric-inward/:id" element={<EditOrderJobworkYarnToFabricInward />} />
            <Route path="/edit-lot-jobwork-yarn-to-fabric-inward/:id" element={<EditLotJobworkYarnToFabricInward />} />
            <Route path="/edit-internal-lot-yarn-to-fabric-inward/:id" element={<EditInternalLotYarnToFabricInward />} />
            <Route path="/order-jobwork-yarn-to-fabric-return" element={<OrderJobworkYarnToFabricReturn />} />
            <Route path="/lot-jobwork-yarn-to-fabric-return" element={<LotJobworkYarnToFabricReturn />} />
            <Route path="/internal-lot-yarn-to-fabric-return" element={<InternalLotYarnToFabricReturn />} />
            <Route path="/order-jobwork-yarn-to-fabric-return-list" element={<OrderJobworkYarnToFabricReturnList />} />
            <Route path="/lot-jobwork-yarn-to-fabric-return-list" element={<LotJobworkYarnToFabricReturnList />} />
            <Route path="/internal-lot-yarn-to-fabric-return-list" element={<InternalLotYarnToFabricReturnList />} />
            <Route path="/edit-order-jobwork-yarn-to-fabric-return/:id" element={<EditOrderJobworkYarnToFabricReturn />} />
            <Route path="/edit-lot-jobwork-yarn-to-fabric-return/:id" element={<EditLotJobworkYarnToFabricReturn />} />
            <Route path="/edit-internal-lot-yarn-to-fabric-return/:id" element={<EditInternalLotYarnToFabricReturn />} />
            <Route path="/order-jobwork-fabric-to-pcs-outward" element={<OrderJobworkFabricToPcsOutward />} />
            <Route path="/order-jobwork-fabric-to-pcs-outward-list" element={<OrderJobworkFabricToPcsOutwardList />} />
            <Route path="/edit-order-jobwork-fabric-to-pcs-outward/:id" element={<EditOrderJobworkFabricToPcsOutward />} />
            <Route path="/lot-jobwork-fabric-to-pcs-outward" element={<LotJobworkFabricToPcsOutward />} />
            <Route path="/lot-jobwork-fabric-to-pcs-outward-list" element={<LotJobworkFabricToPcsOutwardList />} />
            <Route path="/edit-lot-jobwork-fabric-to-pcs-outward/:id" element={<EditLotJobworkFabricToPcsOutward />} />
            <Route path="/internal-lot-fabric-to-pcs-outward" element={<InternalLotFabricToPcsOutward />} />
            <Route path="/internal-lot-fabric-to-pcs-outward-list" element={<InternalLotFabricToPcsOutwardList />} />
            <Route path="/edit-internal-lot-fabric-to-pcs-outward/:id" element={<EditInternalLotFabricToPcsOutward />} />

            <Route path="/order-jobwork-fabric-to-pcs-inward" element={<OrderJobworkFabricToPcsInward />} />
            <Route path="/order-jobwork-fabric-to-pcs-inward-list" element={<OrderJobworkFabricToPcsInwardList />} />
            <Route path="/edit-order-jobwork-fabric-to-pcs-inward/:id" element={<EditOrderJobworkFabricToPcsInward />} />
            <Route path="/lot-jobwork-fabric-to-pcs-inward" element={<LotJobworkFabricToPcsInward />} />
            <Route path="/lot-jobwork-fabric-to-pcs-inward-list" element={<LotJobworkFabricToPcsInwardList />} />
            <Route path="/edit-lot-jobwork-fabric-to-pcs-inward/:id" element={<EditLotJobworkFabricToPcsInward />} />
            <Route path="/internal-lot-fabric-to-pcs-inward" element={<InternalLotFabricToPcsInward />} />
            <Route path="/internal-lot-fabric-to-pcs-inward-list" element={<InternalLotFabricToPcsInwardList />} />
            <Route path="/edit-internal-lot-fabric-to-pcs-inward/:id" element={<EditInternalLotFabricToPcsInward />} />

            <Route path="/order-jobwork-fabric-to-pcs-return" element={<OrderJobworkFabricToPcsReturn />} />
            <Route path="/order-jobwork-fabric-to-pcs-return-list" element={<OrderJobworkFabricToPcsReturnList />} />
            <Route path="/edit-order-jobwork-fabric-to-pcs-return/:id" element={<EditOrderJobworkFabricToPcsReturn />} />
            <Route path="/lot-jobwork-fabric-to-pcs-return" element={<LotJobworkFabricToPcsReturn />} />
            <Route path="/lot-jobwork-fabric-to-pcs-return-list" element={<LotJobworkFabricToPcsReturnList />} />
            <Route path="/edit-lot-jobwork-fabric-to-pcs-return/:id" element={<EditLotJobworkFabricToPcsReturn />} />
            <Route path="/internal-lot-fabric-to-pcs-return" element={<InternalLotFabricToPcsReturn />} />
            <Route path="/internal-lot-fabric-to-pcs-return-list" element={<InternalLotFabricToPcsReturnList />} />
            <Route path="/edit-internal-lot-fabric-to-pcs-return/:id" element={<EditInternalLotFabricToPcsReturn />} />

            <Route path="/order-jobwork-pcs-outward" element={<OrderJobworkPcsOutward />} />
            <Route path="/order-jobwork-pcs-outward-list" element={<OrderJobworkPcsOutwardList />} />
            <Route path="/edit-order-jobwork-pcs-outward/:id" element={<EditOrderJobworkPcsOutward />} />
            <Route path="/order-jobwork-pcs-inward" element={<OrderJobworkPcsInward />} />
            <Route path="/order-jobwork-pcs-inward-list" element={<OrderJobworkPcsInwardList />} />
            <Route path="/edit-order-jobwork-pcs-inward/:id" element={<EditOrderJobworkPcsInward />} />
            <Route path="/order-jobwork-pcs-return" element={<OrderJobworkPcsReturn />} />
            <Route path="/order-jobwork-pcs-return-list" element={<OrderJobworkPcsReturnList />} />
            <Route path="/edit-order-jobwork-pcs-return/:id" element={<EditOrderJobworkPcsReturn />} />

            <Route path="/lifecycle-templates" element={<LifeCycleTemplateMaster />} />
            <Route path="/contractor-wages-list" element={isLogged ? <ContractorWagesList /> : <Navigate to="/login" />} />
            <Route path="/contractor-wages-add" element={isLogged ? <ContractorWagesAdd /> : <Navigate to="/login" />} />
            <Route path="/contractor-wages-edit/:id" element={isLogged ? <ContractorWagesAdd /> : <Navigate to="/login" />} />

            <Route path="/direct-inward" element={<DirectInwardList />} />
            <Route path="/direct-inward/new" element={<DirectInward />} />
            <Route path="/direct-inward/edit" element={<DirectInward />} />

            <Route path="/yarn-inward-list" element={<YarnInwardList />} />
            <Route path="/yarn-inward/new" element={<YarnInward />} />
            <Route path="/yarn-inward/edit" element={<YarnInward />} />
            <Route path="/fabric-inward-list" element={<FabricInwardList />} />
            <Route path="/fabric-inward/new" element={<FabricInward />} />
            <Route path="/fabric-inward/edit" element={<FabricInward />} />
            <Route path="/trims-inward-list" element={<TrimsInwardList />} />
            <Route path="/trims-inward/new" element={<TrimsInward />} />
            <Route path="/trims-inward/edit" element={<TrimsInward />} />

            <Route path="/production-lot-list" element={<ProductionLotList />} />
            <Route path="/production-lot/new" element={<ProductionLot />} />
            <Route path="/production-lot/edit" element={<ProductionLot />} />

            <Route path="/internal-lot-list" element={<InternalLotList />} />
            <Route path="/internal-lot/new" element={<InternalLot />} />
            <Route path="/internal-lot/edit" element={<InternalLot />} />

            <Route path="/order-sheet-report" element={<OrderSheetReport />} />
            <Route path="/order-ledger-report" element={<OrderStatusReport />} />
            <Route path="/activity-logs" element={isLogged ? <ActivityLogs /> : <Navigate to="/login" />} />
            <Route path="/wip-report" element={<PcsWipReport />} />

            <Route path="/style-profit-loss-report" element={<GenericERPReport title="Profit & Loss (Style Wise)" endpoint="profit-loss-style" columns={[
              { key: 'order_no', label: 'Order No' },
              { key: 'style_name', label: 'Style' },
              { key: 'budget_cost', label: 'Budget Cost/Pcs' },
              { key: 'selling_price', label: 'Selling Price' },
              { key: 'margin_per_pcs', label: 'Margin/Pcs', render: (row) => <span className={row.margin_per_pcs >= 0 ? 'text-success' : 'text-danger'}>{parseFloat(row.margin_per_pcs).toFixed(2)}</span> }
            ]} />} />

            <Route path="/order-detailed-report" element={<OrderDetailedReport />} />

            <Route path="/yarn-stock-report" element={<GenericERPReport title="Yarn Stock Report" endpoint="yarn-stock" columns={[
              { key: 'yarn_name', label: 'Yarn Name' },
              { key: 'yarn_sku', label: 'SKU' },
              { key: 'current_stock', label: 'Current Stock' },
              { key: 'minimum_stock', label: 'Min. Level' }
            ]} />} />

            <Route path="/fabric-stock-report" element={<GenericERPReport title="Fabric Stock Report" endpoint="fabric-stock" columns={[
              { key: 'fabric_name', label: 'Fabric Name' },
              { key: 'sku', label: 'SKU' },
              { key: 'current_stock', label: 'Current Stock' }
            ]} />} />

            <Route path="/daily-production-report" element={<GenericERPReport title="Daily Production Report" endpoint="daily-production" columns={[
              { key: 'date', label: 'Date' },
              { key: 'process', label: 'Process' },
              { key: 'total_produced', label: 'Qty Produced' },
              { key: 'orders_count', label: 'Orders Handled' }
            ]} dateField="date" />} />

            <Route path="/fabric-balance-report" element={<GenericERPReport title="Fabric Balance Report (Required vs Received)" endpoint="fabric-balance" columns={[
              { key: 'order_no', label: 'Order No' },
              { key: 'style_name', label: 'Style' },
              { key: 'fabric_name', label: 'Fabric' },
              { key: 'required_qty', label: 'Required (KG)' },
              { key: 'received_qty', label: 'Received (KG)', render: (row) => <span className="text-success fw-bold">{parseFloat(row.received_qty || 0).toFixed(2)}</span> },
              { key: 'balance', label: 'Balance', render: (row) => <span>{(parseFloat(row.required_qty) - parseFloat(row.received_qty || 0)).toFixed(2)}</span> }
            ]} />} />

            <Route path="/budget-actual-report" element={<GenericERPReport title="Budget vs Actual Report" endpoint="profit-loss-style" columns={[
              { key: 'order_no', label: 'Order No' },
              { key: 'style_name', label: 'Style' },
              { key: 'budget_cost', label: 'Budgeted Cost' },
              { key: 'selling_price', label: 'Actual/Target Price' }
            ]} />} />

            <Route path="/line-production-report" element={<GenericERPReport title="Line Wise Production Report" endpoint="daily-production" columns={[
              { key: 'date', label: 'Date' },
              { key: 'process', label: 'Line (Process Group)' },
              { key: 'total_produced', label: 'Produced Qty' }
            ]} />} />
          </Routes>
        </div>
      </main>
    </div >
  );
}

export default function App() {
  const [company, setCompany] = useState({ company_name: "TSL ERP", logo: "/images/TSL Logo 2.jpg" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/company-profile`)
      .then(res => {
        if (res.data && res.data.company_name) {
          setCompany(res.data);
        }
      })
      .catch(err => console.error("Error fetching company profile:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Initializing TSL ERP..." />;

  return (
    <BrowserRouter>
      <AppRoutes company={company} />
    </BrowserRouter>
  );
}
