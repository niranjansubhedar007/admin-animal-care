"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDownIcon,
  X,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import Navbar from "../navbar/page";
import ProtectedRoute from "../ProtectedRoute";

const AnimalRescueList = () => {
  const [rescueData, setRescueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    fetchRescueData();
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1); // Reset to first page when filters change
  }, [rescueData, searchTerm, startDate, endDate, urgencyFilter]);

  const fetchRescueData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("animal_rescue")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRescueData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...rescueData];

    // Apply search filter - fixed to be case insensitive
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.email && item.email.toLowerCase().includes(term)) ||
          (item.number && item.number.toLowerCase().includes(term)) ||
          (item.address && item.address.toLowerCase().includes(term)) ||
          (item.urgency_level &&
            item.urgency_level.toLowerCase().includes(term))
      );
    }

    // Apply date filter
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

    // Apply urgency filter
    if (urgencyFilter !== "all") {
      result = result.filter((item) => item.urgency_level === urgencyFilter);
    }

    setFilteredData(result);
  };

  // Sort data based on column
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
    setSortConfig({ key, direction });
  };

  // Get current entries for pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate(getTodayDate());
    setEndDate(getTodayDate());
    setUrgencyFilter("all");
    setCurrentPage(1);
    setSortConfig({ key: null, direction: "ascending" });
    fetchRescueData(); // Refetch data to reset sorting
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openImageModal = (url, item) => {
    setSelectedImage({ url, item });
    setZoomLevel(1);
    setRotation(0);
    setImageLoaded(false);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = () => {
    if (!selectedImage) return;

    const link = document.createElement("a");
    link.href = selectedImage.url;
    link.download = `animal_rescue_${selectedImage.item.id || "image"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeImageModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="py-20 min-h-screen mx-auto lg:px-4 md:px-3 px-1.5 bg-light">
          <h1 className="text-3xl font-bold mb-6 text-dark">
            Animal Rescue Cases
          </h1>

          {/* Filters Section */}
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
                    placeholder="Search cases..."
                    className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Urgency - Fixed width */}
                <div className="relative flex flex-col sm:flex-row items-center w-full ">
                  <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-primary" />
                  </div>
                  <select
                    className="pl-10 block   lg:w-72 md:w-72 w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border appearance-none bg-white text-dark"
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                  >
                    <option value="all">All Urgency Levels</option>
                    <option value="emergency">Emergency</option>
                    <option value="urgent">Urgent</option>
                    <option value="not urgent">Not Urgent</option>
                  </select>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-5  lg:mt-0 md:mt-0  ml-5 col-span-2">
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

                {/* Date Range - Fixed layout to prevent overlapping */}
              </div>

              {/* Right side: Reset Button - Fixed positioning */}
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
            {filteredData.length} cases
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
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("id")}
                        >
                          <div className="flex items-center">
                            SR
                            {sortConfig.key === "id" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("created_at")}
                        >
                          <div className="flex items-center">
                            Date
                            {sortConfig.key === "created_at" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {sortConfig.key === "name" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("number")}
                        >
                          <div className="flex items-center">
                            Contact
                            {sortConfig.key === "number" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("address")}
                        >
                          <div className="flex items-center">
                            Address
                            {sortConfig.key === "address" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("urgency_level")}
                        >
                          <div className="flex items-center">
                            Urgency
                            {sortConfig.key === "urgency_level" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                          Image
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {sortConfig.key === "email" &&
                              (sortConfig.direction === "ascending" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-light-accent">
                      {currentEntries.length > 0 ? (
                        currentEntries.map((item, index) => (
                          <tr key={item.id} className="hover:bg-light">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                              {indexOfFirstEntry + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                              {formatDate(item.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                              {item.number}
                            </td>
                            <td className="px-6 py-4 text-sm text-dark max-w-xs break-words">
                              {item.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    item.urgency_level === "emergency" ||
                                    item.urgency_level === "urgent"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                              >
                                {item.urgency_level}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                              {item.animal_url && (
                                <button
                                  onClick={() =>
                                    openImageModal(item.animal_url, item)
                                  }
                                  className="text-primary cursor-pointer hover:text-dark transition-colors"
                                >
                                  View Image
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                              {item.email}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-4 text-center text-sm text-dark"
                          >
                            No cases found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {entriesPerPage && (
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
                          Showing{" "}
                          <span className="font-medium">
                            {indexOfFirstEntry + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(indexOfLastEntry, filteredData.length)}
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
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-primary ring-1 ring-inset ring-light-accent hover:bg-light focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((number) => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === number
                                  ? "bg-primary text-light focus:z-20  focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-primary"
                                  : "text-dark ring-1 ring-inset ring-light-accent hover:bg-light focus:z-20 focus:outline-offset-0"
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
                            <ChevronRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Enhanced Image Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 backdrop-blur-sm bg-opacity-90 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
              onClick={closeImageModal}
            >
              <div
                className="bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    Animal Rescue Image
                    {selectedImage.item && selectedImage.item.name && (
                      <span className="text-gray-400 ml-2">
                        - {selectedImage.item.name}
                      </span>
                    )}
                  </h3>
                  <button
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                    onClick={closeImageModal}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="relative flex-1 flex items-center justify-center p-4 min-h-[300px]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <img
                    src={selectedImage.url}
                    alt="Animal Rescue"
                    className={`w-98 h-98 object-contain transition-all duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      cursor: zoomLevel > 1 ? "grab" : "default",
                    }}
                    onLoad={handleImageLoad}
                    draggable={false}
                  />
                </div>

                {/* Modal Footer with Controls */}
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center space-x-2 mb-2 md:mb-0">
                      <span className="text-sm text-gray-300">
                        Zoom: {Math.round(zoomLevel * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out"
                      >
                        <ZoomOut size={20} />
                      </button>

                      <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 3}
                        className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In"
                      >
                        <ZoomIn size={20} />
                      </button>

                      <button
                        onClick={handleRotate}
                        className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                        title="Rotate"
                      >
                        <RotateCw size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </>
  );
};

export default AnimalRescueList;
