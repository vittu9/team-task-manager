import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">TM</span>
              </div>
              <span className="text-xl font-bold">Task Manager</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="#home" 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                Home
              </Link>
              <Link 
                to="#features" 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                Features
              </Link>
              <Link 
                to="#about" 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                About
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="px-4 py-2 text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="min-h-screen flex flex-col items-center justify-center relative">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Hero Content */}
        <div className="text-center relative z-10 px-4">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <span className="text-white/80 text-sm font-medium">🚀 Modern Task Management</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Streamline Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Workflow
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
            Powerful task management, team collaboration, and real-time analytics. 
            Everything you need to keep your projects on track and your team productive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
            <Link 
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/60 text-sm">Active Teams</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9★</div>
              <div className="text-white/60 text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gradient-to-b from-transparent to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <span className="text-white/80 text-sm font-medium">Features</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}Succeed
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Powerful features designed for modern teams and projects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5h4a2 2 0 012 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Task Management</h3>
              <p className="text-white/70">
                Create, assign, and track tasks with deadlines, priorities, and real-time updates
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Team Collaboration</h3>
              <p className="text-white/70">
                Work together with real-time updates, team assignments, and seamless communication
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Analytics Dashboard</h3>
              <p className="text-white/70">
                Track progress with detailed analytics, insights, and performance metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Built for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Modern Teams
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Our platform combines powerful task management with intuitive design to help teams collaborate more effectively. 
            From startups to enterprises, we provide the tools you need to succeed in today's fast-paced work environment.
          </p>
        </div>
      </div>
    </div>
  );
}
