import  { useState } from "react";
import mentorImage from '../../../assets/mentor1.jpg'

const ExploreMentors = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Sample mentor data (to replace with backend API data)
  const mentors = Array(8).fill({
    name: "Jane Doe",
    title: "Frontend Developer",
    skills: ["React", "JavaScript", "CSS"],
    image: "https://via.placeholder.com/150",
    available: true,
  });

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch data for the new page from the backend
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search for mentors..."
          className="w-full sm:w-[40%] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Category</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="design">Design</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Skill</option>
            <option value="react">React</option>
            <option value="node">Node.js</option>
            <option value="figma">Figma</option>
          </select>
        </div>
      </div>

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mentors.map((mentor, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={mentorImage}
              alt={`${mentor.name}'s profile`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold">{mentor.name}</h3>
              <p className="text-sm text-gray-500">{mentor.title}</p>
              <div className="mt-2">
                <span className="text-xs font-semibold text-gray-700 uppercase">
                  Skills:
                </span>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {mentor.skills.map((skill, idx) => (
                    <li
                      key={idx}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`mt-4 w-full px-4 py-2 text-sm font-bold text-white rounded-lg ${
                  mentor.available
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
                disabled={!mentor.available}
              >
                {mentor.available ? "Request Mentor" : "Unavailable"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          className={`px-3 py-2 rounded-lg text-sm ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-500 hover:bg-indigo-100"
          }`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-2 rounded-lg text-sm ${
              currentPage === idx + 1
                ? "bg-indigo-500 text-white"
                : "text-indigo-500 hover:bg-indigo-100"
            }`}
            onClick={() => handlePageChange(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button
          className={`px-3 py-2 rounded-lg text-sm ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-500 hover:bg-indigo-100"
          }`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExploreMentors;
