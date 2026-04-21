const puppeteer = require('puppeteer');
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load backend .env for JWT secret
const backendEnv = dotenv.parse(fs.readFileSync(path.join(__dirname, 'backend', '.env')));
const JWT_SECRET = backendEnv.JWT_SECRET || 'your_jwt_secret_here';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'ppt_screenshots');
const OUTPUT_PPT = 'TheSuperlabs_ERP_Final.pptx';

const today = new Date();
const DATE_STR = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

const USERNAME = 'admin';
const PASSWORD = 'admin123';

// ── ORDER PLANNING TABS ─────────────────────────────────────────────
const ORDER_TABS = [
    { tab: 'Order Details', name: 'op_order_details', label: 'Order Planning – Order Details', points: ['Buyer / Own Brand Toggle', 'Auto Order Number', 'Season & Merchandiser', 'Delivery & Factory Dates'] },
    { tab: 'Costing', name: 'op_costing', label: 'Order Planning – Costing', points: ['Budget Cost Per Piece', 'CMT & Material Costing', 'Overhead & Profit Margins', 'Buyer-Wise Pricing'] },
    { tab: 'Size Qty Details', name: 'op_size_qty', label: 'Order Planning – Size Quantity', points: ['Size Chart Integration', 'Style-Wise Qty Matrix', 'Color & Ratio Breakdown', 'Total Qty Auto-Calc'] },
    { tab: 'Fabric Planning', name: 'op_fabric', label: 'Order Planning – Fabric Planning', points: ['Fabric Code & Composition', 'Required Qty per Size', 'Supplier Mapping', 'Shrinkage Allowance'] },
    { tab: 'Yarn Planning', name: 'op_yarn', label: 'Order Planning – Yarn Planning', points: ['Yarn Type & Count', 'Per Kg Requirement', 'Supplier & Mill Details', 'Color & Twist Specs'] },
    { tab: 'Trims Planning', name: 'op_trims', label: 'Order Planning – Trims Planning', points: ['Button, Label & Tag Planning', 'Per Piece Consumption', 'Supplier & Brand Details', 'Cost Tracking'] },
    { tab: 'Life Cycle', name: 'op_lifecycle', label: 'Order Planning – Life Cycle', points: ['Production Stage Mapping', 'Date & Progress Tracking', 'Responsibility Assignment', 'Status Monitoring'] },
    { tab: 'BOM', name: 'op_bom', label: 'Order Planning – Bill of Materials', points: ['Complete Material List', 'Estimated vs Actual Cost', 'Auto-Generated from Plans', 'Export Ready Summary'] },
];

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Kill framer-motion and all animations + Force white background
const KILL_ANIMATIONS_CSS = `
  body { background-color: #f8fafc !important; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0.01ms !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0.01ms !important;
  }
`;

async function login(page) {
    console.log('  - Bypassing login with direct state injection...');

    // 1. Navigate to /login to establish origin
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 40000 });

    // 2. Generate a valid token
    const token = jwt.sign(
        { id: 1, username: 'admin', role: 'Admin' },
        JWT_SECRET,
        { expiresIn: "10d" }
    );

    // 3. Inject full state
    await page.evaluate((t) => {
        const user = { id: 1, username: 'admin', name: 'Admin', role: 'Admin', usertype_id: 1 };
        const year = { year_id: 2, year_name: "2025-26" };
        const privileges = {}; // App handles empty or default

        localStorage.setItem("token", t);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("selectedYear", JSON.stringify(year));
        localStorage.setItem("privileges", JSON.stringify(privileges));
    }, token);

    // 4. Force navigation to dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 40000 });

    const isLoggedOut = page.url().includes('/login');
    if (isLoggedOut) {
        console.log('  ✗ Bypass failed, still on login page.');
        return false;
    }
    console.log('  ✓ Bypass success! Authenticated as admin.');
    return true;
}

