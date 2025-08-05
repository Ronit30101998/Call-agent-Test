import React, { useState } from 'react';
import { Clock, Phone, Calendar, Users, Play } from 'lucide-react';
import { Contact, CallSchedule } from '../App';

interface CallSchedulerProps {
  contacts: Contact[];
  onScheduleCall: (schedule: CallSchedule) => void;
}

const CallScheduler: React.FC<CallSchedulerProps> = ({ contacts, onScheduleCall }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [interval, setInterval] = useState(5); // minutes between calls
  const [repeatCount, setRepeatCount] = useState(1);
  const [message, setMessage] = useState('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled' | 'interval'>('immediate');

  const handleSchedule = () => {
    if (selectedContacts.length === 0) return;

    const baseTime = scheduleType === 'immediate' 
      ? new Date() 
      : new Date(scheduledTime);

    selectedContacts.forEach((contactId, index) => {
      const callTime = new Date(baseTime);
      
      if (scheduleType === 'interval') {
        callTime.setMinutes(callTime.getMinutes() + (index * interval));
      }

      const schedule: CallSchedule = {
        id: `${Date.now()}-${contactId}-${index}`,
        contactId,
        scheduledTime: callTime.toISOString(),
        interval: scheduleType === 'interval' ? interval : undefined,
        repeatCount,
        status: 'pending',
        message: message || undefined
      };

      onScheduleCall(schedule);
    });

    // Reset form
    setSelectedContacts([]);
    setScheduledTime('');
    setMessage('');
    alert(`Successfully scheduled ${selectedContacts.length} calls!`);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    setSelectedContacts(contacts.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedContacts([]);
  };

  const getNextCallTime = () => {
    if (scheduleType === 'immediate') return 'Now';
    if (scheduleType === 'scheduled') return new Date(scheduledTime).toLocaleString();
    
    const baseTime = new Date(scheduledTime || Date.now());
    const endTime = new Date(baseTime);
    endTime.setMinutes(endTime.getMinutes() + ((selectedContacts.length - 1) * interval));
    
    return `${baseTime.toLocaleString()} - ${endTime.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">कॉल शेड्यूलर (Call Scheduler)</h2>
        <p className="text-gray-600 mt-2">अनुकूलन योग्य समय के साथ कई संपर्कों को कॉल शेड्यूल करें</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Selection */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>संपर्क चुनें ({selectedContacts.length} चयनित)</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={selectAllContacts}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                सभी चुनें
              </button>
              <button
                onClick={clearSelection}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                साफ़ करें
              </button>
            </div>
          </div>
          
          {contacts.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => toggleContactSelection(contact.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedContacts.includes(contact.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedContacts.includes(contact.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedContacts.includes(contact.id) && (
                        <div className="w-2 h-2 rounded bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">📞 {contact.phone}</p>
                      {(contact.state || contact.city) && (
                        <p className="text-xs text-gray-400">📍 {contact.city && contact.state ? `${contact.city}, ${contact.state}` : contact.state || contact.city}</p>
                      )}
                      {contact.notes && (
                        <p className="text-xs text-gray-400 truncate mt-1">{contact.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">कोई संपर्क उपलब्ध नहीं</p>
              <p className="text-sm text-gray-400">कॉल शेड्यूल करने के लिए पहले संपर्क जोड़ें</p>
            </div>
          )}
        </div>

        {/* Schedule Configuration */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span>शेड्यूल सेटिंग्स</span>
          </h3>

          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">कॉल समय (Call Timing)</label>
            <div className="space-y-2">
              {[
                { value: 'immediate', label: 'तुरंत कॉल करें (Call Immediately)', desc: 'अभी कॉल करना शुरू करें' },
                { value: 'scheduled', label: 'बाद के लिए शेड्यूल करें (Schedule for Later)', desc: 'एक विशिष्ट प्रारंभ समय सेट करें' },
                { value: 'interval', label: 'अंतराल पर कॉल (Staggered Calls)', desc: 'अंतराल पर कॉल करें' }
              ].map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    value={option.value}
                    checked={scheduleType === option.value}
                    onChange={(e) => setScheduleType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Scheduled Time */}
          {(scheduleType === 'scheduled' || scheduleType === 'interval') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {scheduleType === 'scheduled' ? 'कॉल समय (Call Time)' : 'प्रारंभ समय (Start Time)'}
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}

          {/* Interval Settings */}
          {scheduleType === 'interval' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                कॉल के बीच अंतराल (मिनट में)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}

          {/* Repeat Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              दोहराने की संख्या (Repeat Count)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={repeatCount}
              onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कॉल संदेश (वैकल्पिक)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              placeholder="कॉल के दौरान चलाने के लिए संदेश दर्ज करें..."
            />
          </div>

          {/* Schedule Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">शेड्यूल सारांश (Schedule Summary)</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>संपर्क: {selectedContacts.length}</p>
              <p>प्रारंभ समय: {getNextCallTime()}</p>
              <p>दोहराना: {repeatCount}x</p>
              {scheduleType === 'interval' && (
                <p>कुल अवधि: ~{Math.ceil((selectedContacts.length - 1) * interval)} मिनट</p>
              )}
            </div>
          </div>

          {/* Schedule Button */}
          <button
            onClick={handleSchedule}
            disabled={selectedContacts.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            <span>कॉल शेड्यूल करें</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallScheduler;