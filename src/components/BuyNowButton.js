'use client';

import { auth } from '@/firebase';

export default function BuyNowButton({ course }) {

  const handlePayment = async () => {
    // Step 1: Check karein ki user logged in hai ya nahi
    const user = auth.currentUser;
    if (!user) {
      alert('Please login to purchase a course.');
      window.location.href = '/login'; // User ko login page par bhej dein
      return;
    }

    try {
      // Step 2: Hamare backend API ko call karein
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.payment_link) {
        // Step 3: User ko Cashfree ke payment page par redirect karein
        window.location.href = data.payment_link;
      } else {
        alert('Error: ' + (data.error || 'Could not create payment link.'));
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('An error occurred during payment. Please try again.');
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
    >
      Buy Now
    </button>
  );
}