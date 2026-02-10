// frontend/src/components/employee/HelpSupport.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import symbol from "./symbol.png";

function HelpSupport() {
  const { user } = useAuth();

  // Department-specific support contacts
  const supportContacts = {
    'Software Development': {
      name: 'Er. Amit Asthana',
      title: 'Senior Software Engineer',
      email: 'amit@techwizer.com',
      phone: '+91 98765 43210',
      department: 'Software Development'
    },
    'Finance & Legal': {
      name: 'CA. Priya Sharma',
      title: 'Finance Head',
      email: 'priya.sharma@techwizer.com',
      phone: '+91 98765 43211',
      department: 'Finance & Legal'
    },
    'HR & Sales': {
      name: 'Ms. Kalpana Gupta',
      title: 'HR Manager',
      email: 'kalpana.gupta@techwizer.com',
      phone: '+91 98765 43212',
      department: 'HR & Sales'
    }
  };

  const contact = supportContacts[user?.department] || supportContacts['Software Development'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-navy-blue">Help & Support</h2>

      {/* Main Support Card */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-capri-blue to-cobalt-blue text-white rounded-full w-24 h-24 flex items-center justify-center text-4xl mb-4">
            👤
          </div>
          <h3 className="text-2xl font-bold text-navy-blue mb-2">Your Department Support</h3>
          <p className="text-gray-600">
            Your department <span className="font-semibold">{user?.department}</span> comes under:
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 space-y-4">
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-cobalt-blue">{contact.name}</h4>
            <p className="text-gray-600 font-semibold">{contact.title}</p>
            <p className="text-sm text-gray-500 mt-1">{contact.department} Department</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">📧</div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Email</p>
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-cobalt-blue hover:text-navy-blue font-semibold break-all"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">📞</div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Contact Number</p>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-cobalt-blue hover:text-navy-blue font-semibold"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Help Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-navy-blue mb-4 flex items-center">
            <span className="mr-2">💡</span> Quick Tips
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-cobalt-blue mr-2">•</span>
              <span>Update your daily tasks regularly for better tracking</span>
            </li>
            <li className="flex items-start">
              <span className="text-cobalt-blue mr-2">•</span>
              <span>Mark projects as complete with detailed remarks</span>
            </li>
            <li className="flex items-start">
              <span className="text-cobalt-blue mr-2">•</span>
              <span>Flag important clients as "Sensitive" for management visibility</span>
            </li>
            <li className="flex items-start">
              <span className="text-cobalt-blue mr-2">•</span>
              <span>Monitor your file storage usage to avoid exceeding limits</span>
            </li>
            <li className="flex items-start">
              <span className="text-cobalt-blue mr-2">•</span>
              <span>Always logout properly to track your working hours accurately</span>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-navy-blue mb-4 flex items-center">
            <span className="mr-2">❔</span> Frequently Asked Questions
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-800">How do I reset my password?</p>
              <p className="text-gray-600">Contact your department head for password reset assistance.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">What's my storage limit?</p>
              <p className="text-gray-600">Each employee has 50MB storage for files (PDFs and images).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">How are working days calculated?</p>
              <p className="text-gray-600">Total working days are unique dates you've logged in, regardless of multiple sessions per day.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Who can see my data?</p>
              <p className="text-gray-600">Only you and authorized management personnel can access your information.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-gradient-to-r from-navy-blue via-cobalt-blue to-capri-blue text-white rounded-lg shadow-md p-6">
        <img src={symbol} alt="logo" className=" mb-0 w-12"/>
        <h3 className="text-xl font-bold mb-4">Techwizer India Private Limited</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-1">Head Office:</p>
            <p className="opacity-90">Luucknow, Uttar Pradesh, India</p>
          </div>
          <div>
            <p className="font-semibold mb-1">General Inquiries:</p>
            <p className="opacity-90">techwizer@gmail.com</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Technical Support:</p>
            <p className="opacity-90">support@techwizer.com</p>
          </div>
          <div>
            <p className="font-semibold mb-1">HR Department:</p>
            <p className="opacity-90">hr@techwizer.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpSupport;