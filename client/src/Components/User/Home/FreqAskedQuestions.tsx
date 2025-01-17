const FreqAskedQuestions = () => {
    return (
      <div>
        <section className="dark:bg-gray-100 dark:text-gray-800">
          <div className="container flex flex-col justify-center p-4 mx-auto md:p-8">
            <p className="p-2 text-sm font-medium tracking-wider text-center uppercase">How it works</p>
            <h2 className="mb-12 text-4xl font-bold leading-none text-center sm:text-5xl">Frequently Asked Questions</h2>
            <div className="grid gap-10 md:gap-8 sm:p-3 md:grid-cols-2 lg:px-12 xl:px-32">
              <div>
                <h3 className="font-semibold">What is ConnectSphere?</h3>
                <p className="mt-1 dark:text-gray-600">
                  ConnectSphere is a virtual co-working and collaboration platform designed to empower remote workers and students. It enables women to connect, collaborate, mentor, and find growth opportunities in a secure and supportive environment.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">How do I join ConnectSphere?</h3>
                <p className="mt-1 dark:text-gray-600">
                  You can join ConnectSphere by signing up on our platform. Once registered, you can create your profile, join groups, and connect with mentors and peers. The platform is inclusive and beginner-friendly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">What features does ConnectSphere offer?</h3>
                <p className="mt-1 dark:text-gray-600">
                  ConnectSphere offers live collaboration tools, mentorship matchmaking, personalized news feeds, real-time chat, time management tools like Pomodoro timers, and wellness features including mindfulness activities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Is ConnectSphere secure?</h3>
                <p className="mt-1 dark:text-gray-600">
                  Yes, ConnectSphere prioritizes your privacy and security. We use encrypted communication, secure file sharing, and implement best practices to ensure your data is protected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };
  
  export default FreqAskedQuestions;

  

