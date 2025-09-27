// src/app/page.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-8 text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to GuildAcademy
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your one-stop destination to learn, grow, and compete.
        </p>
        <a href="/courses" className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold">
          Explore Courses
        </a>
      </main>

      <Footer />
    </div>
  );
}