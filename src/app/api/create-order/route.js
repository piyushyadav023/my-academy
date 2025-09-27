import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { courseId, userId, userEmail } = await request.json();

    if (!courseId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ Environment variables validation
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'TEST';

    console.log("=== CASHFREE CREDENTIALS DEBUG ===");
    console.log("APP_ID exists:", !!appId);
    console.log("APP_ID length:", appId?.length);
    console.log("APP_ID preview:", appId?.substring(0, 8) + "...");
    console.log("SECRET_KEY exists:", !!secretKey);
    console.log("SECRET_KEY length:", secretKey?.length);
    console.log("SECRET_KEY preview:", secretKey?.substring(0, 12) + "...");
    console.log("Environment:", environment);

    if (!appId || !secretKey) {
      return NextResponse.json({ 
        error: 'Payment gateway credentials not configured' 
      }, { status: 500 });
    }

    // Course data fetch
    const courseDocRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseDocRef);

    if (!courseDoc.exists()) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    const price = parseFloat(courseData.price.replace(/[^\d.]/g, ''));

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
    }

    console.log("Order amount:", price);

    // ✅ Cashfree initialization with correct environment
    let cf;
    try {
      cf = new Cashfree({
        appId: appId.trim(), // Remove any extra spaces
        secretKey: secretKey.trim(),
        env: environment === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX', // Correct environment mapping
      });
      
      console.log("Cashfree environment set to:", environment === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX');
    } catch (initError) {
      console.error("Cashfree init error:", initError);
      return NextResponse.json({ error: 'Payment service initialization failed' }, { status: 500 });
    }

    // ✅ Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ Order request with all required fields
    const orderRequest = {
      order_id: orderId,
      order_amount: price,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: userEmail,
        customer_name: userEmail.split('@')[0], // Extract name from email
        customer_phone: "9999999999", // Dummy phone for testing
      },
      order_meta: {
        course_id: courseId,
        user_id: userId,
      },
      order_note: `Course Purchase: ${courseId}`,
    };

    console.log("=== ORDER REQUEST ===");
    console.log(JSON.stringify(orderRequest, null, 2));

    // ✅ Create order with detailed error handling
    let order;
    try {
      console.log("Creating Cashfree order...");
      order = await cf.PGCreateOrder(orderRequest);
      
      console.log("=== ORDER RESPONSE ===");
      console.log(JSON.stringify(order, null, 2));
      
    } catch (apiError) {
      console.error("=== CASHFREE API ERROR ===");
      console.error("Error message:", apiError.message);
      console.error("Response status:", apiError.response?.status);
      console.error("Response data:", JSON.stringify(apiError.response?.data, null, 2));
      console.error("Request config:", JSON.stringify(apiError.config, null, 2));
      
      // Check for specific error types
      if (apiError.response?.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid payment gateway credentials. Please check your Cashfree API keys.',
          debug: process.env.NODE_ENV === 'development' ? {
            appId: appId?.substring(0, 8) + "...",
            hasSecretKey: !!secretKey,
            environment: environment
          } : undefined
        }, { status: 500 });
      }
      
      if (apiError.response?.status === 400) {
        return NextResponse.json({ 
          error: 'Invalid order request. Please check the order details.',
          debug: process.env.NODE_ENV === 'development' ? apiError.response?.data : undefined
        }, { status: 400 });
      }
      
      throw apiError;
    }

    // ✅ Validate response
    if (!order?.data?.payment_link) {
      console.error("Invalid order response structure:", order);
      return NextResponse.json({ error: 'Failed to generate payment link' }, { status: 500 });
    }

    console.log("✅ Payment link created successfully:", order.data.payment_link);

    return NextResponse.json({ 
      success: true,
      payment_link: order.data.payment_link,
      order_id: order.data.order_id,
    });

  } catch (error) {
    console.error("=== ROUTE ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json({ 
      error: 'Failed to create payment order',
      message: error.message,
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        response: error.response?.data
      } : undefined
    }, { status: 500 });
  }
}