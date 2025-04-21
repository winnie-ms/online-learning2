"use client";
import React from "react";
import Navigation1 from "../../components/navigation-1";

function MainComponent() {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [captionsData, setCaptionsData] = useState(null);
  const { data: user } = useUser();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get("id");

        if (!courseId) {
          setError("No course ID provided");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/course-operations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "fetch", courseId: parseInt(courseId) }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await response.json();
        setCourse(data.course);
        if (data.course?.lessons?.length > 0) {
          setCurrentLesson(data.course.lessons[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, []);

  useEffect(() => {
    const fetchCaptionsData = async () => {
      if (!currentLesson?.id) return;

      try {
        const response = await fetch("/api/caption-operations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "get", lesson_id: currentLesson.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch captions");
        }

        const data = await response.json();
        setCaptionsData(data.caption);
      } catch (err) {
        console.error(err);
        // Silently fail for captions
      }
    };

    fetchCaptionsData();
  }, [currentLesson]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p className="text-gray-700 font-inter">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-book-open text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-700 font-inter">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation1 userRole={user?.role} userName={user?.name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentLesson?.videoId && (
              <VideoPlayer
                videoId={currentLesson.videoId}
                title={currentLesson.title}
                captionsUrl={captionsData?.captions_url}
              />
            )}

            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
              <h1 className="text-3xl font-bold font-inter text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              {course.instructor_name && (
                <div className="flex items-center mb-6">
                  <i className="fas fa-user-tie text-gray-400 mr-2"></i>
                  <span className="text-gray-700">
                    Instructor: {course.instructor_name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-semibold font-inter mb-4">
              Course Content
            </h2>

            <div className="space-y-4">
              {course.lessons?.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    currentLesson?.id === lesson.id
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "hover:bg-gray-50 border-2 border-gray-100"
                  }`}
                  onClick={() => setCurrentLesson(lesson)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        Lesson {index + 1}
                      </span>
                      <h3 className="font-medium text-gray-800">
                        {lesson.title}
                      </h3>
                      {lesson.has_captions && (
                        <span className="text-xs text-blue-600 mt-1 flex items-center">
                          <i className="fas fa-closed-captioning mr-1"></i>
                          Captions available
                        </span>
                      )}
                    </div>
                    <i className="fas fa-play-circle text-blue-500"></i>
                  </div>
                </div>
              ))}

              {course.quizzes?.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="p-4 rounded-lg border-2 border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        Quiz {index + 1}
                      </span>
                      <h3 className="font-medium text-gray-800">
                        {quiz.title}
                      </h3>
                    </div>
                    <i className="fas fa-question-circle text-purple-500"></i>
                  </div>

                  <a
                    href={`/quiz?id=${quiz.id}`}
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Take Quiz <i className="fas fa-arrow-right ml-1"></i>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;