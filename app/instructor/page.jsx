"use client";
import React from "react";
import Navigation1 from "../../components/navigation-1";

function MainComponent() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    questions: [{ question: "", options: ["", "", ""], correct_answer: "" }],
  });

  const { data: user } = useUser();

  useEffect(() => {
    fetchCourses();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch("/api/instructor-analytics", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();

      const courseStats = {
        totalEnrollments: data.courses.reduce(
          (sum, course) => sum + course.enrollments,
          0
        ),
        enrollmentRate: Math.round(
          data.courses.reduce(
            (sum, course) => sum + course.averageProgress,
            0
          ) / data.courses.length
        ),
      };

      const quizMetrics = {
        averageScore: Math.round(
          data.quizzes.reduce((sum, quiz) => sum + quiz.averageScore, 0) /
            data.quizzes.length
        ),
        completionRate: Math.round(
          (data.quizzes.reduce((sum, quiz) => sum + quiz.totalAttempts, 0) /
            data.courses.length) *
            100
        ),
      };

      const completionRates = {
        completedLessons: data.lessons.reduce(
          (sum, lesson) => sum + lesson.studentsCompleted,
          0
        ),
        completionRate: Math.round(
          data.lessons.reduce((sum, lesson) => sum + lesson.completionRate, 0) /
            data.lessons.length
        ),
      };

      setAnalytics({ courseStats, quizMetrics, completionRates });
    } catch (err) {
      console.error(err);
      setAnalyticsError("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/course-operations", {
        method: "POST",
        body: JSON.stringify({ type: "fetch" }),
      });
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError("Could not load courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/course-operations", {
        method: "POST",
        body: JSON.stringify({
          type: "create",
          ...newCourse,
        }),
      });
      if (!response.ok) throw new Error("Failed to create course");
      await fetchCourses();
      setShowNewCourseForm(false);
      setNewCourse({ title: "", description: "" });
    } catch (err) {
      setError("Could not create course");
      console.error(err);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/quiz-operations", {
        method: "POST",
        body: JSON.stringify({
          type: "create",
          lessonId: selectedCourse.id,
          ...newQuiz,
        }),
      });
      if (!response.ok) throw new Error("Failed to create quiz");
      setShowNewQuizForm(false);
      setNewQuiz({
        title: "",
        questions: [
          { question: "", options: ["", "", ""], correct_answer: "" },
        ],
      });
    } catch (err) {
      setError("Could not create quiz");
      console.error(err);
    }
  };

  const addQuestion = () => {
    setNewQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: "", options: ["", "", ""], correct_answer: "" },
      ],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="w-full flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation1 userRole="instructor" userName={user?.name} />

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold font-inter text-gray-800">
            Instructor Panel
          </h1>
          <button
            onClick={() => setShowNewCourseForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>New Course
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        <div className="mb-8">
          <AnalyticsDashboard
            courseStats={analytics?.courseStats}
            quizMetrics={analytics?.quizMetrics}
            completionRates={analytics?.completionRates}
            loading={analyticsLoading}
            error={analyticsError}
          />
        </div>

        <h2 className="text-2xl font-semibold mb-6">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowNewQuizForm(true);
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <i className="fas fa-quiz mr-2"></i>Add Quiz
                </button>
              </div>
            </div>
          ))}
        </div>

        {showNewCourseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Create New Course</h2>
              <form onSubmit={handleCreateCourse}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Course Title"
                    className="w-full p-2 border rounded"
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    placeholder="Course Description"
                    className="w-full p-2 border rounded"
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCourseForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNewQuizForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Create New Quiz</h2>
              <form onSubmit={handleCreateQuiz}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Quiz Title"
                    className="w-full p-2 border rounded"
                    value={newQuiz.title}
                    onChange={(e) =>
                      setNewQuiz((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                {newQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="mb-6 p-4 border rounded">
                    <input
                      type="text"
                      placeholder="Question"
                      className="w-full p-2 border rounded mb-2"
                      value={question.question}
                      onChange={(e) => {
                        const updatedQuestions = [...newQuiz.questions];
                        updatedQuestions[qIndex].question = e.target.value;
                        setNewQuiz((prev) => ({
                          ...prev,
                          questions: updatedQuestions,
                        }));
                      }}
                    />
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex mb-2">
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          className="w-full p-2 border rounded"
                          value={option}
                          onChange={(e) => {
                            const updatedQuestions = [...newQuiz.questions];
                            updatedQuestions[qIndex].options[oIndex] =
                              e.target.value;
                            setNewQuiz((prev) => ({
                              ...prev,
                              questions: updatedQuestions,
                            }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuestions = [...newQuiz.questions];
                            updatedQuestions[qIndex].correct_answer = option;
                            setNewQuiz((prev) => ({
                              ...prev,
                              questions: updatedQuestions,
                            }));
                          }}
                          className={`ml-2 px-3 py-2 rounded ${
                            question.correct_answer === option
                              ? "bg-green-600 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  <i className="fas fa-plus mr-2"></i>Add Question
                </button>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewQuizForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;