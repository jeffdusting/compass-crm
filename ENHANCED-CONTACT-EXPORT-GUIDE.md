# Complete Contact Export Guide for Mac

## Exporting Contacts for Compass CRM Import

This comprehensive guide covers exporting contacts from **Outlook for Mac**, **Google Contacts**, and **Mac Contacts** in formats compatible with your Compass CRM CSV import feature.

---

## 📧 **Method 1: Microsoft Outlook for Mac**

### **Step 1: Open Outlook for Mac**
1. Launch **Microsoft Outlook** on your Mac
2. Ensure you're signed in to your account
3. Wait for all contacts to sync completely

### **Step 2: Access People/Contacts**
1. Click **"People"** in the bottom navigation bar
2. Or use keyboard shortcut: `Cmd + 3`
3. Or go to **View** → **People** in the menu bar

### **Step 3: Select Contacts to Export**
**For All Contacts:**
1. Press `Cmd + A` to select all contacts
2. You should see all contacts highlighted

**For Specific Contacts:**
1. Hold `Cmd` and click individual contacts
2. Selected contacts will be highlighted in blue

**For a Contact Group:**
1. Click on a specific group/folder in the left sidebar
2. Then select contacts within that group

### **Step 4: Export Process**
1. With contacts selected, go to **File** → **Export** in the menu bar
2. Choose **"Export to Archive File (.olm)"** or **"Export Contacts"**
3. If only "Export to Archive" is available:
   - Choose this option
   - Select **"Contacts"** in the export dialog
   - Choose location and click **Export**

### **Step 5: Convert to CSV (if needed)**
If Outlook exported an .olm file:
1. **Option A - Use Outlook Web:**
   - Go to https://outlook.com in your browser
   - Sign in with the same account
   - Go to People → Manage → Export contacts
   - Choose **"All contacts"** and **CSV format**

2. **Option B - Third-party converter:**
   - Use online tools like "OLM to CSV Converter"
   - Upload your .olm file and download CSV

### **Alternative: Direct CSV Export**
Some Outlook for Mac versions support direct CSV export:
1. Select contacts as above
2. Go to **File** → **Export**
3. If available, choose **"Comma Separated Values (.csv)"**
4. Choose save location and click **Export**

---

## 🌐 **Method 2: Google Contacts**

### **Step 1: Access Google Contacts**
1. Open your web browser (Safari, Chrome, etc.)
2. Go to https://contacts.google.com
3. Sign in with your Google account
4. Wait for all contacts to load

### **Step 2: Select Contacts to Export**
**For All Contacts:**
1. Don't select any contacts (exports all by default)
2. Or click the checkbox at the top to select all visible contacts

**For Specific Contacts:**
1. Check the boxes next to individual contacts
2. Use `Cmd + Click` to select multiple contacts
3. Selected count will show at the top

**For a Specific Label/Group:**
1. Click on a label in the left sidebar (e.g., "Family", "Work")
2. This will filter to show only contacts with that label
3. Then select contacts or leave unselected for all in that label

### **Step 3: Export Contacts**
1. Click the **"Export"** button (download icon) in the toolbar
2. Or click **"More actions"** (three dots) → **"Export"**

### **Step 4: Choose Export Format**
1. **Export as:** Select **"Google CSV"** (recommended)
   - This preserves all Google-specific fields
   - Better for comprehensive data export
2. **Alternative:** Select **"Outlook CSV"** 
   - More compatible with other systems
   - May lose some Google-specific data
3. **Contacts to export:** Choose your selection:
   - **"Selected contacts"** (if you selected specific ones)
   - **"All contacts"** (for everything)
   - **"[Label name]"** (if you filtered by label)

### **Step 5: Download**
1. Click **"Export"**
2. The file will download automatically as "contacts.csv"
3. Save to your Desktop or preferred location

---

## 🍎 **Method 3: Mac Contacts App**

### **Step 1: Open Mac Contacts**
1. Open **Contacts** app (in Applications folder)
2. Or press `Cmd + Space` and type "Contacts"
3. Ensure all your contacts have synced from iCloud/other accounts

### **Step 2: Select Contacts to Export**
**For All Contacts:**
1. Go to **Edit** → **Select All** (or `Cmd + A`)
2. All contacts will be highlighted

**For Specific Contacts:**
1. Hold `Cmd` and click individual contacts
2. Or click first contact, hold `Shift`, click last contact for range

**For a Specific Group:**
1. Click on a group in the left sidebar
2. Then select contacts within that group
3. Or select the group itself to export all contacts in it

### **Step 3: Export Contacts**
1. With contacts selected, go to **File** → **Export** → **Export vCard...**
2. Choose save location (Desktop recommended)
3. Name your file (e.g., "mac-contacts-export")
4. Click **Save**

### **Step 4: Convert vCard to CSV**
Mac Contacts exports as vCard (.vcf) format, which needs conversion:

**Option A - Use Online Converter (Recommended):**
1. Go to https://www.csvjson.com/vcard-to-csv
2. Click **"Choose File"** and select your .vcf file
3. Click **"Convert"**
4. Download the resulting CSV file

**Option B - Use Numbers (Mac's Spreadsheet App):**
1. Try opening the .vcf file directly in Numbers
2. If it opens, go to **File** → **Export To** → **CSV**
3. Choose UTF-8 encoding and comma delimiter

**Option C - Re-export via iCloud:**
1. Go to https://www.icloud.com/contacts
2. Sign in with your Apple ID
3. Select contacts and export as described in Google method above

---

## 🔧 **Converting and Preparing Your CSV File**

### **Required Column Headers for Compass CRM**
Your final CSV must have these columns (case-insensitive):

| Required | Column Names (any variation works) |
|----------|-----------------------------------|
| ✅ Required | `first_name`, `firstname`, `fname`, `given_name`, `first` |
| ✅ Required | `last_name`, `lastname`, `lname`, `surname`, `family_name`, `last` |
| ✅ Required | `email`, `email_address`, `e_mail`, `mail` |
| ⚪ Optional | `phone`, `phone_number`, `telephone`, `mobile`, `cell` |
| ⚪ Optional | `company`, `organization`, `org`, `business`, `employer` |
| ⚪ Optional | `title`, `job_title`, `position`, `role`, `job` |
| ⚪ Optional | `tags`, `categories`, `labels`, `groups` |

### **Using Numbers (Mac) to Clean Your CSV**
1. **Open CSV in Numbers:**
   - Right-click your CSV file
   - Choose **"Open With"** → **"Numbers"**

2. **Clean and Organize:**
   - **Rename columns** to match required headers above
   - **Delete unnecessary columns** to keep file clean
   - **Merge name fields** if needed (combine first/last names)
   - **Add tags column** if missing

3. **Add Tags (Optional):**
   - Create a new column called "tags"
   - Add relevant tags like "CBS", "Water Roads", "Personal"
   - Separate multiple tags with commas: "CBS,client,prospect"

4. **Save as CSV:**
   - Go to **File** → **Export To** → **CSV**
   - Choose **UTF-8** encoding
   - Select **Comma** as delimiter
   - Click **Next** and **Export**

### **Using Excel to Clean Your CSV**
1. **Open in Excel:**
   - Double-click your CSV file (should open in Excel)

2. **Clean Data:**
   - Rename column headers to match requirements
   - Remove empty rows and unnecessary columns
   - Format phone numbers consistently
   - Add company tags if needed

3. **Save as CSV:**
   - Go to **File** → **Save As**
   - Choose **CSV UTF-8 (Comma delimited)** format
   - Click **Save**

---

## 📋 **Sample CSV Format**

Here's what your final CSV should look like:

```csv
first_name,last_name,email,phone,company,title,tags
John,Smith,john.smith@cbs.com.au,+61 2 1234 5678,CBS Group,Manager,"CBS,client"
Jane,Doe,jane.doe@waterroads.com.au,+61 3 8765 4321,Water Roads,Director,"Water Roads,prospect"
Bob,Johnson,bob@gmail.com,0412 345 678,ABC Corp,Engineer,"prospect,personal"
Sarah,Wilson,sarah.wilson@company.com,04 1234 5678,XYZ Ltd,CEO,"client,CBS,high-value"
```

---

## ⚠️ **Important Data Formatting Tips**

### **Phone Numbers**
- ✅ Any format works: `+61 2 1234 5678`, `(02) 1234 5678`, `0412 345 678`
- ✅ International format preferred: `+61` for Australia
- ❌ Avoid letters or special characters except `+`, `()`, `-`, spaces

### **Email Addresses**
- ✅ Must be valid format: `name@domain.com`
- ✅ One email per contact (primary email)
- ❌ Multiple emails in one field not supported

### **Tags**
- ✅ Separate multiple tags with commas: `"CBS,client,prospect"`
- ✅ Use quotes around tag field if it contains commas
- ✅ Common tags: CBS, Water Roads, Personal, Client, Prospect, Partner

### **Company Names**
- ✅ Use quotes if company name contains commas: `"Smith, Jones & Associates"`
- ✅ Consistent naming: "CBS Group" not "CBS" and "CBS Group"

### **Names**
- ✅ First and last name in separate columns preferred
- ✅ Handle special characters properly: O'Connor, Smith-Jones
- ❌ Avoid line breaks within name fields

---

## 🧪 **Testing Your CSV Before Full Import**

### **Create a Test File**
1. **Copy first 5-10 contacts** from your main CSV
2. **Save as separate file**: `test-contacts.csv`
3. **Import test file first** to verify format works
4. **Check results** in Compass CRM before importing full list

### **Sample Test CSV**
```csv
first_name,last_name,email,phone,company,title,tags
Test,User,test@example.com,0400 000 000,Test Company,Tester,prospect
John,Sample,john@test.com,+61 2 0000 0000,Sample Corp,Manager,"CBS,client"
```

---

## 🚀 **Ready to Import**

Once your CSV is prepared:

1. **Go to Compass CRM**: https://compasscrm.cbslab.app
2. **Navigate to Contacts** section
3. **Click green "Import CSV"** button
4. **Upload your prepared CSV file**
5. **Review the preview** and handle any duplicates
6. **Complete the import process**

The system will:
- ✅ Validate all email formats
- ✅ Check for duplicates with smart matching
- ✅ Allow you to merge, skip, or add duplicate contacts
- ✅ Preserve and merge tags from your CSV
- ✅ Provide detailed import results and error reporting

---

## 📞 **Troubleshooting Common Issues**

### **"Invalid Email Format" Errors**
- Check for typos in email addresses
- Ensure proper format: name@domain.com
- Remove any extra spaces or characters

### **"Missing Required Fields" Errors**
- Ensure first_name, last_name, and email columns exist
- Check for empty rows in your CSV
- Verify column headers match requirements

### **Import Fails or Hangs**
- Try smaller batches (100-200 contacts at a time)
- Check file size (keep under 5MB)
- Ensure CSV is properly formatted with UTF-8 encoding

### **Duplicate Detection Issues**
- Review similar contacts carefully
- Use merge option to combine information
- Skip obvious duplicates to avoid clutter

Your contacts are now ready for seamless import into Compass CRM!

