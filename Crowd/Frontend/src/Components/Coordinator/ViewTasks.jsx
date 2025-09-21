import React, { useState, useEffect } from "react";

const ViewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    const sampleTasks = [
      {
        id: 1,
        title: "Setup Stage",
        description: "Arrange stage lighting and sound system",
        coordinator: "John Doe",
        otherStaff: "Jane, Michael",
        priority: "High",
        status: "Todo",
        dueDate: "2025-09-10",
      },
      {
        id: 2,
        title: "Security Check",
        description: "Ensure all zones are secure",
        coordinator: "Alice Smith",
        otherStaff: "Bob, Charlie",
        priority: "Medium",
        status: "In Progress",
        dueDate: "2025-09-09",
      },
      {
        id: 3,
        title: "Food Stalls Setup",
        description: "Coordinate with vendors",
        coordinator: "Michael Lee",
        otherStaff: "Sarah, Emma",
        priority: "Low",
        status: "Done",
        dueDate: "2025-09-08",
      },
    ];
    setTasks(sampleTasks);
  }, []);

  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    // Add min-h-screen and flex-col
    <div className="p-10 w-full text-white min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Assigned Tasks</h1>
      <p className="text-gray-300 mb-6">Click a task to view details & update status</p>

      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-white text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-300">
              <th className="pb-3 px-2">Title</th>
              <th className="pb-3 px-2">Coordinator</th>
              <th className="pb-3 px-2">Priority</th>
              <th className="pb-3 px-2">Status</th>
              <th className="pb-3 px-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                {/* Main Row */}
                <tr
                  className={`cursor-pointer transition-all duration-300 ${
                    expandedTask === task.id
                      ? "bg-white/10 backdrop-blur-lg shadow-lg"
                      : "hover:bg-white/5"
                  }`}
                  onClick={() => toggleExpand(task.id)}
                >
                  <td className="py-3 px-2 font-medium">{task.title}</td>
                  <td className="py-3 px-2">{task.coordinator}</td>
                  <td className="py-3 px-2">{task.priority}</td>
                  <td className="py-3 px-2">{task.status}</td>
                  <td className="py-3 px-2">{task.dueDate}</td>
                </tr>

                {/* Expanded Details */}
                {expandedTask === task.id && (
                  <tr className="border-b border-white/10 transition-all duration-300">
                    <td colSpan="5" className="p-4">
                      <div className="rounded-xl p-5 bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 transform transition duration-300 hover:scale-[1.01]">
                        <h2 className="text-xl font-semibold mb-3">{task.title}</h2>
                        <p className="text-gray-300 mb-3">{task.description}</p>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <p><span className="font-bold">Coordinator:</span> {task.coordinator}</p>
                          <p><span className="font-bold">Other Staff:</span> {task.otherStaff}</p>
                          <p><span className="font-bold">Priority:</span> {task.priority}</p>
                          <p><span className="font-bold">Due Date:</span> {task.dueDate}</p>
                        </div>

                        {/* Status Update Dropdown */}
                        <div className="mt-3">
                          <span className="font-bold mr-2">Status:</span>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="bg-gray-800 text-white p-2 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400">No tasks assigned yet.</div>
        )}
      </div>
    </div>
  );
};

export default ViewTasks;
