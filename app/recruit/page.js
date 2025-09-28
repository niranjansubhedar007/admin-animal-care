"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
    StepBack,
  StepForward,    
  ChevronRight,
} from "lucide-react";
import Navbar from "../navbar/page";
import ProtectedRoute from "../ProtectedRoute";

const RecruitmentList = () => {
  const [resumeData, setResumeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [educationFilter, setEducationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openResume, setOpenResume] = useState(null);

  const entriesPerPage = 5;

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    fetchResumeData();
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1);
  }, [resumeData, searchTerm, startDate, endDate, educationFilter, sortConfig]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("resume")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResumeData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...resumeData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.number?.toString().includes(term) ||
          item.address?.toLowerCase().includes(term) ||
          item.education?.toLowerCase().includes(term)
      );
    }

    if (startDate) {
      result = result.filter(
        (item) => new Date(item.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      result = result.filter(
        (item) => new Date(item.created_at) <= new Date(endDate + "T23:59:59")
      );
    }

    if (educationFilter !== "all") {
      result = result.filter((item) => item.education === educationFilter);
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setEducationFilter("all");
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const educationLevels = [
    "High School",
    "Diploma",
    "Bachelor's Degree",
    "Master's Degree",
  ];

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="py-20 min-h-screen mx-auto lg:px-4 md:px-3 px-1.5 bg-light">
          <h1 className="text-3xl font-bold mb-6 text-dark">
            Recruitment Management
          </h1>

          {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-light-accent">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    {/* Left side: filters */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-1">
      {/* Search */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <input
          type="text"
          placeholder="Search candidates..."
          className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border bg-white text-dark"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Education Filter + Date Range in same row */}
      <div className="relative flex flex-col sm:flex-row items-center w-full">
        <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
          <ChevronDown className="h-5 w-5 text-primary" />
        </div>
        <select
          className="pl-10 block lg:w-60 md:w-60 w-full  rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border appearance-none bg-white text-dark"
          value={educationFilter}
          onChange={(e) => setEducationFilter(e.target.value)}
        >
          <option value="all">All Education Levels</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-5 lg:mt-0 md:mt-0 ml-5 col-span-2">
          <div className="flex flex-col sm:flex-row items-center space-x-2 w-full">
            <div className="relative flex-1">
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
            <span className="text-primary">to</span>
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
          </div>
        </div>
      </div>
    </div>

    {/* Right side: Reset Button */}
    <div className="flex justify-end mt-4 md:mt-0">
      <button
        onClick={handleResetFilters}
        className="px-6 py-2 bg-light-accent text-purple-800 rounded-md hover:bg-primary hover:text-light transition-colors w-full md:w-auto"
      >
        Reset Filters
      </button>
    </div>
  </div>
</div>


          {/* Results Count */}
          <div className="mb-4 text-primary">
            Showing {filteredData.length > 0 ? indexOfFirstEntry + 1 : 0} to{" "}
            {Math.min(indexOfLastEntry, filteredData.length)} of{" "}
            {filteredData.length} candidates
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
                        {[
                          { key: "sr", label: "SR" },
                          { key: "created_at", label: "Applied Date" },
                          { key: "name", label: "Candidate Name" },
                          { key: "email", label: "Email" },
                          { key: "number", label: "Contact" },
                          { key: "education", label: "Education" },
                          { key: "resume_url", label: "Resume" },
                          { key: "address", label: "Address" },
                        ].map((col) => (
                          <th
                            key={col.key}
                            onClick={() =>
                              col.key !== "sr" && handleSort(col.key)
                            }
                            className={`px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider ${
                              col.key !== "sr" ? "cursor-pointer" : ""
                            }`}
                          >
                            {col.label}{" "}
                            {sortConfig.key === col.key
                              ? sortConfig.direction === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-light-accent">
                      {currentEntries.length > 0 ? (
                        currentEntries.map((item, index) => (
                          <tr key={item.id} className="hover:bg-light">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                              {indexOfFirstEntry + index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark">
                              {formatDate(item.created_at)}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark">
                              {item.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark">
                              {item.number}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark">
                              {item.education}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark">
                              {item.resume_url && (
                                <button
                                  onClick={() => setOpenResume(item.resume_url)}
                                  className="text-primary cursor-pointer hover:text-dark transition-colors"
                                >
                                  View Resume
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark break-words max-w-[250px]">
                              {item.address}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-4 text-center text-sm text-dark"
                          >
                            No candidates found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {entriesPerPage && (
                  <div className="flex items-center justify-between border-t border-light-accent bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-primary">
                          Showing{" "}
                          <span className="font-medium">
                            {indexOfFirstEntry + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              indexOfLastEntry,
                              filteredData.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredData.length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light disabled:opacity-50"
                          >
                            <StepBack className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light disabled:opacity-50"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (number) => (
                              <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`px-4 py-2 text-sm font-semibold ${
                                  currentPage === number
                                    ? "bg-primary text-light"
                                    : "text-dark ring-1 ring-inset ring-light-accent hover:bg-light"
                                }`}
                              >
                                {number}
                              </button>
                            )
                          )}
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light disabled:opacity-50"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => paginate(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light disabled:opacity-50"
                          >
                                                      <StepForward className="h-5 w-5" aria-hidden="true" />
                            
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Resume Popup Modal */}
          {openResume && (
            <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-3/4 h-3/4 relative">
                <button
                  onClick={() => setOpenResume(null)}
                  className="absolute bottom-2 right-2 px-3 py-1 bg-red-500 text-white rounded"
                >
                  Close
                </button>
                <iframe
                  src={openResume}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </>
  );
};

export default RecruitmentList;
