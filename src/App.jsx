import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Activity, 
  BarChart3, 
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  X,
  Save,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Building,
  Upload,
  FileText,
  AlertTriangle,
  Check,
  Merge,
  UserX
} from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

// Email validation utility
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// FINAL FIXED similarity calculation
const calculateSimilarity = (contact1, contact2) => {
  let score = 0;
  let maxScore = 0;

  // Email match (40 points)
  if (contact1.email || contact2.email) {
    maxScore += 40;
    if (contact1.email && contact2.email && 
        contact1.email.toLowerCase().trim() === contact2.email.toLowerCase().trim()) {
      score += 40;
    }
  }

  // Name match (30 points)
  if ((contact1.first_name && contact1.last_name) || (contact2.first_name && contact2.last_name)) {
    maxScore += 30;
    if (contact1.first_name && contact1.last_name && contact2.first_name && contact2.last_name) {
      const name1 = `${contact1.first_name} ${contact1.last_name}`.toLowerCase().trim();
      const name2 = `${contact2.first_name} ${contact2.last_name}`.toLowerCase().trim();
      if (name1 === name2) {
        score += 30;
      } else {
        if (contact1.first_name.toLowerCase().trim() === contact2.first_name.toLowerCase().trim()) {
          score += 15;
        }
        if (contact1.last_name.toLowerCase().trim() === contact2.last_name.toLowerCase().trim()) {
          score += 15;
        }
      }
    }
  }

  // Phone match (20 points)
  if (contact1.phone || contact2.phone) {
    maxScore += 20;
    if (contact1.phone && contact2.phone) {
      const phone1 = contact1.phone.replace(/\D/g, '');
      const phone2 = contact2.phone.replace(/\D/g, '');
      if (phone1 && phone2 && phone1 === phone2) {
        score += 20;
      }
    }
  }

  // Company match (10 points)
  if (contact1.company || contact2.company) {
    maxScore += 10;
    if (contact1.company && contact2.company && 
        contact1.company.toLowerCase().trim() === contact2.company.toLowerCase().trim()) {
      score += 10;
    }
  }

  return maxScore > 0 ? (score / maxScore) * 100 : 0;
};

// Enhanced duplicate detection with configurable threshold
const findDuplicates = (newContact, existingContacts, threshold = 70) => {
  return existingContacts
    .map(existing => {
      const similarity = calculateSimilarity(newContact, existing);
      const reasons = [];
      
      // Determine match reasons
      if (newContact.email && existing.email && 
          newContact.email.toLowerCase().trim() === existing.email.toLowerCase().trim()) {
        reasons.push('Same email');
      }
      
      if (newContact.first_name && newContact.last_name && existing.first_name && existing.last_name) {
        const name1 = `${newContact.first_name} ${newContact.last_name}`.toLowerCase().trim();
        const name2 = `${existing.first_name} ${existing.last_name}`.toLowerCase().trim();
        if (name1 === name2) {
          reasons.push('Same name');
        } else if (newContact.first_name.toLowerCase().trim() === existing.first_name.toLowerCase().trim() ||
                   newContact.last_name.toLowerCase().trim() === existing.last_name.toLowerCase().trim()) {
          reasons.push('Similar name');
        }
      }
      
      if (newContact.phone && existing.phone) {
        const phone1 = newContact.phone.replace(/\D/g, '');
        const phone2 = existing.phone.replace(/\D/g, '');
        if (phone1 && phone2 && phone1 === phone2) {
          reasons.push('Same phone');
        }
      }
      
      return {
        contact: existing,
        similarity,
        reasons
      };
    })
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
};

