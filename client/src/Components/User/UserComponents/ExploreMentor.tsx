import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  // Select,
  // SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Radio,
  RadioGroup,
  Avatar,
  Chip,
  Pagination,
  Spinner
} from "@nextui-org/react";
import { fetchAllMentors } from "../../../Service/Mentor.Service";
import { fetchCategoriesService, getAllSkills } from "../../../Service/Category.Service";

const ExploreMentors = () => {
  // State management
  const [mentors, setMentors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages] = useState(10);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [mentorsData, categoriesData, skillsData] = await Promise.all([
          fetchAllMentors(),
          fetchCategoriesService(),
          getAllSkills(),
        ]);

        console.log('Categories Data:', categoriesData);
        console.log('Skills Data:', skillsData);

        setMentors(mentorsData || []);
        setCategories(categoriesData || []);
        setSkills(skillsData.skills || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.userId?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || mentor.category === selectedCategory;
    const matchesSkill =
      !selectedSkill ||
      mentor.skills?.some((skill) => skill._id === selectedSkill);
    return matchesSearch && matchesCategory && matchesSkill;
  });

  // Request mentor handler
  const handleRequestMentor = async () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    try {
      // Add your booking logic here
      console.log(`Booking mentor ${selectedMentor._id} for slot ${selectedSlot}`);
      setSelectedMentor(null);
    } catch (error) {
      console.error("Error booking mentor:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header and Search Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Explore Mentors</h1>
          <p className="text-gray-600">Find the perfect mentor to guide your journey</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search mentors by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            size="lg"
          />
          {/* <div className="flex gap-4">
            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              <SelectItem key="all" value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Skill"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-40"
            >
              <SelectItem key="all" value="">All Skills</SelectItem>
              {skills.map((skill) => (
                <SelectItem key={skill._id} value={skill._id}>
                  {skill.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div> */}

<div className="flex gap-4">
            {/* Category Select with Tailwind */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Skills Select with Tailwind */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-40 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Skills</option>
              {skills.map((skill) => (
                <option key={skill._id} value={skill._id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mentor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Spinner size="lg" className="mx-auto my-12" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <Link to={`/mentorship/${mentor._id}`}>
                  <img
                    src={mentor.userId?.profilePic || "/api/placeholder/400/400"}
                    alt={mentor.userId?.name}
                    className="w-full aspect-square object-cover"
                  />
                </Link>
              </CardHeader>
              <CardBody className="space-y-4">
                <Link to={`/mentorship/${mentor._id}`}>
                  <h3 className="text-xl font-semibold">{mentor.userId?.name}</h3>
                </Link>
                <p className="text-gray-600">{mentor.specialization}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills?.slice(0, 3).map((skill) => (
                      <Chip key={skill._id} size="sm" variant="flat">
                        {skill.name}
                      </Chip>
                    ))}
                    {mentor.skills?.length > 3 && (
                      <Chip size="sm" variant="flat">
                        +{mentor.skills.length - 3}
                      </Chip>
                    )}
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button
                  color="primary"
                  className="w-full"
                  onPress={() => setSelectedMentor(mentor)}
                >
                  Book Session
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={setCurrentPage}
          showControls
        />
      </div>

      {/* Booking Modal */}
      <Modal 
        isOpen={!!selectedMentor} 
        onClose={() => setSelectedMentor(null)}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Book Mentorship Session</ModalHeader>
              <ModalBody>
                {selectedMentor && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={selectedMentor.userId?.profilePic || "/api/placeholder/100/100"}
                        alt={selectedMentor.userId?.name}
                        size="lg"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedMentor.userId?.name}
                        </h3>
                        <p className="text-gray-600">{selectedMentor.specialization}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Available Time Slots</h4>
                      <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
                        {selectedMentor.availableSlots.map((slot, idx) => (
                          <Radio 
                            key={idx} 
                            value={`${slot.day}-${slot.timeSlots[0]}`}
                          >
                            {slot.day} - {slot.timeSlots.join(", ")}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Session Fee</p>
                        <p className="text-lg font-semibold">₹{selectedMentor.price}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleRequestMentor}>
                  Confirm Booking
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ExploreMentors;