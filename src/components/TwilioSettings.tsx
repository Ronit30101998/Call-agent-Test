import React, { useState } from 'react';
import { Settings, Phone, Key, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { TwilioConfig } from '../App';

interface TwilioSettingsProps {
  config: TwilioConfig;
  onUpdateConfig: (config: TwilioConfig) => void;
}

const TwilioSettings: React.FC<TwilioSettingsProps> = ({ config, onUpdateConfig }) => {
  const [formData, setFormData] = useState<TwilioConfig>(config);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    alert('Twilio configuration saved successfully!');
  };

  const testConnection = async () => {
    if (!formData.accountSid || !formData.authToken) {
      alert('Please enter your Account SID and Auth Token first.');
      return;
    }

    setIsTestingConnection(true);
    
    // In a real implementation, you would test the connection here
    // This is a simulation
    setTimeout(() => {
      setIsTestingConnection(false);
      alert('Connection test completed! (Note: This is a demo - actual connection testing would require server-side implementation)');
    }, 2000);
  };

  const isConfigComplete = formData.accountSid && formData.authToken && formData.fromNumber;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Twilio सेटिंग्स</h2>
        <p className="text-gray-600 mt-2">कॉल करने के लिए अपना Twilio खाता कॉन्फ़िगर करें</p>
      </div>

      {/* Configuration Status */}
      <div className={`rounded-xl p-6 border ${isConfigComplete 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isConfigComplete ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isConfigComplete ? (
              <span className="text-green-600 text-lg">✓</span>
            ) : (
              <Settings className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${isConfigComplete ? 'text-green-800' : 'text-yellow-800'}`}>
              {isConfigComplete ? 'कॉन्फ़िगरेशन पूर्ण' : 'कॉन्फ़िगरेशन आवश्यक'}
            </h3>
            <p className={`text-sm ${isConfigComplete ? 'text-green-700' : 'text-yellow-700'}`}>
              {isConfigComplete 
                ? 'आपका Twilio खाता कॉन्फ़िगर है और उपयोग के लिए तैयार है।'
                : 'कॉलिंग कार्यक्षमता सक्षम करने के लिए कृपया नीचे कॉन्फ़िगरेशन पूरी करें।'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Phone className="w-6 h-6 text-blue-600" />
          <span>Twilio खाता सेटअप</span>
        </h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">शुरुआत करना:</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li><a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center space-x-1"><span>twilio.com</span><ExternalLink className="w-3 h-3" /></a> पर Twilio खाता बनाएं</li>
              <li>अपने Twilio Console Dashboard पर जाएं</li>
              <li>अपना Account SID और Auth Token खोजें</li>
              <li>Twilio से एक फोन नंबर खरीदें (भारतीय नंबर उपलब्ध)</li>
              <li>नीचे विवरण दर्ज करें</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">खाता कॉन्फ़िगरेशन</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              खाता SID (Account SID) *
            </label>
            <div className="relative">
              <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.accountSid}
                onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              आपके Twilio Console Dashboard में मिलता है
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्राधिकरण टोकन (Auth Token) *
            </label>
            <div className="relative">
              <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type={showAuthToken ? 'text' : 'password'}
                value={formData.authToken}
                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                required
              />
              <button
                type="button"
                onClick={() => setShowAuthToken(!showAuthToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showAuthToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              इसे गुप्त रखें! आपके Twilio Console Dashboard में मिलता है
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              फोन नंबर से (From Phone Number) *
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="tel"
                value={formData.fromNumber}
                onChange={(e) => setFormData({ ...formData, fromNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              आपका Twilio फोन नंबर (देश कोड शामिल करना आवश्यक, जैसे +91 98765 43210)
            </p>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>कॉन्फ़िगरेशन सहेजें</span>
            </button>
            
            <button
              type="button"
              onClick={testConnection}
              disabled={!formData.accountSid || !formData.authToken || isTestingConnection}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isTestingConnection ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>परीक्षण कर रहे हैं...</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  <span>कनेक्शन परीक्षण</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-600 text-sm">⚠️</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-800 mb-2">सुरक्षा सूचना</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <p>• आपकी Twilio क्रेडेंशियल्स आपके ब्राउज़र में स्थानीय रूप से संग्रहीत हैं</p>
              <p>• कभी भी अपना Auth Token या Account SID दूसरों के साथ साझा न करें</p>
              <p>• उत्पादन में, ये क्रेडेंशियल्स आपके सर्वर पर सुरक्षित रूप से संग्रहीत होनी चाहिए</p>
              <p>• नियमित रूप से अपने Twilio उपयोग और बिलिंग की निगरानी करें</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwilioSettings;