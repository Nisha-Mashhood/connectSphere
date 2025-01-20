const About = () => {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        {/* Header Section */}
        <section className="text-center py-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to ConnectSphere
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            A virtual community platform for remote workers and students.
          </p>
        </section>
  
        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            At ConnectSphere, we aim to create an inclusive space that brings remote workers, students, and professionals
            together. We believe in fostering growth through collaboration, mentorship, and the sharing of knowledge and
            opportunities.
          </p>
        </section>
  
        {/* Features Section */}
        <section className="bg-white py-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
            Key Features of ConnectSphere
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Live Collaboration Tools</h3>
              <p className="text-gray-600 mt-4">
                Share files, collaborate on whiteboards, and have live video calls for seamless teamwork.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Mentorship Matchmaking</h3>
              <p className="text-gray-600 mt-4">
                Connect with mentors who can guide you toward achieving your professional or academic goals.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Wellness and Time Management</h3>
              <p className="text-gray-600 mt-4">
                Stay on top of your work-life balance with wellness resources and efficient time management tools.
              </p>
            </div>
          </div>
        </section>
  
        {/* Team Section */}
        <section className="bg-gray-100 py-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
            {/* Example Team Member */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-center font-semibold text-gray-800 mt-4">John Doe</h3>
              <p className="text-center text-gray-600">CEO & Founder</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-center font-semibold text-gray-800 mt-4">Jane Smith</h3>
              <p className="text-center text-gray-600">CTO</p>
            </div>
          </div>
        </section>
  
        {/* Call to Action */}
        <section className="bg-blue-600 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold mb-4">Join Us Today</h2>
          <p className="text-lg mb-6">
            Ready to be part of the ConnectSphere community? Sign up now and start collaborating!
          </p>
          <a
            href="#"
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg inline-block hover:bg-blue-700 transition-all"
          >
            Get Started
          </a>
        </section>
  
        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-6">
          <p>© 2025 ConnectSphere. All Rights Reserved.</p>
        </footer>
      </div>
    );
  };
  
  export default About;
  