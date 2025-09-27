'use client';

import { useState } from 'react';
import { db } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function AddCourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [chaptersText, setChaptersText] = useState('');

  const parseChaptersData = (text) => {
    const chapters = [];
    let currentChapter = null;

    const lines = text.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (line.toLowerCase().startsWith('chapter')) {
        if (currentChapter) {
          chapters.push(currentChapter);
        }
        currentChapter = { title: line, lessons: [] };
      } else if (line.toLowerCase().startsWith('lesson') && currentChapter) {
        const [lessonTitle, videoUrl] = line.split(',').map(s => s.trim());
        if (lessonTitle && videoUrl) {
          currentChapter.lessons.push({ title: lessonTitle, videoUrl: videoUrl });
        }
      }
    });

    if (currentChapter) {
      chapters.push(currentChapter);
    }

    return chapters;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !chaptersText) {
      alert('Please fill all fields');
      return;
    }

    const chapters = parseChaptersData(chaptersText);

    if (chapters.length === 0) {
      alert('Please add chapters and lessons in the correct format.');
      return;
    }

    try {
      await addDoc(collection(db, 'courses'), {
        title: title,
        description: description,
        price: `₹${price}`,
        chapters: chapters,
        createdAt: Timestamp.now(),
      });
      alert('Course added successfully!');
      // Form fields ko reset karein
      setTitle('');
      setDescription('');
      setPrice('');
      setChaptersText('');
    } catch (error) {
      alert('Error adding course: ' + error.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Course Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">Price (e.g., 499)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="chapters" className="block text-gray-700 font-semibold mb-2">Chapters and Lessons</label>
          <textarea
            id="chapters"
            value={chaptersText}
            onChange={(e) => setChaptersText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg h-48 font-mono text-sm"
            placeholder={`Bilkul is format mein daalein:\n\nChapter 1: Introduction\nLesson 1.1: Welcome, https://drive.google.com/videolink1\nLesson 1.2: Overview, https://drive.google.com/videolink2\n\nChapter 2: Getting Started\nLesson 2.1: Setup, https://drive.google.com/videolink3`}
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Add Course
        </button>
      </form>
    </div>
  );
}