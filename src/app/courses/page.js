import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import BuyNowButton from '@/components/BuyNowButton'; // <-- YEH LINE SABSE ZAROORI HAI

// Yeh line Next.js ko batati hai ki is page ko hamesha server par render karein aur cache na karein
export const dynamic = 'force-dynamic';

// Yeh function database se saare courses fetch karega
async function fetchCourses() {
  const querySnapshot = await getDocs(collection(db, "courses"));
  const courses = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Yahan hum createdAt Timestamp ko plain text (ISO String) mein badal rahe hain
    const courseData = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    };
    courses.push(courseData);
  });
  return courses;
}

export default async function CoursesPage() {
  const courses = await fetchCourses();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Our Courses</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                <p className="text-gray-700 mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-semibold text-blue-600">{course.price}</p>
                  <BuyNowButton course={course} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}