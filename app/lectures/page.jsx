"use client";
import React from "react";

function MainComponent() {
  const [publicLectures, setPublicLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    const fetchPublicLectures = async () => {
      try {
        const response = await fetch("/api/public-lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch public lectures");
        }

        const data = await response.json();
        setPublicLectures(data.lessons || []);

        // Extract unique courses for filtering
        const uniqueCourses = [
          ...new Set(data.lessons.map((lecture) => lecture.course_title)),
        ];
        setCourses(uniqueCourses);

        // Set first lecture as selected by default if available
        if (data.lessons && data.lessons.length > 0) {
          setSelectedLecture(data.lessons[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load public lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicLectures();
  }, []);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const filteredLectures =
    courseFilter === "all"
      ? publicLectures
      : publicLectures.filter(
          (lecture) => lecture.course_title === courseFilter
        );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <></>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <></>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-black font-inter mb-4">{error}</p>
            <a href="/" className="text-black underline">
              Return to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <></>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-inter text-black mb-8">Public Lectures</h1>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-black">
              Browse our collection of free public lectures. No login required.
            </p>

            <div className="w-full md:w-auto">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-black rounded-none bg-white text-black"
              >
                <option value="all">All Courses</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {selectedLecture ? (
              <div className="bg-white border border-black">
                <div className="aspect-video bg-black">
                  {selectedLecture.video_url ? (
                    <VideoPlayer
                      videoId={getYouTubeId(selectedLecture.video_url)}
                      title={selectedLecture.title}
                      captionsUrl={
                        selectedLecture.has_captions
                          ? selectedLecture.captions_url
                          : null
                      }
                      onError={(msg) => setVideoError(msg)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      No video available
                    </div>
                  )}
                </div>

                {videoError && (
                  <div className="p-4 bg-red-50 text-red-700 border-t border-black">
                    {videoError}
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-2xl font-inter text-black mb-2">
                    {selectedLecture.title}
                  </h2>
                  <div className="flex items-center text-black">
                    <span className="mr-2">Course:</span>
                    <span>{selectedLecture.course_title}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-black p-8 flex items-center justify-center h-64">
                <p className="text-black">Select a lecture to start watching</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-black p-6">
            <h2 className="text-xl font-inter text-black mb-4">
              Available Lectures
            </h2>

            {filteredLectures.length === 0 ? (
              <p className="text-black py-4">
                No lectures available for this filter
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    onClick={() => setSelectedLecture(lecture)}
                    className={`p-4 border cursor-pointer transition-colors ${
                      selectedLecture?.id === lecture.id
                        ? "border-black bg-black text-white"
                        : "border-black text-black hover:bg-gray-50"
                    }`}
                  >
                    <h3 className="font-medium mb-1">{lecture.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{lecture.course_title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-black mb-4">
            Want access to all our courses and lectures?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/account/signin"
              className="px-8 py-2 border border-black text-black bg-white hover:bg-gray-50"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="px-8 py-2 border border-black text-white bg-black hover:bg-gray-800"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;