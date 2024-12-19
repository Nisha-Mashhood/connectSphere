import  { useState } from 'react'

const Categories = () => {
    const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Development",
      description: "All development-related topics",
      image: "https://via.placeholder.com/150",
      subcategories: [
        {
          id: 1,
          name: "Frontend",
          description: "UI/UX design and development",
          skills: ["React", "Angular", "Vue.js"],
        },
        {
          id: 2,
          name: "Backend",
          description: "Server-side development",
          skills: ["Node.js", "Express", "Django"],
        },
      ],
    },
    {
      id: 2,
      name: "Design",
      description: "Design tools and principles",
      image: "https://via.placeholder.com/150",
      subcategories: [
        {
          id: 3,
          name: "Graphic Design",
          description: "Creating visuals for branding",
          skills: ["Photoshop", "Illustrator"],
        },
        {
          id: 4,
          name: "UI/UX Design",
          description: "User experience and interfaces",
          skills: ["Figma", "Adobe XD"],
        },
      ],
    },
  ]);

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);

  const handleExpandCategory = (id) =>
    setExpandedCategory(expandedCategory === id ? null : id);

  const handleExpandSubcategory = (id) =>
    setExpandedSubcategory(expandedSubcategory === id ? null : id);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Add New Category
      </button>

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow p-4 border"
          >
            {/* Category Header */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleExpandCategory(category.id)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                  Edit
                </button>
                <button className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>

            {/* Subcategories Accordion */}
            {expandedCategory === category.id && (
              <div className="mt-4 ml-4">
                <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                  Add New Subcategory
                </button>
                <div className="space-y-4">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-gray-50 rounded-lg shadow p-4 border"
                    >
                      {/* Subcategory Header */}
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => handleExpandSubcategory(sub.id)}
                      >
                        <div>
                          <h4 className="text-md font-medium">{sub.name}</h4>
                          <p className="text-sm text-gray-500">
                            {sub.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                            Edit
                          </button>
                          <button className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Skills Accordion */}
                      {expandedSubcategory === sub.id && (
                        <div className="mt-4 ml-4">
                          <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Add New Skill
                          </button>
                          <ul className="list-disc pl-5 space-y-2">
                            {sub.skills.map((skill, index) => (
                              <li
                                key={index}
                                className="flex justify-between items-center"
                              >
                                <span>{skill}</span>
                                <div className="flex space-x-2">
                                  <button className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                                    Edit
                                  </button>
                                  <button className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories