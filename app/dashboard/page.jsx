"use client";
import React from "react";
import Navigation1 from "../../components/navigation-1";

function MainComponent() {
  const [error, setError] = useState(null);
  const { data: user, loading: userLoading } = useUser();
  const [role, setRole] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch("/api/get-user-role", { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to fetch role");
        }
        const data = await response.json();
        setRole(data.role);
      } catch (err) {
        console.error(err);
        setError("Failed to load user role");
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/course-operations", {
          method: "POST",
          body: JSON.stringify({ type: "fetch" }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
      }
    };

    const fetchEnrollments = async () => {
      try {
        const response = await fetch("/api/enrollment-operations", {
          method: "POST",
          body: JSON.stringify({ type: "list" }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch enrollments");
        }
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRole();
      fetchCourses();
      fetchEnrollments();
    }
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-[#357AFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Please sign in to access your dashboard
          </p>
          <a
            href="/account/signin"
            className="px-6 py-2 bg-[#357AFF] text-white rounded-lg hover:bg-blue-600"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const StudentDashboard = () => {
    const enrolledCourses = courses.filter((course) =>
      enrollments.some((enrollment) => enrollment.course_id === course.id)
    );

    const getEnrollmentProgress = (courseId) => {
      const enrollment = enrollments.find((e) => e.course_id === courseId);
      return enrollment ? enrollment.progress : 0;
    };

    return (
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {enrolledCourses.length}
              </div>
              <div className="text-gray-600">Enrolled Courses</div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {
                  enrolledCourses.filter(
                    (course) => getEnrollmentProgress(course.id) === 100
                  ).length
                }
              </div>
              <div className="text-gray-600">Completed Courses</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  enrolledCourses.reduce(
                    (acc, course) => acc + getEnrollmentProgress(course.id),
                    0
                  ) / (enrolledCourses.length || 1)
                )}
                %
              </div>
              <div className="text-gray-600">Average Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">My Enrolled Courses</h2>
          <div className="space-y-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <span className="text-sm text-gray-600">
                    Progress: {getEnrollmentProgress(course.id)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${getEnrollmentProgress(course.id)}%` }}
                    role="progressbar"
                    aria-valuenow={getEnrollmentProgress(course.id)}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Instructor: {course.instructor_name}
                  </span>
                  <a
                    href={`/course/${course.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Learning
                  </a>
                </div>
              </div>
            ))}
            {enrolledCourses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-book-open text-4xl mb-4"></i>
                <p>You haven't enrolled in any courses yet.</p>
                <a
                  href="/courses"
                  className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  Browse Courses
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const InstructorDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Courses</h2>
          <a
            href="/instructor"
            className="px-4 py-2 bg-[#357AFF] text-white rounded-lg hover:bg-blue-600"
          >
            Manage Courses
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((course) => course.instructor_id === user.id)
            .map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
              />
            ))}
        </div>
      </div>
    </div>
  );

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {courses.length}
            </div>
            <div className="text-gray-600">Total Courses</div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              <i className="fas fa-users mr-2"></i>
              Active Users
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              <i className="fas fa-chalkboard-teacher mr-2"></i>
              Instructors
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              description={course.description}
              instructor={course.instructor_name}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation1 userRole={role} userName={user?.name} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Welcome back, {user?.name}!
        </h1>

        {role === "student" && <StudentDashboard />}
        {role === "instructor" && <InstructorDashboard />}
        {role === "admin" && <AdminDashboard />}
      </div>
    </div>
  );
}

export default MainComponent;