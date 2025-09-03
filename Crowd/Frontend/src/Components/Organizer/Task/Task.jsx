import { ClipboardList,
  CheckCircle2,AlertTriangle,TimerReset,UserRound,Edit,Locate,Trash2Icon} from 'lucide-react';
import React, { useState } from 'react'
import AddTask from '../Task/AddTask';

const Task = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  

  // Example summary cards (like your parking cards)
  const cards = [
    { title: "Total Tasks", icon: <ClipboardList color="#2f80ed" size={30} />, count: "42" },
    { title: "In Progress", icon: <TimerReset color="#f59e0b" size={30} />, count: "18" },
    { title: "Completed", icon: <CheckCircle2 color="#4ade80" size={30} />, count: "20" },
    { title: "Overdue", icon: <AlertTriangle color="#ef4444" size={30} />, count: "4" },
  ];

  // Example coordinators for the AddForm dropdown
  const coordinators = [
    { id: "c1", name: "Aisha Perera", email: "aisha@example.com" },
    { id: "c2", name: "Nimal Silva", email: "nimal@example.com" },
  ];

  // Handle create from the popup (frontend-only for now)
  function handleCreate(task) {
    console.log("New task created:", task);
    // later: push to your state or call backend API
  }

  return (
    <div className="p-12 2xl:h-screen">
      <div className="header text-white text-3xl font-bold">Task Management</div>
      <div className="sub-heading text-gray-300 text-xl">Create tasks and assign a coordinator</div>

      {/* Cards */}
      <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 mt-8 md:grid-cols-2 gap-3 mx-auto">
        {cards.map((data, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 lg:w-58 md:w-76 text-white rounded-md p-5"
          >
            <div className="icon flex justify-between ">
              <div className="title text-[18px] ">{data.title}</div>
              <div className="icon relative top-5 ">{data.icon}</div>
            </div>
            <div className="count text-2xl mt-1 font-bold">{data.count}</div>
          </div>
        ))}
      </div>

      {/* Add Task button */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 rounded-md hover:opacity-70 text-white"
      >
        + Add Task
      </button>

      {/* Add Task Form (popup) */}
      <AddTask
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={handleCreate}
        coordinators={coordinators}
      />

      {/* Example task blocks (like your parking zones) */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Task 1 */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-md text-white text-2xl font-medium">
          <div className="title flex gap-3 items-start">
            <span>Sound arrangements</span>
            <div className="bg-yellow-500/20 text-xs rounded-full border border-yellow-300/20 w-auto px-3 h-5 flex items-center">
              in progress
            </div>
          </div>

          <div className="sub-heading flex mt-2 text-gray-300 items-center gap-2 text-sm">
            <UserRound size={18} />
            <div>Coordinator: <span className="text-white">Aisha Perera</span></div>
          </div>

           <div className="mt-3 text-sm text-gray-300 space-y-1">
            <div>
              Priority: <span className="text-white font-medium">High</span>
            </div>
            <div className="text-gray-300">
              Description: <span className="text-white/90">Microphones, mixer, stage monitors</span>
            </div>
            <div>
              Due: <span className="text-white">2025-09-05</span>
            </div>
          </div>

          <div className="progress mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/40">
            <div className="h-full w-0 rounded-full bg-yellow-400"></div>
          </div>

          <div className="btn mt-4 flex gap-6">
            <button className="flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white">
              <Locate size={15} className="relative top-[6px] mr-2" />
              Details
            </button>
            <button className="flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white">
              <Edit size={15} className="relative top-[6px] mr-2" />
              Edit
            </button>
            <button className="flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-red-400">
              <Trash2Icon size={15} className="relative top-[6px] mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Task 2 */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-md text-white text-2xl font-medium">
          <div className="title flex gap-3 items-start">
            <span>Light arrangements</span>
            <div className="bg-gray-500/20 text-xs rounded-full border border-gray-300/20 w-auto px-3 h-5 flex items-center">
              todo
            </div>
          </div>

          <div className="sub-heading flex mt-2 text-gray-300 items-center gap-2 text-sm">
            <UserRound size={18} />
            <div>Coordinator: <span className="text-white">Nimal Silva</span></div>
          </div>

          <div className="mt-3 text-sm text-gray-300 space-y-1">
            <div>
              Priority: <span className="text-white font-medium">High</span>
            </div>
            <div className="text-gray-300">
              Description: <span className="text-white/90">Microphones, mixer, stage monitors</span>
            </div>
            <div>
              Due: <span className="text-white">2025-09-05</span>
            </div>
          </div>

          <div className="progress mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/40">
            <div className="h-full w-0 rounded-full bg-yellow-400"></div>
          </div>

          <div className="btn mt-4 flex gap-6">
            <button className="flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white">
              <Locate size={15} className="relative top-[6px] mr-2" />
              Details
            </button>
            <button className="flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-white">
              <Edit size={15} className="relative top-[6px] mr-2" />
              Edit
            </button>
            <button className="flex text-lg border border-white/10 px-4 p-1 bg-white/5 rounded-md text-[17px] cursor-pointer text-red-400">
              <Trash2Icon size={15} className="relative top-[6px] mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Task
