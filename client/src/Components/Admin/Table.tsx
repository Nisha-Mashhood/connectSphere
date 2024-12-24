import React from 'react'

const Table = ({data, editingdataId, editingData}) => {
  return (
    <div>
        <table className="table-auto border-collapse border border-gray-200 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Image</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <>
                      <input type="file" onChange={handleImageChange} />
                      {editedCategory?.preview && (
                        <img
                          src={editedCategory.preview}
                          alt="Preview"
                          className="mt-2 w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </>
                  ) : (
                    <img
                      src={category.imageUrl || "https://via.placeholder.com/100"}
                      alt={category.name}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <input
                      type="text"
                      value={editedCategory.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="border border-gray-300 rounded-md w-full p-2"
                    />
                  ) : (
                    <Link to={`/admin/subcategories/${category._id}`}>
                    {category.name} </Link>           
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <textarea
                      value={editedCategory.description}
                      onChange={(e) => handleInputChange(e, "description")}
                      className="border border-gray-300 rounded-md w-full p-2"
                    />
                  ) : (
                    category.description
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="border border-gray-300 px-4 py-2 flex gap-4">
                      <button
                      onClick={() => handleEditClick(category)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600" onClick={() => deleteCategory(category._id)}>
                    Delete
                  </button>
                    </div>
                    
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

export default Table