// FIXED: Robust CSV parsing that handles quoted fields properly
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Parse header row
  const headers = parseCSVRow(lines[0]);
  if (!headers || headers.length === 0) {
    throw new Error('CSV file must contain valid headers');
  }

  const contacts = [];
  const errors = [];

  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    try {
      const values = parseCSVRow(line);
      if (!values || values.length === 0) continue;

      const contact = {};
      let hasRequiredFields = false;

      // Map headers to contact fields
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Enhanced field mapping
        const fieldMapping = {
          'first_name': ['first_name', 'firstname', 'fname', 'given_name', 'first'],
          'last_name': ['last_name', 'lastname', 'lname', 'surname', 'family_name', 'last'],
          'email': ['email', 'email_address', 'e_mail', 'mail'],
          'phone': ['phone', 'phone_number', 'telephone', 'mobile', 'cell'],
          'company': ['company', 'organization', 'org', 'business', 'employer'],
          'title': ['title', 'job_title', 'position', 'role', 'job'],
          'tags': ['tags', 'categories', 'labels', 'groups']
        };

        let mappedField = normalizedHeader;
        for (const [field, variations] of Object.entries(fieldMapping)) {
          if (variations.includes(normalizedHeader)) {
            mappedField = field;
            break;
          }
        }

        const value = values[index] ? values[index].trim() : '';
        contact[mappedField] = value;
      });

      // Validate required fields
      if (!contact.first_name || !contact.last_name) {
        errors.push(`Row ${i + 1}: Missing required fields (first_name, last_name)`);
        continue;
      }

      if (!contact.email) {
        errors.push(`Row ${i + 1}: Missing required email field`);
        continue;
      }

      // Validate email format
      if (!isValidEmail(contact.email)) {
        errors.push(`Row ${i + 1}: Invalid email format: ${contact.email}`);
        continue;
      }

      // FIXED: Parse tags from CSV and merge with auto-generated tags
      let csvTags = [];
      if (contact.tags) {
        csvTags = contact.tags.split(/[;,]/).map(tag => tag.trim()).filter(tag => tag);
      }

      // Auto-generate company-based tags
      const autoTags = [];
      if (contact.company) {
        const companyLower = contact.company.toLowerCase();
        if (companyLower.includes('cbs') || companyLower.includes('group')) {
          autoTags.push('CBS');
        }
        if (companyLower.includes('water') || companyLower.includes('roads')) {
          autoTags.push('Water Roads');
        }
      }

      // Merge CSV tags with auto-generated tags (no duplicates)
      contact.tags = [...new Set([...csvTags, ...autoTags])];

      contacts.push(contact);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  return { contacts, errors };
};

// Helper function to parse a single CSV row with proper quote handling
const parseCSVRow = (row) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current);
  return result;
};

