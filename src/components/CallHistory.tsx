import React, { useState } from 'react';
import { Phone, Calendar, Clock, Filter, Search, Download } from 'lucide-react';
import { Contact, CallSchedule } from '../App';

interface CallHistoryProps {
  callHistory: CallSchedule[];
  contacts: Contact[];
}

const CallHistory: React.FC<CallHistoryProps> = ({ callHistory, contacts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const getContactPhone = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.phone : 'Unknown Number';
  };

  const getStatusColor = (status: CallSchedule['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'calling': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: CallSchedule['status']) => {
    switch (status) {
      case 'completed': return '✓';
      case 'failed': return '✗';
      case 'calling': return '📞';
      case 'pending': return '⏱️';
      default: return '❓';
    }
  };

  const filteredHistory = callHistory.filter(call => {
    const matchesSearch = searchTerm === '' || 
      getContactName(call.contactId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactPhone(call.contactId).includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    
    const callDate = new Date(call.scheduledTime);
    const now = new Date();
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && callDate.toDateString() === now.toDateString()) ||
      (dateFilter === 'week' && (now.getTime() - callDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
      (dateFilter === 'month' && (now.getTime() - callDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => 
    new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
  );

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Contact Name', 'Phone Number', 'Status', 'Message'];
    const csvData = sortedHistory.map(call => [
      new Date(call.scheduledTime).toLocaleDateString(),
      new Date(call.scheduledTime).toLocaleTimeString(),
      getContactName(call.contactId),
      getContactPhone(call.contactId),
      call.status,
      call.message || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = callHistory.length;
    const completed = callHistory.filter(c => c.status === 'completed').length;
    const failed = callHistory.filter(c => c.status === 'failed').length;
    const pending = callHistory.filter(c => c.status === 'pending').length;
    
    return { total, completed, failed, pending };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">कॉल इतिहास (Call History)</h2>
          <p className="text-gray-600 mt-2">अपनी कॉलिंग गतिविधि को ट्रैक और विश्लेषित करें</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={sortedHistory.length === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>CSV निर्यात करें</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">कुल कॉल</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Phone className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">पूर्ण</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              ✓
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">असफल</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
              ✗
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">लंबित</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="संपर्क नाम या फोन से खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">सभी स्थिति</option>
              <option value="completed">पूर्ण</option>
              <option value="failed">असफल</option>
              <option value="calling">कॉल कर रहे हैं</option>
              <option value="pending">लंबित</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">सभी समय</option>
              <option value="today">आज</option>
              <option value="week">इस सप्ताह</option>
              <option value="month">इस महीने</option>
            </select>
          </div>
        </div>
      </div>

      {/* Call History Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            कॉल रिकॉर्ड ({sortedHistory.length} {sortedHistory.length === 1 ? 'रिकॉर्ड' : 'रिकॉर्ड'})
          </h3>
        </div>
        
        {sortedHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    संपर्क
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    फोन नंबर
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    दिनांक और समय
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    स्थिति
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    संदेश
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedHistory.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getContactName(call.contactId).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getContactName(call.contactId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getContactPhone(call.contactId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div>{new Date(call.scheduledTime).toLocaleDateString('hi-IN', { timeZone: 'Asia/Kolkata' })}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(call.scheduledTime).toLocaleTimeString('hi-IN', { timeZone: 'Asia/Kolkata' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                        <span>{getStatusIcon(call.status)}</span>
                        <span className="capitalize">{call.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {call.message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">कोई कॉल इतिहास नहीं</h3>
            <p className="text-gray-500">
              {callHistory.length === 0 
                ? "इतिहास देखने के लिए कॉल करना शुरू करें"
                : "आपके वर्तमान फ़िल्टर से कोई कॉल मेल नहीं खाती"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallHistory;