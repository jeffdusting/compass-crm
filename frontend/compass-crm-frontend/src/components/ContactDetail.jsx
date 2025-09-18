import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  Edit, 
  ArrowLeft,
  User
} from 'lucide-react'

export function ContactDetail({ contact, onEdit, onBack }) {
  if (!contact) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Select a contact to view details
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Button>
        <Button onClick={() => onEdit(contact)} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Contact
        </Button>
      </div>

      {/* Main contact info */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {contact.first_name} {contact.last_name}
              </CardTitle>
              {contact.job_title && (
                <p className="text-lg text-gray-600 mt-1">{contact.job_title}</p>
              )}
              {contact.company && (
                <p className="text-gray-500">{contact.company}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            {contact.company && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p>{contact.company}</p>
                </div>
              </div>
            )}

            {contact.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="whitespace-pre-line">{contact.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {contact.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <p className="whitespace-pre-line text-gray-700">{contact.notes}</p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <p>Created</p>
                <p>{formatDate(contact.created_at)}</p>
              </div>
            </div>
            {contact.updated_at !== contact.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div>
                  <p>Last Updated</p>
                  <p>{formatDate(contact.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Activity history will be available in Phase 2
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

