// D:\my-app\src\components\Chat.jsx
"use client";

import {FaPaperclip, FaRegEdit, FaTimes, FaComments, FaBell } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList';
import { db, ID } from '@/utils/appwriteConfig';
import Image from 'next/image';
import Message from "../../public/MessageIcon.svg";

export default function Chat() {
  const users = {
    bharath: { id: 'bharath', name: 'Bharath' },
    aakash: { id: 'aakash', name: 'Aakash' }
  };
  
  const [currentUser, setCurrentUser] = useState(users.bharath);
  const [otherUser, setOtherUser] = useState(users.aakash);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const subscriptionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupRealtime();
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, []);

  // Track current user and chat open state
  const currentUserRef = useRef(currentUser);
  const isChatOpenRef = useRef(isChatOpen);
  
  useEffect(() => {
    currentUserRef.current = currentUser;
    isChatOpenRef.current = isChatOpen;
  }, [currentUser, isChatOpen]);

  const fetchMessages = async () => {
    try {
      const response = await db.getMessages();
      const sortedMessages = response.documents.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setMessages(sortedMessages);
      
      // Check for unread messages
      const unreadExists = sortedMessages.some(msg => 
        msg.user_id !== currentUser.id && !msg.seen
      );
      setHasUnread(unreadExists);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtime = () => {
    try {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      
      subscriptionRef.current = db.subscribe(response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newMessage = response.payload;
          
          setMessages(prev => {
            const exists = prev.some(msg => msg.$id === newMessage.$id);
            return exists ? prev : [newMessage, ...prev];
          });
          
          // If message is from other user and chat is closed, show notification
          if (newMessage.user_id !== currentUserRef.current.id && !isChatOpenRef.current) {
            setHasUnread(true);
          }
        }
        else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          setMessages(prev => 
            prev.map(msg => 
              msg.$id === response.payload.$id ? response.payload : msg
            )
          );
        }
        else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          setMessages(prev => prev.filter(msg => msg.$id !== response.payload.$id));
        }
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('Realtime connection error:', error);
      setIsConnected(false);
      setTimeout(setupRealtime, 3000);
    }
  };

  const switchUser = () => {
    setCurrentUser(otherUser);
    setOtherUser(currentUser);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    
    setIsUploading(true);
    let fileId = null;
    let fileType = null;
    let finalMessage = newMessage.trim();

    try {
      // Open chat when sending message if it's closed
      if (!isChatOpen) {
        setIsChatOpen(true);
        setHasUnread(false);
      }

      // Upload file if exists
      if (file) {
        const uploadedFile = await db.uploadFile(file);
        fileId = uploadedFile.$id;
        fileType = file.type; 
        finalMessage = file.name;
      }

      // Send message
      await db.sendMessage({
        user_id: currentUser.id,
        senderName: currentUser.name,
        message: finalMessage, 
        fileId,
        fileType,
        isFile: !!file, 
      });
      
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (messageId, newText) => {
    try {
      await db.updateMessage(messageId, newText);
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDelete = async (messageId, fileId) => {
    try {
      await db.deleteMessage(messageId, fileId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const toggleChat = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    
    // Clear notification when opening chat
    if (newState) {
      setHasUnread(false);
    }
  };

  return (
    <div className="fixed left-0 right-0 z-50 bg-white pl-50 pr-50 h-screen">

      {/* Message input - always visible */}
      <div className="p-3 bg-white border-t flex justify-end flex-col">
        {/* File preview */}
        {file && (
          <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
            <div className="flex items-center truncate">
              <FaPaperclip className="mr-2 text-gray-500" />
              <span className="text-sm truncate max-w-xs">{file.name}</span>
            </div>
            <button 
              onClick={removeFile}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        <div className="flex mb-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          
          <label className="bg-gray-200 border border-l-0 rounded-r-lg px-4 flex items-center cursor-pointer hover:bg-gray-300">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
            />
            <FaPaperclip className="text-gray-600" />
          </label>
        </div>
        <div className="flex justify-end">
        <button
          onClick={sendMessage}
          disabled={(!newMessage.trim() && !file) || isUploading}
          className="w-[20rem] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? 'Sending...' : 'Send Message'}
        </button>
        </div>
      </div>
      {/* Open chat button with notification */}
      <div className="p-3 bg-gray-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={toggleChat}
            className="flex items-center justify-center px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            <FaComments className="mr-2" />

            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
          
          {hasUnread && !isChatOpen && (
            <span className="ml-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm flex items-center">
              <FaBell className="mr-1" /> New message!
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isConnected ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span className="text-sm">
            {isConnected ? 'Online' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Chat messages panel - hidden by default */}
      {isChatOpen && (
        <div className="border-t">
          <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
            <div>
              <h2 className="font-bold">Chatting as: {currentUser.name}</h2>
              <p className="text-sm text-gray-600">With: {otherUser.name}</p>
            </div>
            <button
              onClick={switchUser}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Switch to {otherUser.name}
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="h-[50vh] overflow-y-auto bg-gray-50">
            <ChatList 
              messages={messages} 
              currentUser={currentUser}
              otherUserName={otherUser.name}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      
    </div>
  );
}

