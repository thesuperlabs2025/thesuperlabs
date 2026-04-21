$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Add()

function Add-Slide($title, $contentText, $imagePath) {
    # 2 is a common layout (Title and Content) or use 1 for Title Only
    $slide = $pres.Slides.Add($pres.Slides.Count + 1, 1) # 1 = ppLayoutText (varies by version)
    
    # Try using ppLayoutObjectAndText which is often more flexible
    # But let's stick to simple layout and adjust manually
    
    # Title
    $slide.Shapes.Title.TextFrame.TextRange.Text = $title
    
    # Image
    if (Test-Path $imagePath) {
        # Shapes.AddPicture(file, link, save, left, top, width, height)
        $img = $slide.Shapes.AddPicture($imagePath, 0, 1, 50, 150, 600, 350)
    }
    
    # Add a text box for details if needed
    $txt = $slide.Shapes.AddTextbox(1, 670, 150, 250, 350)
    $txt.TextFrame.TextRange.Text = $contentText
    $txt.TextFrame.TextRange.Font.Size = 18
}

# --- Slide 1 ---
$slide1 = $pres.Slides.Add(1, 1) # ppLayoutTitle
$slide1.Shapes.Title.TextFrame.TextRange.Text = "TSL ERP Demo: Premium Garment Management"
$slide1.Shapes.Item(2).TextFrame.TextRange.Text = "Integrated Solutions for Modern Manufacturing`nCorporate Presentation 2026"

# --- Slide 2: Login ---
Add-Slide "1. Secure Login & Session Access" "• TSL Corporate Branding Integration`n• Multi-Year Financial Accounting Support`n• Password-Protected Year Switching`n• JWT-Secured Authentication Layer" "C:\Users\HP\.gemini\antigravity\brain\68314b02-1d16-41ea-9a2c-a001b08c0fc9\tsl_login_demo_1775040555254.png"

# --- Slide 3: Dashboard ---
Add-Slide "2. Command Center (Live Operations)" "• Real-Time Order & Production Tracking`n• Live Capacity & Team Load Distribution`n• Priority Delivery Alarms & Critical Alerts`n• Dynamic KPI Visualization Cards" "C:\Users\HP\.gemini\antigravity\brain\68314b02-1d16-41ea-9a2c-a001b08c0fc9\tsl_dashboard_demo_1775040575799.png"

# --- Slide 4: Inventory ---
Add-Slide "3. Intelligent Inventory Lifecycle" "• SKU-Wise Tracking (Yarn to Finish)`n• Smart Low-Stock Warning System`n• Categorized Filtering & Warehouse Mapping`n• Automated Real-Time Stock Deductions" "C:\Users\HP\.gemini\antigravity\brain\68314b02-1d16-41ea-9a2c-a001b08c0fc9\tsl_inventory_demo_1775040599360.png"

# --- Slide 5: Invoices ---
Add-Slide "4. Order & Financial Processing" "• Consolidated Billing & Invoice Tracking`n• Payment Milestone Monitoring (Paid/Partial)`n• Instant PDF/Excel Export Functionality`n• Real-Time Ledger Synchronization" "C:\Users\HP\.gemini\antigravity\brain\68314b02-1d16-41ea-9a2c-a001b08c0fc9\tsl_invoices_demo_1775040619904.png"

# --- Slide 6: Reports ---
Add-Slide "5. Advanced Reporting & BI" "• Style-Wise Profit & Loss Analysis`n• Automated GST (GSTR-1) Preparations`n• Comprehensive Financial Statements`n• Raw Material Resource Audit Reports" "C:\Users\HP\.gemini\antigravity\brain\68314b02-1d16-41ea-9a2c-a001b08c0fc9\tsl_reports_demo_1775040642373.png"

# --- Slide 7: CRM ---
Add-Slide "6. CRM & Growth Pipeline" "• Integrated Lead & Sales Funnel`n• Source Performance & ROI Tracking`n• Status-Driven Customer Engagement`n• Centralized Client Communication Hub" "C:\Users\HP\.gemini\antigravity\brain\68314b02-1d16-41ea-9a2c-a001b08c0fc9\tsl_crm_demo_1775040669913.png"

# --- Slide 8: Final ---
$slide8 = $pres.Slides.Add($pres.Slides.Count + 1, 1)
$slide8.Shapes.Title.TextFrame.TextRange.Text = "TSL ERP: Powering the Future of Garments"
$slide8.Shapes.Item(2).TextFrame.TextRange.Text = "Contact us for a detailed walkthrough or configuration queries.`nRebranded. Optimized. Prepared for Success."

$pres.SaveAs("d:\React\garments-erp\TSL_ERP_Demo.pptx")
$pres.Close()
$ppt.Quit()

Write-Output "PPTX file saved to d:\React\garments-erp\TSL_ERP_Demo.pptx"
