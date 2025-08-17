"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import Navbar from "../navbar/page";
import ProtectedRoute from "../ProtectedRoute";

const ReviewsPage = () => {
  const [reviewsData, setReviewsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    fetchReviewsData();
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1);
  }, [reviewsData, searchTerm, startDate, endDate, ratingFilter]);

  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviewsData(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...reviewsData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.comment.toLowerCase().includes(term)
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

    if (ratingFilter !== "all") {
      result = result.filter((item) => item.rating === parseInt(ratingFilter));
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
    setRatingFilter("all");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? "fill-primary text-primary " : "text-light-accent"
            }`}
          />
        ))}
      </div>
    );
  };
  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="container mx-auto lg:px-4 md:px-3 px-1.5 py-20 bg-light">
          <h1 className="text-3xl font-bold mb-6 text-dark">
            Customer Reviews
          </h1>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-light-accent">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-primary" />
                </div>
                <select
                  className="pl-10 block w-full rounded-md border-light-accent shadow-sm focus:border-primary focus:ring-primary py-2 border appearance-none bg-white text-dark"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
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
                <span className="text-center sm:text-primary mb-2 sm:mb-0">
                  to
                </span>
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
                {/* Reset Button (separate cell, aligned) */}
                <div className="md:col-start-4 flex items-end lg:mt-0 md:mt-0 mt-4">
                  <button
                    onClick={handleResetFilters}
                    className="w-full md:w-auto px-4 py-2 min-h-[42px] bg-light-accent text-purple-800 rounded-md hover:bg-primary hover:text-light transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Reset Button (separate cell, aligned) */}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-primary">
            Showing {filteredData.length > 0 ? indexOfFirstEntry + 1 : 0} to{" "}
            {Math.min(indexOfLastEntry, filteredData.length)} of{" "}
            {filteredData.length} reviews
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4 border border-light-accent">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-accent">
                  <thead className="bg-primary">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider"
                      >
                        SR
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider"
                      >
                        Reviewer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider"
                      >
                        Rating
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider"
                      >
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-light-accent">
                    {currentEntries.length > 0 ? (
                      currentEntries.map((review, index) => (
                        <tr key={review.id} className="hover:bg-light">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            {indexOfFirstEntry + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                            {review.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            {formatDate(review.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            {renderStars(review.rating)}
                          </td>
                          <td className="px-6 py-4 text-sm text-dark max-w-xs">
                            {review.comment}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-sm text-dark"
                        >
                          No reviews found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > entriesPerPage && (
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
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
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
                                ? "bg-primary text-light focus:z-20 focus-visible:outline outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
          )}
        </div>
      </ProtectedRoute>
    </>
  );
};

export default ReviewsPage;
