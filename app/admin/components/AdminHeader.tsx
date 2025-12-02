'use client';

import { Search, Bell, MessageSquare, User, ChevronDown } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-1 dark:bg-[#1C2434] dark:drop-shadow-none border-b border-stroke dark:border-strokedark">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        
        {/* Search Bar */}
        <div className="hidden sm:block">
          <form action="#" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search className="text-gray-500 hover:text-primary" size={20} />
              </button>
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              />
            </div>
          </form>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Dark Mode Toggle (Placeholder) */}
            <li>
                <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                    <span className="dark:hidden">☀️</span>
                    <span className="hidden dark:inline-block">🌙</span>
                </button>
            </li>

            {/* Notification */}
            <li className="relative">
              <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                <Bell size={18} />
                <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-red-500 inline">
                  <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                </span>
              </button>
            </li>

            {/* Chat */}
            <li className="relative">
              <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                <MessageSquare size={18} />
              </button>
            </li>
          </ul>

          {/* User Profile */}
          <div className="relative flex items-center gap-4">
            <div className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-black dark:text-white">Thomas Anree</span>
              <span className="block text-xs text-gray-500">UX Designer</span>
            </div>

            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-300">
                <img src="https://i.pravatar.cc/150?img=12" alt="User" className="w-full h-full object-cover" />
            </div>
            
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
