"use client";
import React from "react";

function MainComponent() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const { data: user } = useUser();
  const { signOut } = useAuth();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/course-operations", {
          method: "POST",
          body: JSON.stringify({ type: "fetch" }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.courses?.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load featured courses");
      }
    }

    fetchCourses();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <i className="fas fa-graduation-cap text-[#357AFF] text-2xl"></i>
                <span className="ml-2 text-xl font-semibold font-inter">
                  LearnHub
                </span>
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                  <span className="text-gray-700 mr-4">{user.name}</span>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-inter flex items-center"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a
                    href="/account/signin"
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-inter"
                  >
                    Sign In
                  </a>
                  <a
                    href="/account/signup"
                    className="px-4 py-2 rounded-md bg-[#357AFF] text-white hover:bg-blue-600 font-inter"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div
        className="relative min-h-[600px] flex items-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-inter mb-6 text-white">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Access quality education from expert instructors
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/account/signup"
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-opacity-90 transition-colors shadow-lg"
                >
                  Get Started Free
                </a>
                <a
                  href="/account/signin"
                  className="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg backdrop-blur-sm bg-opacity-80"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-inter text-gray-900 mb-4">
            Featured Courses
          </h2>
          <p className="text-xl text-gray-600">
            Start your learning journey with our top courses
          </p>
        </div>

        {error ? (
          <div className="text-center text-red-600 py-8">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                instructor={course.instructor_name}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href="/courses"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All Courses
            <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>

      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <i className="fas fa-laptop-code text-4xl text-blue-400 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Learn Online</h3>
              <p className="text-gray-400">Access courses anytime, anywhere</p>
            </div>
            <div>
              <i className="fas fa-certificate text-4xl text-blue-400 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Get Certified</h3>
              <p className="text-gray-400">Earn certificates upon completion</p>
            </div>
            <div>
              <i className="fas fa-users text-4xl text-blue-400 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-gray-400">Learn from industry professionals</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>© 2025 LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainComponent;