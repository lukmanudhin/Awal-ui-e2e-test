import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { HomePage } from "../pages/homePage";
import { Modules } from "../pages/modules";
import { SalesEnquiryPage } from "../pages/salesEnqueryPage";
import { ProductsPage } from "../pages/productsPage";
import { PPJOPage } from "../pages/ppjoPage";
import { RequestNormalPage } from "../pages/requestNormalPage";
import { BasePage } from "../pages/basePage";
import { CostEstimationPage } from "../pages/costEstimationPage";
import { RequestApprovalPage } from "../pages/requestApprovalPage";
import { QuotationManagerPage } from "../pages/quotationManagerPage";
import { InvoiceRequestPage } from "../pages/invoiceRequestPage";
import { SalesOrderManagerPage } from "../pages/salesOrderManagerPage";
import { MaterialIndentRequestPage } from "../pages/materialIndentRequestPage";
import { StockViewAPI } from "../API/stockView";
import { SalesEnquiryAPI } from "../API/salesEnquiryAPI";
import { CreateMaterialAPI } from "../API/createMaterialAPI";
import { PRRequestPage } from "../pages/prRequestPage";
import { ProcurementPage } from "../pages/procurementPage";
import { GRNEntryPage } from "../pages/grnEntryPage";
import { PutAwayPage } from "../pages/putAwayPage";
import { ManufacturingPage } from "../pages/manufacturingPage";
import { TradingPage } from "../pages/tradingPage";
import { PipelinePage } from "../pages/pipelinePage";
import { CreditControlPage } from "../pages/creditControlPage";
import { SalesReturnPage } from "../pages/salesReturnPage";
import { SalesReturnAPI } from "../API/salesReturnAPI";

type baseFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  modules: Modules;
  salesEnquiryPage: SalesEnquiryPage;
  productsPage: ProductsPage;
  ppjoPage: PPJOPage;
  requestNormalPage: RequestNormalPage;
  basePage: BasePage
  costEstimationPage: CostEstimationPage,
  requestApprovalPage: RequestApprovalPage
  quotationManagerPage: QuotationManagerPage;
  invoiceRequestPage: InvoiceRequestPage;
  salesOrderManagerPage: SalesOrderManagerPage;
  materialIndentRequestPage: MaterialIndentRequestPage;
  salesEnquiryAPI: SalesEnquiryAPI;
  stockViewAPI: StockViewAPI;
  createMaterialAPI: CreateMaterialAPI;
  prRequestPage: PRRequestPage;
  procurementPage: ProcurementPage;
  grnEntryPage: GRNEntryPage;
  putAwayPage: PutAwayPage;
  manufacturingPage: ManufacturingPage;
  tradingPage: TradingPage;
  pipelinePage: PipelinePage;
  creditControlPage: CreditControlPage;
  salesReturnPage: SalesReturnPage;
  salesReturnAPI: SalesReturnAPI;
};

export const test = base.extend<baseFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
    homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  modules: async ({ page }, use) => {
    await use(new Modules(page));
  },
  salesEnquiryPage: async ({ page }, use) => {
    await use(new SalesEnquiryPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  ppjoPage: async ({ page }, use) => {
    await use(new PPJOPage(page));
  },
  requestNormalPage: async ({ page }, use) => {
    await use(new RequestNormalPage(page));
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  costEstimationPage: async ({ page }, use) => {
    await use(new CostEstimationPage(page));
  },
  requestApprovalPage: async ({ page }, use) => {
    await use(new RequestApprovalPage(page));
  },
  quotationManagerPage: async ({ page }, use) => {
    await use(new QuotationManagerPage(page));
  },
  invoiceRequestPage: async ({ page }, use) => {
    await use(new InvoiceRequestPage(page));
  },
  salesOrderManagerPage: async ({ page }, use) => {
    await use(new SalesOrderManagerPage(page));
  },
  materialIndentRequestPage: async ({ page }, use) => {
    await use(new MaterialIndentRequestPage(page));
  }, 
  salesEnquiryAPI: async ({ request }, use) => {
    await use(new SalesEnquiryAPI(request));
  }, 
  stockViewAPI: async ({ request }, use) => {
    await use(new StockViewAPI(request));
  },
  createMaterialAPI: async ({ request }, use) => {
    await use(new CreateMaterialAPI(request));
  },
  prRequestPage: async ({ page }, use) => {
    await use(new PRRequestPage(page));
  },
  procurementPage: async ({ page }, use) => {
    await use(new ProcurementPage(page));
  },
  grnEntryPage: async ({ page }, use) => {
    await use(new GRNEntryPage(page));
  },
  putAwayPage: async ({ page }, use) => {
    await use(new PutAwayPage(page));
  },
  manufacturingPage: async ({ page }, use) => {
    await use(new ManufacturingPage(page));
  },
  tradingPage: async ({ page }, use) => {
    await use(new TradingPage(page));
  },
  pipelinePage: async ({ page }, use) => {
    await use(new PipelinePage(page));
  },
  creditControlPage: async ({ page }, use) => {
    await use(new CreditControlPage(page));
  },
  salesReturnPage: async ({ page }, use) => {
    await use(new SalesReturnPage(page));
  },
  salesReturnAPI: async ({ request }, use) => {
    await use(new SalesReturnAPI(request));
  },
});

export const expect = test.expect;


