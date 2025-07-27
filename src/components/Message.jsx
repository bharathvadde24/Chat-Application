// D:\my-app\src\components\Message.jsx
"use client";
import { useState } from 'react';
import { FaPaperclip, FaRegEdit, FaTrash, FaTimes,FaCheckDouble,FaBan } from 'react-icons/fa';
import { db } from '@/utils/appwriteConfig';
// import blackDoubleCheck from "../../public/black_single_icon.svg";
// import greenDoubleCheck from "../../public/green_double_tick.png";
// import Image from 'next/image';

export default function Message({ message, currentUser, otherUserName, onEdit, onDelete, isSent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.message); 

  const canEdit = message.user_id === currentUser.id && 
                 !message.isDeleted && 
                 !message.fileId; 

  const canDelete = message.user_id === currentUser.id && !message.isDeleted;
  const displayContent = message.message;

  const handleSave = () => {
    if (editedText.trim() && editedText !== message.text) {
      onEdit?.(message.$id, editedText);
    }
    setIsEditing(false);
  };

  if (message.isDeleted && message.isFile) {
    return null;
  }

  return (
    // Changed alignment based on isSent prop
    <div className={`mb-4 flex ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl ${isSent ? 'bg-green-100 border border-none shadow-sm' : 'bg-[#fff] border border-gray-300 shadow-sm'} p-3 rounded-lg`}>
        <div className="flex items-center mb-1">
          <span className={`font-medium ${isSent ? 'text-blue-700' : 'text-gray-700'}`}>
            {isSent ? 'You' : otherUserName}
          </span>
          <span className="text-gray-500 text-xs mx-2">
            {new Date(message.timestamp).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>

          {canEdit && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer ml-2"
            >
              <FaRegEdit size={14} />
            </button>
          )}
          
          {canDelete && !isEditing && (
            <button 
              onClick={() => onDelete?.(message.$id, message.fileId)}
              className="text-gray-500 hover:text-red-500 cursor-pointer ml-2"
            >
              <FaTrash size={14} />
            </button>
          )}
          
          { message.isEdited && !message.isDeleted && (
            <span className="text-gray-500 text-xs italic ml-1">(edited)</span>
          )}
        </div>

        {!isEditing && message.isDeleted ? (
          <p className="italic text-gray-500 flex flex-row items-center">
            <FaBan className="mr-2 text-black-500" size={14} />
            {isSent ? "You deleted this message" : "This message was deleted"}
          </p>
        ) : isEditing ? (
          <div className="flex flex-col">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="border p-2 rounded w-full"
              rows={2}
              autoFocus
            />
            <div className="flex mt-1">
              <button 
                onClick={handleSave}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm mr-2"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className='break-all'>{displayContent}</p>
            
            {message.fileId && !message.isDeleted && (
              <div className="mt-2 relative group">
                {message.fileType && message.fileType.startsWith('image/') ? (
                  <div className="relative">
                    <img 
                      src={db.getFileUrl(message.fileId)} 
                      alt={displayContent}
                      className="max-w-full rounded"
                    />
                    {canDelete && (
                      <button
                        onClick={() => onDelete?.(message.$id, message.fileId)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <a 
                      href={db.getFileUrl(message.fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center ${isSent ? 'text-blue-700' : 'text-gray-700'}`}
                    >
                      <FaPaperclip className="mr-1" />
                      <span className="truncate max-w-[120px]">
                        {displayContent}
                      </span>
                      <span className="text-xs ml-2 opacity-75">
                        ({message.fileType})
                      </span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {isSent && !message.isDeleted && (
          <div className="flex justify-end mt-1">
            {message.seen ? (
              <span className="text-xs text-gray-500">
               <FaCheckDouble className="mr-1 text-green-600" size={14} />
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                 <FaCheckDouble className="mr-1 text-gray-500" size={14} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
