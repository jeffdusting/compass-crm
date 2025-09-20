import { useState } from 'react'
import { ContactList } from '@/components/ContactList'
import { ContactForm } from '@/components/ContactForm'
import { ContactDetail } from '@/components/ContactDetail'
import OpportunityList from './components/OpportunityList'
import ActivityList from './components/ActivityList'
import EmailIntegration from './components/EmailIntegration'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('list') // 'list', 'form', 'detail', 'opportunities', 'activities', 'email'
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [editingContact, setEditingContact] = useState(null)

  const handleContactSelect = (contact) => {
    setSelectedContact(contact)
    setCurrentView('detail')
  }

  const handleContactCreate = () => {
    setEditingContact(null)
    setCurrentView('form')
  }

  const handleContactEdit = (contact) => {
    setEditingContact(contact)
    setCurrentView('form')
  }

  const handleContactSave = (savedContact) => {
    setCurrentView('detail')
    setSelectedContact(savedContact)
    setEditingContact(null)
  }

  const handleFormCancel = () => {
    if (selectedContact) {
      setCurrentView('detail')
    } else {
      setCurrentView('list')
    }
    setEditingContact(null)
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedContact(null)
    setEditingContact(null)
  }

  const handleSelectOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity)
    // TODO: Implement opportunity detail view
    console.log('Selected opportunity:', opportunity)
  }

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity)
    // TODO: Implement activity detail view
    console.log('Selected activity:', activity)
  }

  const handleCreateOpportunity = () => {
    // TODO: Implement opportunity form
    console.log('Create opportunity clicked')
  }

  const handleCreateActivity = () => {
    // TODO: Implement activity form
    console.log('Create activity clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Compass CRM</h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                CBS Group
              </span>
            </div>
            <nav className="flex space-x-4">
              <button 
                onClick={handleBackToList}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'list' || currentView === 'form' || currentView === 'detail'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contacts
              </button>
              <button 
                onClick={() => setCurrentView('opportunities')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'opportunities'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Opportunities (Phase 2)
              </button>
              <button 
                onClick={() => setCurrentView('activities')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'activities'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activities (Phase 2)
              </button>
              <button 
                onClick={() => setCurrentView('email')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'email'
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Email Integration (Phase 3)
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <ContactList
            onContactSelect={handleContactSelect}
            onContactCreate={handleContactCreate}
            onContactEdit={handleContactEdit}
          />
        )}

        {currentView === 'form' && (
          <ContactForm
            contact={editingContact}
            onSave={handleContactSave}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'detail' && (
          <ContactDetail
            contact={selectedContact}
            onEdit={handleContactEdit}
            onBack={handleBackToList}
          />
        )}

        {currentView === 'opportunities' && (
          <OpportunityList
            onSelectOpportunity={handleSelectOpportunity}
            onCreateOpportunity={handleCreateOpportunity}
          />
        )}

        {currentView === 'activities' && (
          <ActivityList
            onSelectActivity={handleSelectActivity}
            onCreateActivity={handleCreateActivity}
          />
        )}

        {currentView === 'email' && (
          <EmailIntegration />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            Compass CRM - Phase 3: Microsoft Graph Email Integration
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
