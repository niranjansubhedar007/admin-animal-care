"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart, 
  faBars, 
  faTimes,
  faHandshake,
  faPaw,
  faSignOutAlt // Added logout icon
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const linkClasses = (href) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      pathname === href
        ? "bg-[#A294F9] text-white"
        : "text-[#5E4FA2] hover:bg-[#E5D9F2] hover:text-[#5E4FA2]"
    } transition`;

  const desktopLinkClasses = (href) =>
    `pb-1 border-b-2 ${
      pathname === href
        ? "border-[#A294F9] text-[#A294F9]"
        : "border-transparent text-[#5E4FA2] hover:text-[#A294F9]"
    } font-medium transition`;

  // Animation variants
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const heartBeat = {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatDelay: 2
    }
  };

// In your Navbar component
const handleLogout = () => {
  localStorage.removeItem("authToken");
  
  // Replace current history entry with login page
  window.history.replaceState(null, '', '/login');
  
  // Push a new entry to prevent back navigation
  router.push('/login');
  
  // Force reload to clear any cached state
  window.location.reload();
};

  return (
    <nav className="bg-[#F5EFFF] shadow-md fixed top-0 w-full z-50 font-sans">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0  backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white p-6 border border-[#5E4FA2] m-2 rounded-lg shadow-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-medium text-[#5E4FA2] mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border cursor-pointer border-[#5E4FA2] text-[#5E4FA2] rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 cursor-pointer bg-[#A294F9] text-white rounded-md hover:bg-[#8a7ae0] transition"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/images/logonew.png"
                className="h-10 w-auto md:h-10"
                alt="Animal Rescue Logo"
              />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {[
              { href: "/dashboard", label: "Home" },
              { href: "/animalRescue", label: "Animal Rescue" },
              { href: "/review", label: "Review" },
              { href: "/volunteer", label: "Volunteer" },
              { href: "/recruit", label: "Recruit" },
              { href: "/contact", label: "Contact" }
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link href={link.href} className={`${desktopLinkClasses(link.href)} flex items-center`}>
                  {link.icon && (
                    <FontAwesomeIcon icon={link.icon} className="mr-2" />
                  )}
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {/* Logout Button - Desktop */}
            <motion.button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center text-[#5E4FA2] cursor-pointer hover:text-[#A294F9] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#5E4FA2] hover:text-[#A294F9] focus:outline-none"
              aria-expanded={isMenuOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              <div className="bg-[#E5D9F2] p-2 rounded-full">
                <FontAwesomeIcon
                  icon={isMenuOpen ? faTimes : faBars}
                  className="h-5 w-5 text-[#5E4FA2]"
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-4 space-y-1 bg-[#F5EFFF] shadow-lg">
          {[
            { href: "/dashboard", label: "Home" },
            { href: "/animalRescue", label: "Animal Rescue" },
            { href: "/review", label: "Review" },
            { href: "/volunteer", label: "Volunteer" },
            { href: "/recruit", label: "Recruit" },
            { href: "/contact", label: "Contact" }
          ].map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
            >
              <Link 
                href={link.href} 
                className={`${linkClasses(link.href)} flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon && (
                  <FontAwesomeIcon icon={link.icon} className="mr-2" />
                )}
                {link.label}
              </Link>
            </motion.div>
          ))}
          
          {/* Logout Button - Mobile */}
          <motion.button
            onClick={() => setShowLogoutModal(true)}
            className={`${linkClasses("#")} w-full text-left flex items-center cursor-pointer`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.2 }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;