async function safeScreenshot(page, filePath, waitMs = 3500) {
    await page.addStyleTag({ content: KILL_ANIMATIONS_CSS }).catch(() => { });
    await new Promise(r => setTimeout(r, waitMs));
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  ✓ ${path.basename(filePath)} captured successfully`);
    const size = Math.round(fs.statSync(filePath).size / 1024);
    console.log(`  ✓ ${path.basename(filePath)} (${size} KB)`);
    return size;
}

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1']
    });
    const page = await browser.newPage();
    page.on('console', msg => { if (msg.type() === 'error' || msg.text().includes('selectedYear')) console.log(`  [BROWSER] ${msg.text()}`); });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

    // ── LOGIN ─────────────────────────────────────────────────────────
    console.log('\n📸 Login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await safeScreenshot(page, path.join(SCREENSHOT_DIR, 'login.png'), 3000);
    await login(page);

    // ── MAIN MODULE PAGES ─────────────────────────────────────────────
    const MAIN_PAGES = [
        { url: '/dashboard', name: 'dashboard', waitMs: 6000 },
        { url: '/order-planning-my', name: 'order_planning_list', waitMs: 8000 },
        { url: '/garments', name: 'garments_top', waitMs: 6000 },
        { url: '/garments', name: 'garments_bottom', waitMs: 4000, scrollY: 1000 },
        { url: '/inventory', name: 'inventory', waitMs: 6000 },
        { url: '/accounts', name: 'accounts', waitMs: 4000 },
        { url: '/lead-my', name: 'crm', waitMs: 3500 },
        { url: '/reports', name: 'reports', waitMs: 4000 },

        // NEW JOBWORK PAGES REQUESTED
        { url: '/order-jobwork-yarn-to-fabric-list', name: 'yarn_to_fabric_list', waitMs: 5000 },
        { url: '/edit-order-jobwork-yarn-to-fabric-outward/16', name: 'yarn_to_fabric_form', waitMs: 6000 },
        { url: '/order-jobwork-fabric-to-pcs-outward-list', name: 'fabric_to_pcs_list', waitMs: 5000 },
        { url: '/edit-order-jobwork-fabric-to-pcs-outward/24', name: 'fabric_to_pcs_form', waitMs: 6000 },
        { url: '/order-jobwork-pcs-outward-list', name: 'pcs_list', waitMs: 5000 },
        { url: '/edit-order-jobwork-pcs-outward/15', name: 'pcs_form', waitMs: 6000 },

        // PRINT PREVIEWS REQUESTED
        { url: '/order-jobwork-yarn-to-fabric-list', name: 'yarn_to_fabric_print', waitMs: 4000, isPrintModal: true },
        { url: '/order-jobwork-fabric-to-pcs-outward-list', name: 'fabric_to_pcs_print', waitMs: 4000, isPrintModal: true },
        { url: '/order-jobwork-pcs-outward-list', name: 'pcs_print', waitMs: 4000, isPrintModal: true },
        { url: 'http://localhost:8081/printinvoice/invoice/102', name: 'invoice_print', waitMs: 8000, isDirect: true },
        { url: '/order-detailed-report', name: 'order_detailed_print', waitMs: 4000, isOrderReport: true, orderNo: '11' },

        { url: '/masters', name: 'masters', waitMs: 3500 },
        { url: '/invoiceform', name: 'invoice_add', waitMs: 4000 },
        { url: '/customermy', name: 'customers_list', waitMs: 3500 },
        { url: '/invoicemy', name: 'invoices_list', waitMs: 6000 }, // Increased wait for invoice list
        { url: '/order-detailed-report', name: 'order_detailed_report_2', waitMs: 4000, isOrderReport: true, orderNo: '11', scrollTop: 1200 },
        { url: '/order-detailed-report', name: 'order_detailed_report_3', waitMs: 4000, isOrderReport: true, orderNo: '11', scrollTop: 2400 },
    ];

    for (const pg of MAIN_PAGES) {
        console.log(`\n→ ${pg.url} ${pg.scrollTo > 0 ? '(scrolled)' : ''}`);
        try {
            const fullUrl = pg.isDirect ? pg.url : `${BASE_URL}${pg.url}`;

            // 1. Set Auth Context BEFORE navigation if it's a reload
            await page.evaluateOnNewDocument((t) => {
                const user = { id: 1, username: 'admin', name: 'Admin', role: 'Admin', usertype_id: 1 };
                const year = { year_id: 2, year_name: "2025-26" };
                const privileges = {
                    "Invoice": { can_view: 1, can_add: 1, can_update: 1, can_delete: 1, can_print: 1 },
                    "Reports": { can_view: 1, can_add: 1, can_update: 1, can_delete: 1, can_print: 1 }
                };
                localStorage.setItem("token", t);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("selectedYear", JSON.stringify(year));
                localStorage.setItem("privileges", JSON.stringify(privileges));
            }, jwt.sign({ id: 1, username: 'admin', role: 'Admin' }, JWT_SECRET, { expiresIn: "1d" }));

            if (pg.scrollTo === undefined || pg.scrollTo === 0) {
                await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 40000 });
                // If it redirected back to login, the bypass failed
                if (page.url().includes('/login') && !pg.isDirect) {
                    await login(page);
                    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 40000 });
                }
            }

            // 2. Set Auth Context AFTER navigation to be 100% sure
            await page.evaluate((t) => {
                const year = { year_id: 2, year_name: "2025-26" };
                localStorage.setItem("selectedYear", JSON.stringify(year));
            }, jwt.sign({ id: 1, username: 'admin', role: 'Admin' }, JWT_SECRET, { expiresIn: "1d" }));

            if (pg.scrollTo > 0) {
                await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), pg.scrollTo);
            }

            // Handle Print Modals
            if (pg.isPrintModal) {
                console.log(`  - Opening Print Modal...`);
                await page.evaluate(() => {
                    // Try to find the first print button and click it
                    const printBtns = Array.from(document.querySelectorAll('button')).filter(b =>
                        b.title === "Print this record" ||
                        b.innerHTML.includes('bi-printer') ||
                        b.innerText.includes('Print')
                    );
                    if (printBtns.length > 0) printBtns[0].click();
                });
                await new Promise(r => setTimeout(r, 2000));
            }

            // Handle Order Detailed Report
            if (pg.isOrderReport) {
                console.log(`  - Selecting Order ${pg.orderNo}...`);
                await page.waitForSelector('.custom-select-trigger', { timeout: 10000 }).catch(() => { });
                await page.evaluate(() => {
                    const trigger = document.querySelector('.custom-select-trigger');
                    if (trigger) trigger.click();
                });
                // Wait for any option to appear
                await page.waitForSelector('.order-option', { timeout: 10000 }).catch(() => { });
                await page.evaluate((no) => {
                    const options = Array.from(document.querySelectorAll('.order-option'));
                    const target = options.find(o => o.innerText.trim().includes(no) || o.innerText.toLowerCase().includes(no.toLowerCase()));
                    if (target) {
                        target.click();
                        console.log('BROWSER: Clicked order option ' + no);
                    } else {
                        console.log('BROWSER: Order option ' + no + ' NOT FOUND in ' + options.length + ' options');
                    }
                }, pg.orderNo);
                await new Promise(r => setTimeout(r, 15000)); // EVEN MORE TIME for data loading

                if (pg.scrollTop !== undefined) {
                    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), pg.scrollTop);
                }
            }

            await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${pg.name}.png`), pg.waitMs);
        } catch (e) { console.warn(`  ✗ ${e.message}`); }
    }

    // ── ORDER PLANNING LIST (with data) ───────────────────────────────
    console.log('\n→ Order Planning List (with data)');
    await page.goto(`${BASE_URL}/order-planning-my`, { waitUntil: 'networkidle2', timeout: 40000 });
    if (page.url().includes('/login')) { await login(page); await page.goto(`${BASE_URL}/order-planning-my`, { waitUntil: 'networkidle2', timeout: 40000 }); }
    await safeScreenshot(page, path.join(SCREENSHOT_DIR, 'order_planning_list.png'), 6000);

    // Map each tab to the order ID that actually has data in the DB
    const TAB_DATA_MAP = {
        'Order Details': 21,
        'Costing': 21,
        'Size Qty Details': 10,
        'Fabric Planning': 10,
        'Yarn Planning': 2,
        'Trims Planning': 10,
        'Life Cycle': 21,
        'BOM': 10
    };

    // ── ORDER PLANNING TABS ───────────────────────────────────────────
    console.log(`\n📋 Screenshotting Order Planning tabs with mapped data`);

    for (const tabInfo of ORDER_TABS) {
        console.log(`\n→ Order Planning Tab: ${tabInfo.tab}`);
        let targetOrderId = TAB_DATA_MAP[tabInfo.tab] || 21;

        try {
            // Set the active tab in localStorage before navigating
            await page.goto(`${BASE_URL}/order-planning/${targetOrderId}`, { waitUntil: 'networkidle2', timeout: 40000 });
            if (page.url().includes('/login')) {
                await login(page);
                await page.goto(`${BASE_URL}/order-planning/${targetOrderId}`, { waitUntil: 'networkidle2', timeout: 40000 });
                await page.goto(`${BASE_URL}/order-planning/${targetOrderId}`, { waitUntil: 'load', timeout: 60000 });
            }

            // Set which tab to show via localStorage
            await page.evaluate(({ orderId, tabName }) => {
                localStorage.setItem(`order_planning_active_tab_${orderId}`, tabName);
            }, { orderId: targetOrderId, tabName: tabInfo.tab });

            // Reload page so it picks up the localStorage tab
            await page.reload({ waitUntil: 'load', timeout: 60000 });
            await new Promise(r => setTimeout(r, 6000)); // Extra wait for tab content / APIs to load fully

            // Try clicking the tab directly as backup
            try {
                const tabClicked = await page.evaluate((tabLabel) => {
                    const tabItems = [...document.querySelectorAll('.tab-item')];
                    const target = tabItems.find(el => el.textContent.trim().includes(tabLabel));
                    if (target) { target.click(); return true; }
                    return false;
                }, tabInfo.tab);
                if (tabClicked) await new Promise(r => setTimeout(r, 4000));
            } catch (e) { /* ignore */ }

            await safeScreenshot(page, path.join(SCREENSHOT_DIR, `${tabInfo.name}.png`), 4000);
        } catch (e) { console.warn(`  ✗ Tab "${tabInfo.tab}" failed: ${e.message}`); }
    }

    await browser.close();
    console.log('\n✓ All screenshots done. Building PPT...\n');

    // ═══════════════════════════════════════════════════════════════
    // BUILD THE PPT
    // ═══════════════════════════════════════════════════════════════
    const prs = new PptxGenJS();
    prs.layout = 'LAYOUT_WIDE'; // 13.33" × 7.5"

    const WHITE = 'FFFFFF';
    const LIGHT_BG = 'F8FAFC';
    const ACCENT = '1E40AF';   // Deep Blue
    const ACCENT2 = '3B82F6';   // Mid Blue
    const DARK_TEXT = '1E293B';
    const MID_TEXT = '475569';
    const LIGHT_TEXT = '94A3B8';
    const BORDER = 'E2E8F0';

    function addSlideBase(slide) {
        slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: WHITE } });
        slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.07, fill: { color: ACCENT } });
        slide.addShape(prs.ShapeType.rect, { x: 0, y: 7.29, w: '100%', h: 0.01, fill: { color: BORDER } });
        slide.addShape(prs.ShapeType.rect, { x: 0, y: 7.3, w: '100%', h: 0.2, fill: { color: LIGHT_BG } });
        slide.addText(`TheSuperlabs ERP  •  Confidential  •  ${DATE_STR}`, {
            x: 0, y: 7.3, w: '100%', h: 0.2, fontSize: 7, color: LIGHT_TEXT, align: 'center', fontFace: 'Segoe UI'
        });
    }

    function addSlideHeader(slide, num, titleText, breadcrumb = '') {
        slide.addText(num, { x: 0.3, y: 0.12, w: 0.7, h: 0.4, fontSize: 9, color: ACCENT2, bold: true, fontFace: 'Segoe UI' });
        slide.addText(titleText, { x: 1.0, y: 0.12, w: 11.8, h: 0.52, fontSize: 22, bold: true, color: DARK_TEXT, fontFace: 'Segoe UI', valign: 'middle' });
        if (breadcrumb) {
            slide.addText(breadcrumb, { x: 1.0, y: 0.65, w: 8, h: 0.22, fontSize: 9, color: LIGHT_TEXT, fontFace: 'Segoe UI' });
        }
        slide.addShape(prs.ShapeType.rect, { x: 0.3, y: breadcrumb ? 0.9 : 0.75, w: 2.5, h: 0.03, fill: { color: ACCENT2 } });
    }

    function addInfoCards(slide, points) {
        points.forEach((pt, i) => {
            const y = 1.1 + i * 1.5;
            slide.addShape(prs.ShapeType.rect, { x: 9.1, y, w: 3.93, h: 1.25, fill: { color: LIGHT_BG }, line: { color: BORDER, width: 1 } });
            slide.addShape(prs.ShapeType.rect, { x: 9.1, y, w: 0.12, h: 1.25, fill: { color: ACCENT2 } });
            slide.addShape(prs.ShapeType.ellipse, { x: 9.38, y: y + 0.38, w: 0.12, h: 0.12, fill: { color: ACCENT2 } });
            slide.addText(pt, { x: 9.58, y: y + 0.26, w: 3.28, h: 0.72, fontSize: 10, bold: true, color: DARK_TEXT, fontFace: 'Segoe UI', wrap: true });
        });
    }

    function addScreenshotWithFrame(slide, imgPath, x = 0.3, y = 1.05, w = 8.5, h = 6.0) {
        const exists = fs.existsSync(imgPath) && fs.statSync(imgPath).size > 1000;
        // Shadow/frame
        slide.addShape(prs.ShapeType.rect, { x: x + 0.03, y: y + 0.03, w, h, fill: { color: 'D1D5DB' } });
        slide.addShape(prs.ShapeType.rect, { x, y, w, h, fill: { color: exists ? BORDER : LIGHT_BG }, line: { color: BORDER, width: 1 } });
        if (exists) {
            slide.addImage({ path: imgPath, x, y, w, h, sizing: { type: 'contain', w, h } });
        } else {
            slide.addText('📷  Live screenshot unavailable', { x, y: y + h * 0.45, w, h: 0.5, fontSize: 12, color: LIGHT_TEXT, align: 'center', fontFace: 'Segoe UI' });
        }
    }

    // ════════════════════════════════════════════════════════════
    // SLIDE 1 – TITLE
    // ════════════════════════════════════════════════════════════
    {
        const s = prs.addSlide();
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: WHITE } });
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 2.9, fill: { color: ACCENT } });
        s.addShape(prs.ShapeType.ellipse, { x: 10.5, y: -0.8, w: 4, h: 4, fill: { color: ACCENT2 }, transparency: 75 });
        s.addShape(prs.ShapeType.ellipse, { x: 11.5, y: 0.2, w: 2.2, h: 2.2, fill: { color: WHITE }, transparency: 92 });

        s.addShape(prs.ShapeType.rect, { x: 0.8, y: 0.55, w: 1.1, h: 1.1, fill: { color: WHITE } });
        s.addText('TSL', { x: 0.8, y: 0.55, w: 1.1, h: 1.1, fontSize: 20, bold: true, color: ACCENT, align: 'center', valign: 'middle', fontFace: 'Segoe UI' });
        s.addText('TheSuperlabs ERP', { x: 2.2, y: 0.65, w: 9.5, h: 0.9, fontSize: 38, bold: true, color: WHITE, fontFace: 'Segoe UI', valign: 'middle' });
        s.addText('Integrated Garment Management System', { x: 2.2, y: 1.6, w: 9.5, h: 0.5, fontSize: 16, color: 'BFD4FF', fontFace: 'Segoe UI Light' });

        s.addShape(prs.ShapeType.roundRect, { x: 0.8, y: 3.2, w: 3, h: 0.5, fill: { color: ACCENT }, line: { color: ACCENT2, width: 1 } });
        s.addText(`📅  ${DATE_STR}`, { x: 0.8, y: 3.2, w: 3, h: 0.5, fontSize: 11, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Segoe UI' });
        s.addText('Corporate Presentation', { x: 0.8, y: 3.9, w: 11.5, h: 0.45, fontSize: 13, color: MID_TEXT, fontFace: 'Segoe UI' });
        s.addShape(prs.ShapeType.rect, { x: 0.8, y: 4.45, w: 4, h: 0.02, fill: { color: BORDER } });

        const mods = ['📦 Inventory', '📊 Reports', '💰 Accounts', '🤝 CRM', '👗 Garments', '🧾 Invoices'];
        mods.forEach((m, i) => {
            s.addShape(prs.ShapeType.roundRect, { x: 0.8 + i * 2.05, y: 4.7, w: 1.88, h: 0.65, fill: { color: LIGHT_BG }, line: { color: BORDER, width: 1 } });
            s.addText(m, { x: 0.8 + i * 2.05, y: 4.7, w: 1.88, h: 0.65, fontSize: 10, color: DARK_TEXT, align: 'center', valign: 'middle', fontFace: 'Segoe UI', bold: true });
        });
        s.addText('Confidential — For Internal Use Only', { x: 0, y: 7.1, w: '100%', h: 0.3, fontSize: 8, color: LIGHT_TEXT, align: 'center', fontFace: 'Segoe UI' });
    }

    // ════════════════════════════════════════════════════════════
    // HELPER: single screenshot slide  (screenshot left, cards right)
    // ════════════════════════════════════════════════════════════
    function addFullSlide(slideNum, labelTitle, breadcrumb, imgName, points) {
        const s = prs.addSlide();
        addSlideBase(s);
        addSlideHeader(s, slideNum, labelTitle, breadcrumb);
        addScreenshotWithFrame(s, path.join(SCREENSHOT_DIR, `${imgName}.png`));
        addInfoCards(s, points);
        return s;
    }

    let n = 2; // slide counter
    const fmt = (num) => String(num).padStart(2, '0');

    // ── Login ──────────────────────────────────────────────────
    addFullSlide(fmt(n++), 'Secure Login & Authentication', 'Module: Login', 'login',
        ['JWT-Secured Authentication', 'Multi-Year Accounting Support', 'Role-Based Access Control', 'TSL Corporate Branding']);

    // ── Dashboard ─────────────────────────────────────────────
    addFullSlide(fmt(n++), 'Command Center – Live Operations', 'Module: Dashboard', 'dashboard',
        ['Real-Time KPI Cards', 'Order & Production Tracking', 'Priority Delivery Alerts', 'Team Load & Capacity View']);

    // ── Contacts ──────────────────────────────────────────────
    addFullSlide(fmt(n++), 'Contacts & Directory', 'Module: Contacts', 'contacts',
        ['Customer Directory', 'Supplier Directory', 'Agent & Staff Contacts', 'Search & Quick Lookup']);

    // ── GARMENTS – TWO SLIDES ─────────────────────────────────
    {
        // Slide A – Top half
        addFullSlide(fmt(n++), 'Garments Production Hub (1/2) – Planning & Workflows', 'Module: Garments', 'garments_top',
            ['Order & Style Planning', 'Track TNA Progress', 'Order Unit Workflows', 'Lot & Internal Processing']);
        // Slide B – Scrolled / bottom
        addFullSlide(fmt(n++), 'Garments Production Hub (2/2) – Materials & Logistics', 'Module: Garments', 'garments_bottom',
            ['Yarn / Fabric / Trims Stock', 'Purchase Orders (PO)', 'Goods Receipt (GRN)', 'Production & Internal Lots']);
    }

    // ── Inventory ─────────────────────────────────────────────
    addFullSlide(fmt(n++), 'Inventory Management', 'Module: Inventory', 'inventory',
        ['Product Catalogue', 'SKU-Wise Stock Tracking', 'Price List Management', 'Barcode Generation']);

    // ── Accounts ──────────────────────────────────────────────
    addFullSlide(fmt(n++), 'Accounts & Finance', 'Module: Accounts', 'accounts',
        ['Invoice & Billing Hub', 'Purchase & Receipts', 'Credit / Debit Notes', 'Voucher & Ledger Management']);

    // ── CRM ───────────────────────────────────────────────────
    addFullSlide(fmt(n++), 'CRM – Growth Pipeline', 'Module: CRM', 'crm',
        ['Lead & Sales Funnel', 'Source Performance Tracking', 'Status-Driven Engagement', 'Client Communication Hub']);

    // ── Reports ───────────────────────────────────────────────
    addFullSlide(fmt(n++), 'Advanced Reporting & Business Intelligence', 'Module: Reports', 'reports',
        ['Profit & Loss (Style-Wise)', 'GSTR-1 Preparation', 'Balance Sheet & Trial Balance', 'Stock & Ageing Reports']);

    // ── Yarn to Fabric ──────────────────────────────────────────
    addFullSlide(fmt(n++), 'Yarn to Fabric Workflow', 'Garments: Production Workflows', 'yarn_to_fabric_list',
        ['Yarn Dyeing Tracking', 'Track Outward & Inward', 'Reference & Ref No Support', 'Real-time Stock Impact']);
    addFullSlide(fmt(n++), 'Yarn to Fabric Form Details', 'Garments: Jobwork Forms', 'yarn_to_fabric_form',
        ['Detailed Yardage Tracking', 'Process Selection & Party Mapping', 'Audit Log & Remarks Support', 'Multi-item Outward Flow']);

    // ── Fabric to Pcs ──────────────────────────────────────────
    addFullSlide(fmt(n++), 'Fabric to Pcs Outward Flow', 'Garments: Production Workflows', 'fabric_to_pcs_list',
        ['Fabric Delivery Tracking', 'Contractor-wise Management', 'Style & Color Integrity', 'Outward for Cutting/Printing']);
    addFullSlide(fmt(n++), 'Fabric to Pcs Form Details', 'Garments: Jobwork Forms', 'fabric_to_pcs_form',
        ['GSM & Dia Verification', 'SKU-level Accuracy', 'Auto-reduction of Fabric Stock', 'Contractor Assignment Flow']);

    // ── PCS Outward ──────────────────────────────────────────────
    addFullSlide(fmt(n++), 'PCS Outward Tracking', 'Garments: Production Workflows', 'pcs_list',
        ['Finished Piece Tracking', 'Jobwork Production Control', 'Stage-wise Audit Flow', 'Approval Lifecycle Status']);
    addFullSlide(fmt(n++), 'PCS Outward Form Details', 'Garments: Jobwork Forms', 'pcs_form',
        ['Production Qty Validation', 'Itemized Distribution', 'Real-time WIP Reports', 'Seamless Data Entry Experience']);

    // ── Masters ───────────────────────────────────────────────
    addFullSlide(fmt(n++), 'System Masters & Configuration', 'Module: Masters', 'masters',
        ['Company Profile Setup', 'User & Privilege Management', 'Accounting Year Configuration', 'All Reference Master Data']);

    // ── Invoice Add Form ──────────────────────────────────────
    addFullSlide(fmt(n++), 'Invoice Creation Form', 'Module: Accounts  →  New Invoice', 'invoice_add',
        ['Auto Product Search', 'Multi-Item Line Billing', 'GST & Tax Calculation', 'PDF Download Ready']);

    // ── Customer Add Form ─────────────────────────────────────
    addFullSlide(fmt(n++), 'Customer Registration Form', 'Module: Contacts  →  New Customer', 'customer_add',
        ['Full Contact Details', 'GST & PAN Fields', 'Address & Billing Info', 'Referral Code Support']);

    // ── Customer List ─────────────────────────────────────────
    addFullSlide(fmt(n++), 'Customer Master List', 'Module: Contacts  →  Customer List', 'customers_list',
        ['All Customer Records', 'Quick Edit & Delete', 'Bulk Import Support', 'Smart Search & Filter']);

    // ── Invoice List ──────────────────────────────────────────
    addFullSlide(fmt(n++), 'Invoice List & Ledger', 'Module: Accounts  →  Invoice List', 'invoices_list',
        ['All Invoice Records', 'Payment Status Filter', 'Search & Date Range', 'Export to Excel / PDF']);

    // ── Order Planning List ───────────────────────────────────
    addFullSlide(fmt(n++), 'Order Planning List', 'Module: Garments  →  Order Planning', 'order_planning_list',
        ['All Orders At a Glance', 'Status Tracking (Pending / Approved)', 'Filter by Buyer & Season', 'Quick Edit & Print Reports']);

    // ── ORDER PLANNING TABS (8 slides) ────────────────────────
    for (const tabInfo of ORDER_TABS) {
        addFullSlide(fmt(n++), tabInfo.label, `Module: Garments  →  Order Planning  →  ${tabInfo.tab}`, tabInfo.name, tabInfo.points);
    }

    // ── PRINT PREVIEWS ──────────────────────────────────────────
    addFullSlide(fmt(n++), 'Print Preview: Yarn to Fabric Outward', 'Garments: Print Layouts', 'yarn_to_fabric_print',
        ['Professional Print Layout', 'Company Branding Header', 'Order & Party Details', 'Billed To & Shipping Info']);
    addFullSlide(fmt(n++), 'Print Preview: Fabric to Pcs Outward', 'Garments: Print Layouts', 'fabric_to_pcs_print',
        ['Professional Print Layout', 'Contractor Assignment', 'GSM & Fabric Details', 'Yield Tracking Summary']);
    addFullSlide(fmt(n++), 'Print Preview: PCS Outward', 'Garments: Print Layouts', 'pcs_print',
        ['Professional Print Layout', 'Itemized Piece Tracking', 'Audit Process History', 'Signature & Authorization']);
    addFullSlide(fmt(n++), 'Print Preview: Sales Invoice', 'Accounts: Print Layouts', 'invoice_print',
        ['Tax Invoice Standard', 'GST-Compliant Formatting', 'Bank Details Integration', 'Terms & Conditions Footer']);
    addFullSlide(fmt(n++), 'Order Detailed Reconciliation Report (1/2)', 'Reports: Business Intelligence', 'order_detailed_print',
        ['End-to-End Order Lifecycle', 'Procurement & Grn Audit', 'Jobwork Yield Reconciliation', 'Financial KPI Summary']);
    addFullSlide(fmt(n++), 'Order Detailed Reconciliation Report (2/2)', 'Reports: Business Intelligence', 'order_detailed_report_2',
        ['Detailed Line-item Audit', 'Waste & Yield Analytics', 'Stage-wise Reconciliation', 'Deep-dive Account Analysis']);
    addFullSlide(fmt(n++), 'Order Detailed Reconciliation Report (Full Audit)', 'Reports: Business Intelligence', 'order_detailed_report_3',
        ['Production Progress History', 'Material Consumption Details', 'Final Cost Reconciliation', 'Stakeholder Sign-off Page']);

    // ════════════════════════════════════════════════════════════
    // FINAL SLIDE – Thank You
    // ════════════════════════════════════════════════════════════
    {
        const s = prs.addSlide();
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: WHITE } });
        s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 2.6, fill: { color: ACCENT } });
        s.addShape(prs.ShapeType.ellipse, { x: 9.5, y: -1.5, w: 5.5, h: 5.5, fill: { color: ACCENT2 }, transparency: 80 });

        s.addShape(prs.ShapeType.rect, { x: 0.8, y: 0.6, w: 1.1, h: 1.1, fill: { color: WHITE } });
        s.addText('TSL', { x: 0.8, y: 0.6, w: 1.1, h: 1.1, fontSize: 20, bold: true, color: ACCENT, align: 'center', valign: 'middle' });
        s.addText('TheSuperlabs ERP', { x: 2.2, y: 0.65, w: 9.5, h: 0.85, fontSize: 34, bold: true, color: WHITE, fontFace: 'Segoe UI' });
        s.addText('Powering the Future of Garments Industry', { x: 2.2, y: 1.55, w: 9.5, h: 0.5, fontSize: 15, color: 'BFD4FF', fontFace: 'Segoe UI Light' });

        s.addText('Thank You!', { x: 0, y: 3.1, w: '100%', h: 0.9, fontSize: 42, bold: true, color: ACCENT, align: 'center', fontFace: 'Segoe UI' });
        s.addShape(prs.ShapeType.rect, { x: 4.0, y: 4.1, w: 5.33, h: 0.02, fill: { color: BORDER } });
        s.addText('Rebranded. Optimized. Prepared for Success.', { x: 0, y: 4.25, w: '100%', h: 0.45, fontSize: 14, color: MID_TEXT, align: 'center', fontFace: 'Segoe UI' });
        s.addText('Contact us for a detailed walkthrough or configuration queries.', { x: 0, y: 4.8, w: '100%', h: 0.4, fontSize: 11, color: LIGHT_TEXT, align: 'center', fontFace: 'Segoe UI' });
        s.addText(`Presentation Date: ${DATE_STR}`, { x: 0, y: 5.4, w: '100%', h: 0.35, fontSize: 10, color: LIGHT_TEXT, align: 'center', fontFace: 'Segoe UI' });

        const mods = ['📦 Inventory', '🧾 Invoices', '📊 Reports', '🤝 CRM', '👗 Garments'];
        mods.forEach((b, i) => {
            s.addShape(prs.ShapeType.roundRect, { x: 0.9 + i * 2.35, y: 6.1, w: 2.2, h: 0.6, fill: { color: LIGHT_BG }, line: { color: BORDER, width: 1 } });
            s.addText(b, { x: 0.9 + i * 2.35, y: 6.1, w: 2.2, h: 0.6, fontSize: 10, color: DARK_TEXT, align: 'center', valign: 'middle', bold: true, fontFace: 'Segoe UI' });
        });
    }

    await prs.writeFile({ fileName: OUTPUT_PPT });
    const totalSlides = n + ORDER_TABS.length - 1; // rough count
    console.log(`\n✅ PPT saved: ${OUTPUT_PPT}`);
    console.log(`📅 Date: ${DATE_STR}`);
    console.log(`📑 Approx slides: Title + Login + Modules + ${ORDER_TABS.length} Order Planning tabs + Thank You`);
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
