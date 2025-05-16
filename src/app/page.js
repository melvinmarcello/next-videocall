"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Copy, Eye, X, Send, User, Mail, Hash, Phone as PhoneIcon } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

export default function page() {
  const router = useRouter();
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('/api/customer');
        setContacts(response.data.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);
  

  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset search function
  const resetSearch = () => {
    setSearchTerm('');
    setContacts(initialContacts);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setContacts(initialContacts);
    } else {
      const filtered = initialContacts.filter(contact => 
        contact.name.toLowerCase().includes(term.toLowerCase()) ||
        contact.email.toLowerCase().includes(term.toLowerCase()) ||
        contact.cif.toLowerCase().includes(term.toLowerCase()) ||
        contact.phone.includes(term)
      );
      setContacts(filtered);
    }
  };


  // Function to handle copy action
  const handleCopy = (uniq_id) => {    
    const text = `${window.location.origin}/client/${uniq_id}`;
    navigator.clipboard.writeText(text);
    toast.success(`Link Copied to clipboard`);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <ToastContainer />
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">Creating SMS Link Video</h1>
        
        {/* Search and filter row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <div className="flex">
              <div className="relative flex-grow">
                <button className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 border-r border-gray-300">
                  <Filter size={18} />
                  <span className="ml-2 mr-3">Filter</span>
                </button>
                <input
                  type="text"
                  className="pl-24 pr-10 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={resetSearch}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Reset
          </button>
          
          <div className="ml-auto">
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center space-x-2 hover:bg-indigo-700"
              onClick={() => setIsModalOpen(true)}
            >
              <span>Add SMS Link</span>
            </button>
            {isModalOpen && (
              <AddSMSLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            )}
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Cif</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.cif}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => router.push(`/cs/${contact.uniq_id}`)}
                          className="px-3 py-1 bg-blue-500 text-white rounded flex items-center text-xs hover:bg-blue-600"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => handleCopy(contact.uniq_id)}
                          className="px-3 py-1 bg-green-500 text-white rounded flex items-center text-xs hover:bg-green-600"
                        >
                          <Copy size={14} className="mr-1" />
                          Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty state */}
          {contacts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


const AddSMSLinkModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cif: "",
    phone: ""
  });
 const [errors, setErrors] = useState({});


  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {      
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.cif.trim()) newErrors.cif = "CIF is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      axios.post('/api/customer', { ...formData })
        .then(response => {
          toast.success("SMS Link added successfully!");
          console.log("SMS Link added successfully:", response.data);
        })
        .catch(error => {
          console.error("Error adding SMS Link:", error);
        }
      );
          // Reset form and close modal
      setFormData({ name: "", email: "", cif: "", phone: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-800/50 transition-opacity"></div>
      
      {/* Modal positioning */}
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div 
          className="relative bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Send size={20} />
              Add SMS Link
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white hover:bg-blue-700 transition-colors focus:outline-none"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-5">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="text-start block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="text-start block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* CIF field */}
                <div>
                  <label htmlFor="cif" className="text-start block text-sm font-medium text-gray-700 mb-1">
                    CIF
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="cif"
                      value={formData.cif}
                      onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                      className={`block w-full pl-10 pr-3 py-2 border ${errors.cif ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="123456789"
                    />
                  </div>
                  {errors.cif && <p className="mt-1 text-sm text-red-600">{errors.cif}</p>}
                </div>

                {/* Phone field */}
                <div>
                  <label htmlFor="phone" className="text-start block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`block w-full pl-10 pr-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                      placeholder="123-456-7890"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Footer with actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Add SMS Link
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
