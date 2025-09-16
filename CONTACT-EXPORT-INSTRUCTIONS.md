# Contact Export Instructions for Mac

## Exporting Contacts from Outlook and Google for Compass CRM

This guide will help you export your contacts from Outlook and Google Contacts on Mac in a format that's compatible with your Compass CRM CSV import feature.

## 📧 **Exporting from Microsoft Outlook (Mac)**

### Method 1: Outlook for Mac Application

#### Step 1: Open Outlook for Mac
1. Launch Microsoft Outlook on your Mac
2. Make sure you're signed in to your account

#### Step 2: Access Contacts
1. Click on **"People"** or **"Contacts"** in the bottom navigation bar
2. Or press `Cmd + 3` to switch to People view

#### Step 3: Select Contacts to Export
1. **For All Contacts**: Press `Cmd + A` to select all
2. **For Specific Contacts**: Hold `Cmd` and click individual contacts
3. **For a Range**: Click first contact, hold `Shift`, click last contact

#### Step 4: Export Contacts
1. Go to **File** → **Export** in the menu bar
2. Choose **"Contacts to vCard file"** or **"Export Contacts"**
3. If vCard option: Save the .vcf file, then convert using Method 2 below
4. If direct export: Choose **CSV** format and save

#### Step 5: Choose Export Location
1. Select a location on your Mac (Desktop recommended)
2. Name the file (e.g., "outlook-contacts.csv")
3. Click **Save**

### Method 2: Outlook Web (outlook.com)

#### Step 1: Access Outlook Web
1. Open Safari/Chrome and go to https://outlook.com
2. Sign in with your Microsoft account

#### Step 2: Navigate to People
1. Click the **"People"** icon (person silhouette) in the left sidebar
2. Or go directly to https://outlook.live.com/people/

#### Step 3: Export Contacts
1. Click **"Manage"** in the top toolbar
2. Select **"Export contacts"**
3. Choose **"All contacts"** or **"Selected contacts"**
4. Click **"Export"**

#### Step 4: Download CSV File
1. Outlook will prepare your export
2. Click **"Download"** when ready
3. The file will download as "contacts.csv"

## 🌐 **Exporting from Google Contacts**

### Step 1: Access Google Contacts
1. Open Safari/Chrome and go to https://contacts.google.com
2. Sign in with your Google account

### Step 2: Select Contacts to Export
1. **For All Contacts**: Don't select any (exports all by default)
2. **For Specific Contacts**: Check the boxes next to contacts you want
3. **For a Label/Group**: Click on the label in the left sidebar first

### Step 3: Export Contacts
1. Click the **"Export"** button (download icon) in the toolbar
2. Or go to **"More actions"** (three dots) → **"Export"**

### Step 4: Choose Export Format
1. Select **"Google CSV"** (recommended) or **"Outlook CSV"**
2. **Google CSV** works better for preserving all fields
3. Click **"Export"**

### Step 5: Download File
1. The file will download automatically as "contacts.csv"
2. Save it to your Desktop or preferred location

## 🔧 **Converting and Preparing CSV Files**

### If You Have vCard (.vcf) Files

#### Using Contacts App (Mac)
1. Open **Contacts** app on Mac
2. Go to **File** → **Import**
3. Select your .vcf file
4. After import, go to **File** → **Export** → **Export vCard**
5. Then use online converter: https://www.csvjson.com/vcard-to-csv

#### Using Online Converter
1. Go to https://products.aspose.app/email/conversion/vcf-to-csv
2. Upload your .vcf file
3. Click **"Convert"**
4. Download the resulting CSV file

### Cleaning Up Your CSV File

#### Required Columns for Compass CRM
Your CSV should have these column headers (case-insensitive):
- `first_name` (or firstname, fname, given_name)
- `last_name` (or lastname, lname, surname)
- `email` (or email_address, e_mail)
- `phone` (or phone_number, telephone, mobile)
- `company` (or organization, org, business)
- `title` (or job_title, position, role)
- `tags` (or categories, labels, groups)

#### Using Numbers (Mac) to Edit CSV
1. Open the CSV file in **Numbers** (Mac's spreadsheet app)
2. **Rename columns** to match the required headers above
3. **Remove unnecessary columns** to keep file clean
4. **Add a tags column** if it doesn't exist
5. **Save as CSV**: File → Export To → CSV

#### Using Excel to Edit CSV
1. Open CSV in Microsoft Excel
2. Rename column headers to match requirements
3. Clean up data as needed
4. **Save as CSV**: File → Save As → CSV UTF-8 (Comma delimited)

## 📋 **Sample CSV Format**

Here's what your final CSV should look like:

```csv
first_name,last_name,email,phone,company,title,tags
John,Smith,john.smith@example.com,+61 2 1234 5678,ABC Corp,Manager,prospect
Jane,Doe,jane.doe@company.com,+61 3 8765 4321,XYZ Ltd,Director,"client,CBS"
Bob,Johnson,bob@email.com,0412 345 678,Water Roads,Engineer,"Water Roads,active"
```

## ⚠️ **Important Notes**

### Data Formatting Tips
- **Phone Numbers**: Any format works (+61, 04xx, etc.)
- **Tags**: Separate multiple tags with semicolons or commas
- **Quotes**: Use quotes around fields containing commas
- **Empty Fields**: Leave blank, don't use "N/A" or "NULL"

### Common Issues to Avoid
- ❌ **Special Characters**: Avoid unusual characters in names
- ❌ **Line Breaks**: Remove line breaks within fields
- ❌ **Extra Commas**: Don't use commas in company names without quotes
- ❌ **Invalid Emails**: Ensure all emails have proper format

### File Size Limits
- **Recommended**: Under 1000 contacts per import
- **Maximum**: 5000 contacts (may be slow)
- **Large Lists**: Split into multiple CSV files if needed

## 🎯 **Testing Your CSV**

### Before Full Import
1. **Test with 5-10 contacts first**
2. Create a small sample CSV with a few contacts
3. Import to Compass CRM to verify format works
4. Check that all fields map correctly
5. Verify tags are applied properly

### Sample Test CSV
Create a file called `test-contacts.csv`:
```csv
first_name,last_name,email,phone,company,title,tags
Test,User,test@example.com,0400 000 000,Test Company,Tester,prospect
```

## 🚀 **Ready to Import**

Once you have your CSV file prepared:
1. Go to your Compass CRM: https://compasscrm.cbslab.app
2. Navigate to **Contacts** section
3. Click the green **"Import CSV"** button
4. Upload your prepared CSV file
5. Review the preview and handle any duplicates
6. Complete the import process

## 📞 **Need Help?**

If you encounter issues:
- **CSV Format Problems**: Check column headers match requirements
- **Import Errors**: Review the error messages for specific issues
- **Duplicate Handling**: Use the merge/skip options as needed
- **Large Files**: Consider splitting into smaller batches

The system will guide you through any duplicate resolution and provide detailed feedback on the import process!

