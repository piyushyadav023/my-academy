'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CourseDetailPage({ params }) {
  const { courseId } = params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }
      try {
        const courseDocRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseDocRef);

        if (courseDoc.exists()) {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };
          setCourse(courseData);
          // Agar koi lesson select nahi hai, to pehla lesson by default dikhayein
          if (courseData.chapters && courseData.chapters.length > 0 && courseData.chapters[0].lessons.length > 0) {
            setSelectedLesson(courseData.chapters[0].lessons[0]);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching course: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chapters and Lessons List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            {course.chapters && course.chapters.length > 0 ? (
              course.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="mb-4 border-b pb-2 last:border-b-0">
                  <h3 className="font-bold text-lg mb-2">{chapter.title}</h3>
                  <ul>
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <li
                        key={lessonIndex}
                        className={`cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                          selectedLesson && selectedLesson.title === lesson.title && selectedLesson.videoUrl === lesson.videoUrl
                            ? 'bg-blue-100 text-blue-800'
                            : 'text-gray-800'
                        }`}
                        onClick={() => setSelectedLesson(lesson)}
                      >
                        {lesson.title}
                        {selectedLesson && selectedLesson.title === lesson.title && selectedLesson.videoUrl === lesson.videoUrl && (
                          <span className="ml-2 text-blue-500">&#10003;</span> // Checkmark for selected lesson
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No chapters or lessons available for this course.</p>
            )}
          </div>

          {/* Right Column: Video Player and Lesson Description */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            {selectedLesson ? (
              <>
                <h2 className="text-xl font-semibold mb-4">{selectedLesson.title}</h2>
                {selectedLesson.videoUrl ? (
                  <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                    {/* Video Player (Adjust src for different platforms) */}
                    <iframe
                      src={selectedLesson.videoUrl}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      title={selectedLesson.title}
                    ></iframe>
                  </div>
                ) : (
                  <p className="text-red-500">Video URL not available for this lesson.</p>
                )}
                <p className="mt-4 text-gray-700">
                  {/* Optional: Lesson description here if you add it to the lesson object */}
                  Watch this lesson to learn more about "{selectedLesson.title}".
                </p>
              </>
            ) : (
              <p className="text-center text-gray-500">Select a lesson to start learning.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}