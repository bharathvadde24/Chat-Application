
import { Client, Databases, Query, ID, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
const databases = new Databases(client);
const storage = new Storage(client);

export const storageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;

export const db = {
  sendMessage: (message) => databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
    ID.unique(),
    {
      user_id: message.user_id,
      message: message.message,
      timestamp: new Date().toISOString(),
      seen: false,
      senderName: message.senderName,
      isEdited: false,
      fileId: message.fileId || undefined,
      fileType: message.fileType || undefined,
      isDeleted: false,
      isFile: message.isFile || false,
      
    }
  ),
  
  getMessages: () => databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
    [Query.orderDesc('timestamp')]
  ),
  
  updateMessage: (documentId, newMessage) => databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
    documentId,
    { message: newMessage, isEdited: true }
  ),

  markAsSeen: (documentId) => databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
    documentId,
    { seen: true }
  ),

  subscribe: (callback) => {
    const channel = `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID}.documents`;
    return client.subscribe(channel, callback);
  },

  deleteMessage: async (documentId, fileId) => {
    try {
      // For file messages - hard delete
      if (fileId) {
        await storage.deleteFile(storageBucketId, fileId);
        return databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
          documentId
        );
      } 
      // For text messages - soft delete
      else {
        return databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
          documentId,
          { isDeleted: true }
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  uploadFile: (file) => {
    return storage.createFile(
      storageBucketId,
      ID.unique(),
      file
    );
  },

  getFileUrl: (fileId) => {
    return storage.getFileView(storageBucketId, fileId);
  }
};