// Duplicate Resolution Component (unchanged but improved error handling)
const DuplicateResolution = ({ newContact, duplicates, onResolve, onCancel }) => {
  const [selectedAction, setSelectedAction] = useState('skip');
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [mergedContact, setMergedContact] = useState(newContact);

  useEffect(() => {
    if (selectedAction === 'merge' && selectedDuplicate) {
      // Create merged contact with preference for non-empty values
      const merged = { ...selectedDuplicate.contact };
      Object.keys(newContact).forEach(key => {
        if (newContact[key] && newContact[key].toString().trim()) {
          merged[key] = newContact[key];
        }
      });
      // Merge tags without duplicates
      const existingTags = selectedDuplicate.contact.tags || [];
      const newTags = newContact.tags || [];
      merged.tags = [...new Set([...existingTags, ...newTags])];
      setMergedContact(merged);
    }
  }, [selectedAction, selectedDuplicate, newContact]);

  const handleResolve = () => {
    if (selectedAction === 'skip') {
      onResolve({ action: 'skip' });
    } else if (selectedAction === 'add') {
      onResolve({ action: 'add', newContact });
    } else if (selectedAction === 'merge' && selectedDuplicate) {
      onResolve({ 
        action: 'merge', 
        newContact,
        duplicateContact: selectedDuplicate.contact,
        mergedContact 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Duplicate Contact Detected</h3>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">New Contact:</h4>
        <p className="text-sm text-gray-700">
          {newContact.first_name} {newContact.last_name} - {newContact.email}
        </p>
        {newContact.phone && (
          <p className="text-sm text-gray-600">Phone: {newContact.phone}</p>
        )}
        {newContact.company && (
          <p className="text-sm text-gray-600">Company: {newContact.company}</p>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Found {duplicates.length} potential duplicate(s):</h4>
        {duplicates.map((duplicate, index) => (
          <div key={index} className="border border-gray-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {duplicate.contact.first_name} {duplicate.contact.last_name}
                </p>
                <p className="text-sm text-gray-600">{duplicate.contact.email}</p>
                {duplicate.contact.phone && (
                  <p className="text-sm text-gray-600">Phone: {duplicate.contact.phone}</p>
                )}
                <p className="text-sm text-gray-500">
                  Similarity: {Math.round(duplicate.similarity)}% - {duplicate.reasons.join(', ')}
                </p>
              </div>
              {selectedAction === 'merge' && (
                <input
                  type="radio"
                  name="duplicateChoice"
                  checked={selectedDuplicate === duplicate}
                  onChange={() => setSelectedDuplicate(duplicate)}
                  className="h-4 w-4 text-blue-600"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Choose an action:</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="action"
            value="skip"
            checked={selectedAction === 'skip'}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-4 w-4 text-blue-600"
          />
          <UserX className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">Skip this contact</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="action"
            value="add"
            checked={selectedAction === 'add'}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-4 w-4 text-blue-600"
          />
          <Plus className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">Add as new contact anyway</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="action"
            value="merge"
            checked={selectedAction === 'merge'}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-4 w-4 text-blue-600"
          />
          <Merge className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">Merge with existing contact</span>
        </label>
      </div>

      {selectedAction === 'merge' && selectedDuplicate && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Preview of merged contact:</h5>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Name:</strong> {mergedContact.first_name} {mergedContact.last_name}</p>
            <p><strong>Email:</strong> {mergedContact.email}</p>
            <p><strong>Phone:</strong> {mergedContact.phone}</p>
            <p><strong>Company:</strong> {mergedContact.company}</p>
            <p><strong>Title:</strong> {mergedContact.title}</p>
            {mergedContact.tags && mergedContact.tags.length > 0 && (
              <p><strong>Tags:</strong> {mergedContact.tags.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel Import
        </button>
        <button
          onClick={handleResolve}
          disabled={selectedAction === 'merge' && !selectedDuplicate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {selectedAction === 'skip' ? 'Skip Contact' : 
           selectedAction === 'add' ? 'Add Contact' : 'Merge Contact'}
        </button>
      </div>
    </div>
  );
};

// Enhanced CSV Upload Component with better error handling
const CSVUpload = ({ onImportComplete, onCancel }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [currentDuplicate, setCurrentDuplicate] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [existingContacts, setExistingContacts] = useState([]);

  useEffect(() => {
    // Fetch existing contacts for duplicate detection
    const fetchContacts = async () => {
      const contacts = await apiCall('/api/contacts');
      setExistingContacts(contacts);
    };
    fetchContacts();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const result = parseCSV(csvText);
          setCsvData(result.contacts);
          setParseErrors(result.errors);
        } catch (error) {
          setParseErrors([error.message]);
          setCsvData([]);
        }
      };
      reader.readAsText(file);
    } else {
      setParseErrors(['Please select a valid CSV file']);
    }
  };

  const processImport = async () => {
    if (csvData.length === 0) return;

    setImporting(true);
    const results = {
      total: csvData.length,
      added: 0,
      merged: 0,
      skipped: 0,
      errors: [...parseErrors] // Include parsing errors
    };

    for (let i = 0; i < csvData.length; i++) {
      const contact = csvData[i];
      
      try {
        // Check for duplicates
        const duplicates = findDuplicates(contact, existingContacts);
        
        if (duplicates.length > 0) {
          // Show duplicate resolution dialog
          await new Promise((resolve) => {
            setCurrentDuplicate({
              contact,
              duplicates,
              resolve: (resolution) => {
                handleDuplicateResolution(resolution, results);
                setCurrentDuplicate(null);
                resolve();
              }
            });
          });
        } else {
          // No duplicates, add directly
          const newContact = await apiCall('/api/contacts', {
            method: 'POST',
            body: JSON.stringify(contact)
          });
          existingContacts.push(newContact);
          results.added++;
        }
      } catch (error) {
        results.errors.push(`Error processing ${contact.first_name} ${contact.last_name}: ${error.message}`);
      }
    }

    setImportResults(results);
    setImporting(false);
  };

  const handleDuplicateResolution = async (resolution, results) => {
    try {
      if (resolution.action === 'add') {
        const newContact = await apiCall('/api/contacts', {
          method: 'POST',
          body: JSON.stringify(resolution.newContact)
        });
        existingContacts.push(newContact);
        results.added++;
      } else if (resolution.action === 'merge') {
        await apiCall(`/api/contacts/${resolution.duplicateContact.id}`, {
          method: 'PUT',
          body: JSON.stringify(resolution.mergedContact)
        });
        // Update existing contacts array
        const index = existingContacts.findIndex(c => c.id === resolution.duplicateContact.id);
        if (index !== -1) {
          existingContacts[index] = resolution.mergedContact;
        }
        results.merged++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      results.errors.push(`Error processing ${resolution.newContact.first_name} ${resolution.newContact.last_name}: ${error.message}`);
    }
  };

  if (importResults) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Import Complete</h3>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Total Contacts: {importResults.total}</div>
            <div className="text-green-600">Added: {importResults.added}</div>
            <div className="text-blue-600">Merged: {importResults.merged}</div>
            <div className="text-gray-600">Skipped: {importResults.skipped}</div>
          </div>
          
          {importResults.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-700 mb-2">Errors and Warnings:</h4>
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-sm text-red-600 space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onImportComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (currentDuplicate) {
    return (
      <DuplicateResolution
        newContact={currentDuplicate.contact}
        duplicates={currentDuplicate.duplicates}
        onResolve={currentDuplicate.resolve}
        onCancel={() => {
          setCurrentDuplicate(null);
          setImporting(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Import Contacts from CSV</h3>
        <p className="text-sm text-gray-500 mt-2">
          Upload a CSV file with columns: first_name, last_name, email, phone, company, title, tags
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {csvFile && parseErrors.length === 0 && csvData.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">
              File loaded: {csvFile.name} ({csvData.length} valid contacts found)
            </span>
          </div>
        </div>
      )}

      {parseErrors.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm font-medium text-red-700">
              Parsing Errors ({parseErrors.length})
            </span>
          </div>
          <div className="max-h-32 overflow-y-auto">
            <ul className="text-sm text-red-600 space-y-1">
              {parseErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
          {csvData.length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              {csvData.length} valid contacts can still be imported.
            </p>
          )}
        </div>
      )}

      {csvData.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Preview (first 3 contacts):</h4>
            <div className="space-y-2">
              {csvData.slice(0, 3).map((contact, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {contact.first_name} {contact.last_name} - {contact.email}
                  {contact.tags && contact.tags.length > 0 && (
                    <span className="text-gray-500"> (Tags: {contact.tags.join(', ')})</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={processImport}
              disabled={importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {importing ? 'Importing...' : `Import ${csvData.length} Contacts`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Component (unchanged)
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Enhanced Contact Form Component with duplicate detection
const ContactForm = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    tags: [],
    ...contact
  });

  const [tagInput, setTagInput] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [existingContacts, setExistingContacts] = useState([]);

  useEffect(() => {
    // Fetch existing contacts for duplicate detection
    const fetchContacts = async () => {
      const contacts = await apiCall('/api/contacts');
      setExistingContacts(contacts);
    };
    fetchContacts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email format
    if (!isValidEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check for duplicates only for new contacts
    if (!contact) {
      const duplicates = findDuplicates(formData, existingContacts);
      
      if (duplicates.length > 0) {
        setDuplicateCheck({
          newContact: formData,
          duplicates,
          onResolve: (resolution) => {
            if (resolution.action === 'add') {
              onSave(formData);
            } else if (resolution.action === 'merge') {
              onSave(resolution.mergedContact, resolution.duplicateContact.id);
            }
            setDuplicateCheck(null);
          },
          onCancel: () => setDuplicateCheck(null)
        });
        return;
      }
    }
    
    onSave(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (duplicateCheck) {
    return (
      <DuplicateResolution
        newContact={duplicateCheck.newContact}
        duplicates={duplicateCheck.duplicates}
        onResolve={duplicateCheck.onResolve}
        onCancel={duplicateCheck.onCancel}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          Save Contact
        </button>
      </div>
    </form>
  );
};

// Dashboard Component (unchanged)
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalOpportunities: 0,
    totalActivities: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contacts, opportunities, activities] = await Promise.all([
          apiCall('/api/contacts'),
          apiCall('/api/opportunities'),
          apiCall('/api/activities')
        ]);

        setStats({
          totalContacts: contacts.length,
          totalOpportunities: opportunities.length,
          totalActivities: activities.length,
          recentActivities: activities.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          {stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'call' && <Phone className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'email' && <Mail className="h-5 w-5 text-green-500" />}
                    {activity.type === 'meeting' && <Calendar className="h-5 w-5 text-purple-500" />}
                    {activity.type === 'task' && <Activity className="h-5 w-5 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Contacts Component with CSV Upload
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const fetchContacts = async () => {
    try {
      let endpoint = '/api/contacts';
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (filterCompany) {
        params.append('company', filterCompany);
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const data = await apiCall(endpoint);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, filterCompany]);

  const handleSaveContact = async (contactData, contactId = null) => {
    try {
      if (contactId || editingContact) {
        await apiCall(`/api/contacts/${contactId || editingContact.id}`, {
          method: 'PUT',
          body: JSON.stringify(contactData),
        });
      } else {
        await apiCall('/api/contacts', {
          method: 'POST',
          body: JSON.stringify(contactData),
        });
      }
      
      setShowAddModal(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await apiCall(`/api/contacts/${contactId}`, {
          method: 'DELETE',
        });
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleCSVImportComplete = () => {
    setShowCSVModal(false);
    fetchContacts();
  };

  const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      `${contact.first_name} ${contact.last_name} ${contact.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || contact.company === filterCompany;
    return matchesSearch && matchesCompany;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCSVModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingContact(contact)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCompany ? 'Try adjusting your search criteria.' : 'Get started by adding a new contact or importing from CSV.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={showAddModal || editingContact}
        onClose={() => {
          setShowAddModal(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => {
            setShowAddModal(false);
            setEditingContact(null);
          }}
        />
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title="Import Contacts from CSV"
        size="xl"
      >
        <CSVUpload
          onImportComplete={handleCSVImportComplete}
          onCancel={() => setShowCSVModal(false)}
        />
      </Modal>
    </div>
  );
};

// Opportunity Form Component (unchanged from original)
const OpportunityForm = ({ opportunity, contacts, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage: 'lead',
    contact_id: '',
    expected_close_date: '',
    ...opportunity
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value ($)
          </label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage
          </label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="lead">Lead</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact
          </label>
          <select
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Close Date
          </label>
          <input
            type="date"
            value={formData.expected_close_date}
            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          Save Opportunity
        </button>
      </div>
    </form>
  );
};

// Opportunities Component (unchanged from original)
const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  const fetchData = async () => {
    try {
      const [opportunitiesData, contactsData] = await Promise.all([
        apiCall('/api/opportunities'),
        apiCall('/api/contacts')
      ]);
      setOpportunities(opportunitiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveOpportunity = async (opportunityData) => {
    try {
      if (editingOpportunity) {
        await apiCall(`/api/opportunities/${editingOpportunity.id}`, {
          method: 'PUT',
          body: JSON.stringify(opportunityData),
        });
      } else {
        await apiCall('/api/opportunities', {
          method: 'POST',
          body: JSON.stringify(opportunityData),
        });
      }
      
      setShowAddModal(false);
      setEditingOpportunity(null);
      fetchData();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await apiCall(`/api/opportunities/${opportunityId}`, {
          method: 'DELETE',
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'lead': 'bg-gray-100 text-gray-800',
      'qualified': 'bg-blue-100 text-blue-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </button>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {opportunities.map((opportunity) => {
                const contact = contacts.find(c => c.id === opportunity.contact_id);
                return (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                      <div className="text-sm text-gray-500">{opportunity.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact ? `${contact.first_name} ${contact.last_name}` : 'No contact'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.value ? `$${Number(opportunity.value).toLocaleString()}` : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage?.toUpperCase().replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingOpportunity(opportunity)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpportunity(opportunity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first opportunity.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Opportunity Modal */}
      <Modal
        isOpen={showAddModal || editingOpportunity}
        onClose={() => {
          setShowAddModal(false);
          setEditingOpportunity(null);
        }}
        title={editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
      >
        <OpportunityForm
          opportunity={editingOpportunity}
          contacts={contacts}
          onSave={handleSaveOpportunity}
          onCancel={() => {
            setShowAddModal(false);
            setEditingOpportunity(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Activity Form Component (unchanged from original)
const ActivityForm = ({ activity, contacts, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    description: '',
    contact_id: '',
    activity_date: '',
    status: 'pending',
    ...activity
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact
          </label>
          <select
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Date
          </label>
          <input
            type="datetime-local"
            value={formData.activity_date}
            onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          Save Activity
        </button>
      </div>
    </form>
  );
};

// Activities Component (unchanged from original)
const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const fetchData = async () => {
    try {
      const [activitiesData, contactsData] = await Promise.all([
        apiCall('/api/activities'),
        apiCall('/api/contacts')
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveActivity = async (activityData) => {
    try {
      if (editingActivity) {
        await apiCall(`/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          body: JSON.stringify(activityData),
        });
      } else {
        await apiCall('/api/activities', {
          method: 'POST',
          body: JSON.stringify(activityData),
        });
      }
      
      setShowAddModal(false);
      setEditingActivity(null);
      fetchData();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await apiCall(`/api/activities/${activityId}`, {
          method: 'DELETE',
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </button>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => {
                const contact = contacts.find(c => c.id === activity.contact_id);
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {activity.type === 'call' && <Phone className="h-4 w-4 text-blue-500 mr-2" />}
                        {activity.type === 'email' && <Mail className="h-4 w-4 text-green-500 mr-2" />}
                        {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-500 mr-2" />}
                        {activity.type === 'task' && <Activity className="h-4 w-4 text-orange-500 mr-2" />}
                        <span className="text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.subject}</div>
                      <div className="text-sm text-gray-500">{activity.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingActivity(activity)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by logging your first activity.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Activity Modal */}
      <Modal
        isOpen={showAddModal || editingActivity}
        onClose={() => {
          setShowAddModal(false);
          setEditingActivity(null);
        }}
        title={editingActivity ? 'Edit Activity' : 'Log New Activity'}
      >
        <ActivityForm
          activity={editingActivity}
          contacts={contacts}
          onSave={handleSaveActivity}
          onCancel={() => {
            setShowAddModal(false);
            setEditingActivity(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Reports Component (unchanged)
const Reports = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Reports</h3>
      <p className="text-gray-500">Advanced reporting features coming soon.</p>
    </div>
  </div>
);

// Navigation Component (unchanged)
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: BarChart3 },
    { path: '/contacts', name: 'Contacts', icon: Users },
    { path: '/opportunities', name: 'Opportunities', icon: Target },
    { path: '/activities', name: 'Activities', icon: Activity },
    { path: '/reports', name: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Compass CRM</h1>
            <p className="text-sm text-gray-500">CBS Group & Water Roads</p>
          </div>
        </div>
      </div>
      
      <div className="px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Main App Component with useNavigate hook
const AppContent = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
