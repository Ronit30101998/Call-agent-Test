import React, { useState, useEffect } from 'react';
import { Phone, Plus, Clock, Users, BarChart3, Settings, Play, Pause, Trash2, Edit, Calendar, MapPin } from 'lucide-react';
import ContactManager from './components/ContactManager';
import CallScheduler from './components/CallScheduler';
import CampaignManager from './components/CampaignManager';
import CallHistory from './components/CallHistory';
import TwilioSettings from './components/TwilioSettings';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  state?: string;
  city?: string;
  notes?: string;
}

export interface CallSchedule {
  id: string;
  contactId: string;
  scheduledTime: string;
  interval?: number; // minutes between calls
  repeatCount?: number;
  status: 'pending' | 'calling' | 'completed' | 'failed';
  message?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  contacts: string[];
  schedules: CallSchedule[];
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [callHistory, setCallHistory] = useState<CallSchedule[]>([]);
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    fromNumber: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('twilio-contacts');
    const savedCampaigns = localStorage.getItem('twilio-campaigns');
    const savedHistory = localStorage.getItem('twilio-history');
    const savedConfig = localStorage.getItem('twilio-config');

    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
    if (savedHistory) setCallHistory(JSON.parse(savedHistory));
    if (savedConfig) setTwilioConfig(JSON.parse(savedConfig));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('twilio-contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('twilio-campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('twilio-history', JSON.stringify(callHistory));
  }, [callHistory]);

  useEffect(() => {
    localStorage.setItem('twilio-config', JSON.stringify(twilioConfig));
  }, [twilioConfig]);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts(prev => [...prev, newContact]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCampaigns(prev => [...prev, newCampaign]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const getStats = () => {
    const totalContacts = contacts.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalCalls = callHistory.length;
    const successfulCalls = callHistory.filter(c => c.status === 'completed').length;
    
    return {
      totalContacts,
      activeCampaigns,
      totalCalls,
      successRate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0
    };
  };

  const stats = getStats();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'scheduler', label: 'Call Scheduler', icon: Clock },
    { id: 'campaigns', label: 'Campaigns', icon: Phone },
    { id: 'history', label: 'Call History', icon: Calendar },
    { id: 'settings', label: 'Twilio Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">India CallAgent</h1>
                <p className="text-sm text-gray-500">Indian Calling Solution</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 mb-2 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
                <p className="text-gray-600">Monitor your calling campaigns and performance</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalContacts}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCampaigns}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Calls</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCalls}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.successRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {callHistory.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {callHistory.slice(0, 5).map((call) => {
                      const contact = contacts.find(c => c.id === call.contactId);
                      return (
                        <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              call.status === 'completed' ? 'bg-green-500' :
                              call.status === 'failed' ? 'bg-red-500' :
                              call.status === 'calling' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{contact?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">📞 {contact?.phone}</p>
                              {contact?.state && (
                                <p className="text-xs text-gray-400">📍 {contact.city}, {contact.state}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 capitalize">{call.status}</p>
                            <p className="text-xs text-gray-500">{new Date(call.scheduledTime).toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">कोई हाल की गतिविधि नहीं</p>
                    <p className="text-sm text-gray-400">कॉल इतिहास देखने के लिए एक अभियान शुरू करें</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <ContactManager
              contacts={contacts}
              onAddContact={addContact}
              onUpdateContact={updateContact}
              onDeleteContact={deleteContact}
            />
          )}

          {activeTab === 'scheduler' && (
            <CallScheduler
              contacts={contacts}
              twilioConfig={twilioConfig}
              onScheduleCall={(schedule) => {
                setCallHistory(prev => [...prev, schedule]);
              }}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignManager
              contacts={contacts}
              campaigns={campaigns}
              onAddCampaign={addCampaign}
              onUpdateCampaign={updateCampaign}
              onDeleteCampaign={deleteCampaign}
              twilioConfig={twilioConfig}
            />
          )}

          {activeTab === 'history' && (
            <CallHistory
              callHistory={callHistory}
              contacts={contacts}
            />
          )}

          {activeTab === 'settings' && (
            <TwilioSettings
              config={twilioConfig}
              onUpdateConfig={setTwilioConfig}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;