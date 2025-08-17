"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Navbar from "../navbar/page";
import ProtectedRoute from "../ProtectedRoute";
Chart.register(...registerables);

export default function Dashboard() {
  const [resumeData, setResumeData] = useState([]);
  const [contactData, setContactData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [animalRescueData, setAnimalRescueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [filteredData, setFilteredData] = useState({
    resumes: [],
    contacts: [],
    reviews: [],
    animalRescues: [],
  });
  const timeFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "This Year" },
    { value: "lastyear", label: "Last Year" },
  ];

  const [colors, setColors] = useState({
    dark: "#1E1B4B",
    primary: "#7C3AED",
    lightAccent: "#C4B5FD",
    light: "#F9FAFB",
    darkMuted: "#4B5563",
    primaryLight: "#A78BFA",
    primaryDark: "#4C1D95",
    accentSoft: "#DDD6FE",
    accentStrong: "#6D28D9",
    neutralGray: "#9CA3AF",
    pastelBlue: "#BFDBFE",
    pastelPurple: "#E9D5FF",
    deepPurple: "#5B21B6",
    royalPurple: "#7E22CE",
    lavender: "#C084FC",
    violet: "#8B5CF6",
    softTeal: "#99F6E4",
    softPink: "#FBCFE8",
    softYellow: "#FEF3C7",
    coral: "#FCA5A5",
    softGreen: "#A7F3D0",
  });

  // Load CSS variables safely in client
  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    setColors((prev) => ({
      ...prev,
      dark: rootStyles.getPropertyValue("--color-dark").trim(),
      primary: rootStyles.getPropertyValue("--color-primary").trim(),
      lightAccent: rootStyles.getPropertyValue("--color-light-accent").trim(),
      light: rootStyles.getPropertyValue("--color-light").trim(),
    }));
  }, []);

  // Utility: get a themed color array
  const getColorArray = (count) => {
    const palette = [
      colors.primary,
      colors.lightAccent,
      colors.primaryLight,
      colors.primaryDark,
      colors.deepPurple,
      colors.royalPurple,
      colors.lavender,
      colors.violet,
      colors.accentSoft,
      colors.accentStrong,
      colors.neutralGray,
      colors.pastelPurple,
      colors.softPink,
      colors.softTeal,
      colors.softYellow,
      colors.coral,
      colors.softGreen,
      colors.pastelBlue,
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  };

  const filterDataByTime = (data, createdAtKey = "created_at") => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    switch (timeFilter) {
      case "today":
        return data.filter((item) => {
          const itemDate = new Date(item[createdAtKey]);
          return itemDate >= today;
        });
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return data.filter((item) => {
          const itemDate = new Date(item[createdAtKey]);
          return itemDate >= weekAgo;
        });
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return data.filter((item) => {
          const itemDate = new Date(item[createdAtKey]);
          return itemDate >= monthAgo;
        });
      }
      case "6months": {
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return data.filter((item) => {
          const itemDate = new Date(item[createdAtKey]);
          return itemDate >= sixMonthsAgo;
        });
      }
      case "year": {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return data.filter((item) => {
          const itemDate = new Date(item[createdAtKey]);
          return itemDate >= yearAgo;
        });
      }
      case "lastyear": {
        const lastYearStart = new Date(today);
        lastYearStart.setFullYear(today.getFullYear() - 1);
        lastYearStart.setMonth(0, 1); // January 1st of last year
        const lastYearEnd = new Date(today);
        lastYearEnd.setFullYear(today.getFullYear() - 1);
        lastYearEnd.setMonth(11, 31); // December 31st of last year
        return data.filter((item) => {
          const itemDate = new Date(item[createdAtKey]);
          return itemDate >= lastYearStart && itemDate <= lastYearEnd;
        });
      }
      default:
        return data;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: resumes },
          { data: contacts },
          { data: reviews },
          { data: animalRescues },
        ] = await Promise.all([
          supabase.from("resume").select("*"),
          supabase.from("contacts").select("*"),
          supabase.from("reviews").select("*"),
          supabase.from("animal_rescue").select("*"),
        ]);

        setResumeData(resumes || []);
        setContactData(contacts || []);
        setReviewData(reviews || []);
        setAnimalRescueData(animalRescues || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever timeFilter or original data changes
    setFilteredData({
      resumes: filterDataByTime(resumeData),
      contacts: filterDataByTime(contactData),
      reviews: filterDataByTime(reviewData),
      animalRescues: filterDataByTime(animalRescueData),
    });
  }, [timeFilter, resumeData, contactData, reviewData, animalRescueData]);

  // CHART DATA
  const resumeEducationData = {
    labels: [
      "High School",
      "Diploma",
      "Bachelor's Degree",
      "Master's Degree",
      "Other",
    ],
    datasets: [
      {
        label: "Education Level",
        data: [
          filteredData.resumes.filter((r) => r.education === "High School")
            .length,
          filteredData.resumes.filter((r) => r.education === "Diploma").length,
          filteredData.resumes.filter(
            (r) => r.education === "Bachelor's Degree"
          ).length,
          filteredData.resumes.filter((r) => r.education === "Master's Degree")
            .length,
          filteredData.resumes.filter((r) => r.education === "Other").length,
        ],
        backgroundColor: getColorArray(5),
        borderRadius: 8,
      },
    ],
  };

  const contactStatusData = {
    labels: ["Rescue", "Adoption", "Volunteer", "Donation"],
    datasets: [
      {
        label: "Contact Subject",
        data: [
          filteredData.contacts.filter((c) => c.subject === "Rescue").length,
          filteredData.contacts.filter((c) => c.subject === "Adoption").length,
          filteredData.contacts.filter((c) => c.subject === "Volunteer").length,
          filteredData.contacts.filter((c) => c.subject === "Donation").length,
        ],
        backgroundColor: getColorArray(4),
      },
    ],
  };

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => filteredData.reviews.filter((r) => r.rating === star).length
  );
  const averageRating = (
    filteredData.reviews.reduce((sum, review) => sum + review.rating, 0) /
    (filteredData.reviews.length || 1)
  ).toFixed(1);

  const reviewRatingDoughnutData = {
    labels: ["5★", "4★", "3★", "2★", "1★"],
    datasets: [
      {
        label: "Ratings",
        data: ratingCounts,
        backgroundColor: getColorArray(5),
      },
    ],
  };

  const urgencyLevels = ["not urgent", "urgent", "emergency"];
  const urgencyColors = {
    "not urgent": colors.primary,
    urgent: colors.primaryDark,
    emergency: colors.primaryLight,
  };

  const animalRescueUrgencyData = {
    labels: urgencyLevels.map((level) => level.toUpperCase()),
    datasets: [
      {
        label: "Urgency Level",
        data: urgencyLevels.map(
          (level) =>
            filteredData.animalRescues.filter(
              (a) => a.urgency_level?.toLowerCase() === level
            ).length
        ),
        backgroundColor: urgencyLevels.map((level) => urgencyColors[level]),
        borderRadius: 6,
      },
    ],
  };

  const overviewData = {
    labels: ["Resumes", "Contacts", "Reviews", "Animal Rescues"],
    datasets: [
      {
        label: "Total Records",
        data: [
          filteredData.resumes?.length || 0,
          filteredData.contacts?.length || 0,
          filteredData.reviews?.length || 0,
          filteredData.animalRescues?.length || 0,
        ],
        backgroundColor: getColorArray(4),
        borderRadius: 8,
      },
    ],
  };

  // Chart.js styling
  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false, // Add this line
    plugins: {
      legend: {
        labels: {
          color: colors.dark,
          font: { weight: "bold" },
        },
        position: "top", // Optional: better for mobile
      },
      title: {
        display: !!title,
        text: title,
        color: colors.primary,
        font: { size: 18, weight: "bold" },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.dark,
          maxRotation: 45, // Prevents label overlapping
          minRotation: 45,
        },
      },
      y: {
        ticks: {
          color: colors.dark,
          precision: 0, // No decimal places for counts
        },
        beginAtZero: true,
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-primary">
        Loading data...
      </div>
    );
  }
