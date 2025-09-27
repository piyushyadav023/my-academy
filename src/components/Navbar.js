// components/Navbar.js
export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-2xl font-bold">GuildAcademy</a>
        <ul className="flex space-x-4">
          <li><a href="/" className="hover:text-gray-300">Home</a></li>
          <li><a href="/courses" className="hover:text-gray-300">Courses</a></li>
          <li><a href="/login" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Login</a></li>
        </ul>
      </div>
    </nav>
  );
}