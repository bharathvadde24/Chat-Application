
// src/components/ChatList.jsx
"use client";
import { useEffect, useMemo } from 'react';
import Message from './Message';
import { db } from '@/utils/appwriteConfig';
import { formatMessageDate } from '@/utils/dateUtils';

export default function ChatList({ messages, currentUser, otherUserName, onEdit, onDelete }) {
  useEffect(() => {
    const receivedMessages = messages.filter(
      msg => msg.user_id !== currentUser.id && !msg.seen  
    );
    receivedMessages.forEach(msg => {
      db.markAsSeen(msg.$id);
    });
  }, [messages, currentUser]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    
    messages.forEach(message => {
      const dateKey = formatMessageDate(message.timestamp);
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
      {groupedMessages.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        groupedMessages.map(group => (
          <div key={group.date} className="mb-6">
            <div className="text-center text-xs text-gray-500 mb-2 flex justify-center">
              <p className='flex align-middle justify-center border w-18 rounded-[0.5rem] h-6 p-1 bg-gray-700 text-white'>{group.date}</p>
            </div>
            {group.messages.map((message) => (
              <Message 
                key={message.$id} 
                message={message} 
                currentUser={currentUser}
                otherUserName={otherUserName}
                onEdit={onEdit}
                onDelete={onDelete} 
                isSent={message.user_id === currentUser.id}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}









// // D:\my-app\src\components\ChatList.jsx
// "use client";
// import { useEffect } from 'react';
// import Message from './Message';
// import { db } from '@/utils/appwriteConfig';

// export default function ChatList({ messages, currentUser, otherUserName, onEdit, onDelete }) {
//   useEffect(() => {
//     const receivedMessages = messages.filter(
//       msg => msg.user_id !== currentUser.id && !msg.seen  
//     );
//     receivedMessages.forEach(msg => {
//       db.markAsSeen(msg.$id);
//     });
//   }, [messages, currentUser]);

//   return (
//     <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
//       {messages.length === 0 ? (
//         <div className="text-center py-10 text-gray-500">
//           No messages yet. Start the conversation!
//         </div>
//       ) : (
//         messages.map((message) => (
//           <Message 
//             key={message.$id} 
//             message={message} 
//             currentUser={currentUser}
//             otherUserName={otherUserName}
//             onEdit={onEdit}
//             onDelete={onDelete} 
//             isSent={message.user_id === currentUser.id} // Add this prop
//           />
//         ))
//       )}
//     </div>
//   );
// }