return (
  <>
    <Navbar/>
    <ProtectedRoute>
      <div className="min-h-screen p-4  py-20" style={{ backgroundColor: colors.light }}>
        {/* Header and Time Filter */}
        <div className="flex mb-5 flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.dark }}>
            Organization Dashboard
          </h1>
          <div className="relative w-full md:w-auto">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="block w-full px-4 py-2 pr-8 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              style={{
                backgroundColor: colors.light,
                color: colors.dark,
                borderColor: colors.neutralGray
              }}
            >
              {timeFilterOptions.map((option) => (
                <option key={option.value} value={option.value} className="py-2">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bar Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
              Total Records Overview
            </h3>
            <div className="w-full" style={{ height: '350px' }}>
              <Bar data={overviewData} options={chartOptions("")} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
              Urgency Level Counts
            </h3>
            <div className="w-full" style={{ height: '350px' }}>
              <Bar data={animalRescueUrgencyData} options={chartOptions("")} />
            </div>
          </div>
        </div>

        {/* Doughnut Charts Section - Optimized for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
              Resume Education Levels
            </h3>
            <div className="w-full flex-1 min-h-[300px]">
              <Doughnut 
                data={resumeEducationData} 
                options={{
                  ...chartOptions(),
                  plugins: {
                    ...chartOptions().plugins,
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 20,
                        padding: 20,
                        font: {
                          size: 14
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
              Contact Request Status
            </h3>
            <div className="w-full flex-1 min-h-[300px]">
              <Pie 
                data={contactStatusData} 
                options={{
                  ...chartOptions(),
                  plugins: {
                    ...chartOptions().plugins,
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 20,
                        padding: 20,
                        font: {
                          size: 14
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
              Customer Reviews
            </h3>
            <div className="w-full flex-1 min-h-[300px]">
              <Doughnut 
                data={reviewRatingDoughnutData} 
                options={{
                  ...chartOptions(),
                  plugins: {
                    ...chartOptions().plugins,
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 20,
                        padding: 20,
                        font: {
                          size: 14
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Average Rating: {averageRating}/5
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  </>
);
            }
