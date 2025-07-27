// import { Client } from 'node-appwrite';
// import { db } from '@/utils/appwriteConfig';

// export const sendEmailNotification = async (recipientId, message) => {
//   try {
//     const client = new Client()
//       .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
//       .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
//       .setKey(process.env.APPWRITE_API_KEY);

//     // Get recipient email
//     const recipient = await db.getDocument(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
//       'users', // Your users collection ID
//       recipientId
//     );

//     // Get sender info
//     const sender = await db.getDocument(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
//       'users', // Your users collection ID
//       message.user_id
//     );

//     // Prepare email content
//     const emailData = {
//       recipient: recipient.email,
//       subject: `New message from ${sender.name}`,
//       text: `You have a new message:\n\n"${message.message}"\n\nView chat: ${process.env.NEXT_PUBLIC_APP_URL}/chat`,
//       html: `<p>You have a new message from <strong>${sender.name}</strong>:</p>
//              <blockquote>${message.message}</blockquote>
//              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/chat">View in chat</a></p>`
//     };

//     // Send email (using your email service)
//     const response = await fetch('/api/send-email', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(emailData)
//     });

//     if (!response.ok) throw new Error('Email sending failed');
    
//     console.log('Email notification sent to', recipient.email);
//   } catch (error) {
//     console.error('Email notification error:', error);
//   }
// };