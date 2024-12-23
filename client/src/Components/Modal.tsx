import  { useState } from "react";
import  { useEffect } from "react";

function CRUDModal({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  initialValues,
}) {
  const [formValues, setFormValues] = useState(initialValues || {});

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(formValues);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {fields.map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        ))}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}



function CustomAccordion({ items, renderContent }) {
  const [expandedItemId, setExpandedItemId] = useState(null);

  const toggleItem = (id) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {items.map((item) => (
        <div key={item.id} className="border-b border-gray-200">
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200"
          >
            {item.title}
          </button>
          {expandedItemId === item.id && (
            <div className="p-4">{renderContent(item)}</div>
          )}
        </div>
      ))}
    </div>
  );
}





export default function Management() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [skills, setSkills] = useState({});
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    fields: [],
    onSave: () => {},
    initialValues: {},
  });

  useEffect(() => {
    // Fetch Categories initially
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch("/admin/category/get-categories");
    const data = await response.json();
    setCategories(data);
  };

  const fetchSubcategories = async (categoryId) => {
    const response = await fetch(`/admin/subcategory/get-subcategories/${categoryId}`);
    const data = await response.json();
    setSubcategories((prev) => ({ ...prev, [categoryId]: data }));
  };

  const fetchSkills = async (subcategoryId) => {
    const response = await fetch(`/admin/skills/get-skills/${subcategoryId}`);
    const data = await response.json();
    setSkills((prev) => ({ ...prev, [subcategoryId]: data }));
  };

  const handleModalOpen = (config) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const handleModalClose = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const renderSkills = (subcategory) => {
    const skillsList = skills[subcategory.id] || [];
    return (
      <>
        <button
          onClick={() => handleModalOpen({
            title: `Add Skill for ${subcategory.name}`,
            fields: [
              { name: "name", label: "Skill Name" },
              { name: "description", label: "Description" },
            ],
            onSave: (data) => console.log("Save Skill", data),
          })}
          className="mb-4 px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Skill
        </button>
        <ul className="list-disc ml-4">
          {skillsList.map((skill) => (
            <li key={skill.id} className="flex justify-between">
              {skill.name}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleModalOpen({
                      title: `Edit Skill: ${skill.name}`,
                      fields: [
                        { name: "name", label: "Skill Name", value: skill.name },
                        { name: "description", label: "Description", value: skill.description },
                      ],
                      onSave: (data) => console.log("Edit Skill", data),
                    })
                  }
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => console.log("Delete Skill", skill.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const renderSubcategories = (category) => {
    const subcategoriesList = subcategories[category.id] || [];
    return (
      <>
        <button
          onClick={() => fetchSubcategories(category.id)}
          className="mb-4 px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Load Subcategories
        </button>
        <CustomAccordion
          items={subcategoriesList.map((subcategory) => ({
            id: subcategory.id,
            title: subcategory.name,
          }))}
          renderContent={(subcategory) => renderSkills(subcategory)}
        />
      </>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Management</h1>
        <button
          onClick={() =>
            handleModalOpen({
              title: "Add Category",
              fields: [
                { name: "name", label: "Category Name" },
                { name: "description", label: "Description" },
              ],
              onSave: (data) => console.log("Save Category", data),
            })
          }
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Category
        </button>
      </div>

      <CustomAccordion
        items={categories.map((category) => ({
          id: category.id,
          title: category.name,
        }))}
        renderContent={(category) => renderSubcategories(category)}
      />

      <CRUDModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        title={modalConfig.title}
        fields={modalConfig.fields}
        onSave={modalConfig.onSave}
        initialValues={modalConfig.initialValues}
      />
    </div>
  );
}
