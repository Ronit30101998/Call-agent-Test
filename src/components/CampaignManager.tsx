import React, { useState } from 'react';
import { Plus, Play, Pause, Trash2, Edit, Users, Phone, Calendar, Settings } from 'lucide-react';
import { Contact, Campaign, TwilioConfig } from '../App';
import { makeCall } from '../utils/twilioClient';

interface CampaignManagerProps {
  contacts: Contact[];
  campaigns: Campaign[];
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  twilioConfig: TwilioConfig;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({
  contacts,
  campaigns,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  twilioConfig
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedContacts: [] as string[]
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', selectedContacts: [] });
    setIsCreating(false);
    setEditingCampaign(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.selectedContacts.length === 0) return;

    const campaignData = {
      name: formData.name,
      description: formData.description,
      contacts: formData.selectedContacts,
      schedules: [],
      status: 'active' as const
    };

    if (editingCampaign) {
      onUpdateCampaign(editingCampaign.id, campaignData);
    } else {
      onAddCampaign(campaignData);
    }
    resetForm();
  };

  const startEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      selectedContacts: campaign.contacts
    });
  };

  const toggleCampaignStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    onUpdateCampaign(campaign.id, { status: newStatus });
  };

  const startCampaign = async (campaign: Campaign) => {
    if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.fromNumber) {
      alert('Please configure your Twilio settings first!');
      return;
    }

    // Make actual Twilio API calls
    const selectedContacts = contacts.filter(c => campaign.contacts.includes(c.id));
    
    try {
      for (let i = 0; i < selectedContacts.length; i++) {
        const contact = selectedContacts[i];
        
        // Make actual Twilio API call
        setTimeout(async () => {
          try {
            await makeCall(contact, twilioConfig);
            console.log(`Successfully called ${contact.name} at ${contact.phone}`);
          } catch (error) {
            console.error(`Failed to call ${contact.name}:`, error);
          }
        }, i * 3000); // 3 second delay between calls
      }
      
      alert(`Started calling campaign "${campaign.name}" with ${selectedContacts.length} contacts!`);
    } catch (error) {
      console.error('Campaign start error:', error);
      alert('Failed to start campaign. Please check your Twilio configuration.');
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(contactId)
        ? prev.selectedContacts.filter(id => id !== contactId)
        : [...prev.selectedContacts, contactId]
    }));
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Campaign Management</h2>
          <p className="text-gray-600 mt-2">Create and manage your calling campaigns</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Twilio Configuration Warning */}
      {(!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.fromNumber) && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-amber-600 mr-2" />
            <p className="text-amber-800">
              <strong>Twilio Configuration Required:</strong> Please configure your Twilio settings to enable calling functionality.
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Campaign Form */}
      {(isCreating || editingCampaign) && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief campaign description"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Contacts ({formData.selectedContacts.length} selected)
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <label key={contact.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">📞 {contact.phone}</p>
                        {(contact.state || contact.city) && (
                          <p className="text-xs text-gray-400">📍 {contact.city && contact.state ? `${contact.city}, ${contact.state}` : contact.state || contact.city}</p>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No contacts available</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="text-gray-600 text-sm mt-1">{campaign.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span className="capitalize">{campaign.status}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">{campaign.contacts.length} contacts</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Created {new Date(campaign.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(campaign)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Campaign"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleCampaignStatus(campaign)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      campaign.status === 'active'
                        ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                    title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDeleteCampaign(campaign.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => startCampaign(campaign)}
                  disabled={!twilioConfig.accountSid || campaign.status !== 'active'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  <span>Start Calling</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Create your first calling campaign to get started</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Campaign</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignManager;