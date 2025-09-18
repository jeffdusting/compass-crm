import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function CSVImport({ onImportComplete, onCancel }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [duplicates, setDuplicates] = useState([])
  const [importing, setImporting] = useState(false)
  const [step, setStep] = useState('upload') // 'upload', 'preview', 'duplicates', 'importing'
  const [importResults, setImportResults] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const parseCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('CSV file must contain at least a header row and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
        })
        return row
      })

      setPreview(data.slice(0, 10)) // Show first 10 rows for preview
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const checkForDuplicates = async (data) => {
    const emails = data.map(row => row.email).filter(email => email)
    
    if (emails.length === 0) {
      return []
    }

    const { data: existingContacts, error } = await supabase
      .from('contacts')
      .select('email, first_name, last_name, company')
      .in('email', emails)

    if (error) {
      console.error('Error checking duplicates:', error)
      return []
    }

    return existingContacts || []
  }

  const handlePreviewConfirm = async () => {
    setImporting(true)
    
    // Read full file for import
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
        })
        return row
      })

      // Check for duplicates
      const existingContacts = await checkForDuplicates(data)
      
      if (existingContacts.length > 0) {
        setDuplicates(existingContacts)
        setStep('duplicates')
        setImporting(false)
        return
      }

      // No duplicates, proceed with import
      await performImport(data)
    }
    reader.readAsText(file)
  }

  const performImport = async (data, skipDuplicates = false) => {
    setImporting(true)
    
    const contactsToImport = data.map(row => ({
      tenant_id: 'cbs_group', // Default tenant, could be made configurable
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      company: row.company || '',
      job_title: row.job_title || row.title || '',
      address: row.address || '',
      notes: row.notes || '',
      tags: row.tags ? row.tags.split(';').map(tag => tag.trim()) : []
    })).filter(contact => contact.first_name && contact.last_name && contact.email)

    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const contact of contactsToImport) {
      try {
        if (skipDuplicates) {
          // Check if contact already exists
          const { data: existing } = await supabase
            .from('contacts')
            .select('id')
            .eq('email', contact.email)
            .single()
          
          if (existing) {
            continue // Skip this contact
          }
        }

        const { error } = await supabase
          .from('contacts')
          .insert([contact])

        if (error) {
          errorCount++
          errors.push(`${contact.email}: ${error.message}`)
        } else {
          successCount++
        }
      } catch (err) {
        errorCount++
        errors.push(`${contact.email}: ${err.message}`)
      }
    }

    setImportResults({
      total: contactsToImport.length,
      success: successCount,
      errors: errorCount,
      errorDetails: errors
    })

    setImporting(false)
    setStep('complete')
  }

  const handleDuplicateResolution = (action) => {
    if (action === 'skip') {
      // Re-read file and import, skipping duplicates
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const row = {}
          headers.forEach((header, index) => {
            row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
          })
          return row
        })
        await performImport(data, true)
      }
      reader.readAsText(file)
    } else if (action === 'cancel') {
      setStep('preview')
      setDuplicates([])
    }
  }

  const resetImport = () => {
    setFile(null)
    setPreview([])
    setDuplicates([])
    setImporting(false)
    setStep('upload')
    setImportResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleComplete = () => {
    resetImport()
    onImportComplete()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Contacts from CSV</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="text-4xl text-gray-400">📄</div>
                <div className="text-lg font-medium text-gray-900">
                  Choose CSV file to upload
                </div>
                <div className="text-sm text-gray-500">
                  or drag and drop your file here
                </div>
              </label>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Required columns: first_name, last_name, email</li>
                <li>• Optional columns: phone, company, job_title, address, notes, tags</li>
                <li>• Tags should be separated by semicolons (;)</li>
                <li>• First row must contain column headers</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Preview Import Data</h3>
              <span className="text-sm text-gray-500">
                Showing first 10 rows of {preview.length} total
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border-b text-left">First Name</th>
                    <th className="px-4 py-2 border-b text-left">Last Name</th>
                    <th className="px-4 py-2 border-b text-left">Email</th>
                    <th className="px-4 py-2 border-b text-left">Company</th>
                    <th className="px-4 py-2 border-b text-left">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{row.first_name}</td>
                      <td className="px-4 py-2 border-b">{row.last_name}</td>
                      <td className="px-4 py-2 border-b">{row.email}</td>
                      <td className="px-4 py-2 border-b">{row.company}</td>
                      <td className="px-4 py-2 border-b">{row.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handlePreviewConfirm}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Checking for duplicates...' : 'Import Contacts'}
              </button>
            </div>
          </div>
        )}

        {step === 'duplicates' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Duplicate Contacts Found
              </h3>
              <p className="text-yellow-700 mb-4">
                {duplicates.length} contacts in your CSV already exist in the system. How would you like to handle them?
              </p>
              
              <div className="space-y-2">
                {duplicates.map((contact, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                    <div className="text-sm text-gray-600">{contact.email} • {contact.company}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleDuplicateResolution('cancel')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel Import
              </button>
              <button
                onClick={() => handleDuplicateResolution('skip')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Skip Duplicates & Import Others
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && importResults && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Import Complete
              </h3>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{importResults.total}</div>
                  <div className="text-sm text-green-800">Total Processed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-green-800">Successfully Imported</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                  <div className="text-sm text-red-800">Errors</div>
                </div>
              </div>
            </div>

            {importResults.errorDetails.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                <div className="text-sm text-red-700 space-y-1">
                  {importResults.errorDetails.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {importing && step !== 'complete' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-900">Importing contacts...</div>
            <div className="text-sm text-gray-500">Please wait while we process your file</div>
          </div>
        )}
      </div>
    </div>
  )
}

