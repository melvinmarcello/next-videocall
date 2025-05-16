"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Copy, Eye, X, Send, User, Mail, Hash, Phone as PhoneIcon } from 'lucide-react';
import axios from 'axios';
import AddSMSLinkModal from '@/app/components/AddSMSLinkModal/AddSMSLinkModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

export default function Home() {
  const Router = useRouter();

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
                          onClick={() => Router.push(`/cs/${contact.uniq_id}`)}
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



