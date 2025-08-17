"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Search, Calendar, ChevronDown, ChevronLeft, ChevronRight, Mail, Phone, MessageSquare, User, Eye, EyeOff } from 'lucide-react';
import Navbar from '../navbar/page';
import ProtectedRoute from '../ProtectedRoute';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
    setCurrentPage(1);
  }, [messages, searchTerm, startDate, endDate, subjectFilter, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let result = [...messages];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.phone.includes(term) ||
        item.subject.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (startDate) {
      result = result.filter(item => 
        new Date(item.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      result = result.filter(item => 
        new Date(item.created_at) <= new Date(endDate + 'T23:59:59')
      );
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      result = result.filter(item => 
        item.subject.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => 
        item.status === statusFilter
      );
    }

    setFilteredMessages(result);
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  const toggleReadStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'read' ? 'unread' : 'read';
      const { error } = await supabase
        .from('contacts')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredMessages.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredMessages.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSubjectFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <>
      <Navbar/>
           <ProtectedRoute>
        <div className="container mx-auto lg:px-4 md:px-3 px-1.5 py-20 bg-light">
        <h1 className="text-3xl font-bold mb-6 text-dark">Contact Messages</h1>
        
        {/* Filters Section */}
       <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-light-accent">
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
    {/* Search Bar */}
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-primary" />
      </div>
      <input
        type="text"
        placeholder="Search messages..."
        className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Subject Filter */}
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ChevronDown className="h-5 w-5 text-primary" />
      </div>
      <select
        className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border appearance-none bg-white text-dark"
        value={subjectFilter}
        onChange={(e) => setSubjectFilter(e.target.value)}
      >
        <option value="all">All Subjects</option>
        <option value="donation">Donation</option>
        <option value="adoption">Adoption</option>
        <option value="volunteer">Volunteer</option>
      </select>
    </div>

    {/* Status Filter */}
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ChevronDown className="h-5 w-5 text-primary" />
      </div>
      <select
        className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border appearance-none bg-white text-dark"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="read">Read</option>
        <option value="unread">Unread</option>
      </select>
    </div>

    {/* Date Range */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 col-span-1 md:col-span-2">
      <div className="relative flex-1 mb-2 sm:mb-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <input
          type="date"
          className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <span className="text-center sm:text-primary mb-2 sm:mb-0">to</span>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <input
          type="date"
          className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Reset Button */}
      <div className="md:col-start-5 flex items-end lg:mt-0 md:mt-0 mt-4">
        <button
          onClick={handleResetFilters}
          className="w-full md:w-auto px-4 py-2 min-h-[42px] bg-light-accent text-purple-800 rounded-md hover:bg-primary hover:text-light transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  </div>
</div>


        {/* Results Count */}
        <div className="mb-4 text-primary">
          Showing {filteredMessages.length > 0 ? indexOfFirstEntry + 1 : 0} to{' '}
          {Math.min(indexOfLastEntry, filteredMessages.length)} of {filteredMessages.length} messages
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4 border border-light-accent">
              <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-light-accent">
                  <thead className="bg-primary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        SR No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-light-accent">
                    {currentEntries.length > 0 ? (
                      currentEntries.map((message, index) => (
                        <tr 
                          key={message.id} 
                          className={`hover:bg-light ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                        >
                          {/* Serial Number */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            {indexOfFirstEntry + index + 1}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            {formatDate(message.created_at)}
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                           
                              <div className="ml-4">
                                <div className="text-sm font-medium text-dark">
                                  {message.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            <div className="flex items-center">
                              {message.email}
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            <div className="flex items-center">
                              {message.phone}
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark capitalize">
                            {message.subject}
                          </td>

                          {/* Message */}
                          <td className="px-6 py-4 text-sm text-dark max-w-xs">
                            <div className="flex items-center">
                              <span className="truncate">{message.message}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${message.status === 'unread' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {message.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            <button
                              onClick={() => toggleReadStatus(message.id, message.status)}
                              className={`flex items-center ${
                                message.status === 'unread' 
                                  ? 'text-primary hover:text-dark' 
                                  : 'text-gray-500 hover:text-primary'
                              } transition-colors cursor-pointer`}
                            >
                              {message.status === 'unread' ? (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Mark as Read
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Mark as Unread
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan="9" 
                          className="px-6 py-4 text-center text-sm text-dark"
                        >
                          No messages found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-light-accent bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-light-accent bg-white px-4 py-2 text-sm font-medium text-dark hover:bg-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-light-accent bg-white px-4 py-2 text-sm font-medium text-dark hover:bg-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-primary">
                      Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastEntry, filteredMessages.length)}</span> of{' '}
                      <span className="font-medium">{filteredMessages.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === number
                              ? 'bg-primary text-light focus:z-20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary'
                              : 'text-dark ring-1 ring-inset ring-light-accent hover:bg-light focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
    </>
  );
};

export default ContactMessages;