# File Upload Feature - Integration Guide

## ✅ Setup Complete!

The file upload feature has been successfully integrated using **Uploadthing's free tier** (2GB storage).

---

## 🚀 How to Use

### **For Supervisors (Admin Console)**

1. **Navigate to Admin Console**
   - Go to: http://localhost:3001/admin-console
   - Login with your supervisor account

2. **Create a Task with File Attachments**
   - Click "Create New Task" button
   - Fill in the task details (Title, Description, Month, Week, etc.)
   - Scroll down to the **"File Attachments (Optional)"** section
   - Click "Select Files" to choose files from your computer
   - Upload up to 5 files per task
   - Click "Upload X file(s)" to upload them
   - Click "Create Task" to save the task with attachments

3. **View Uploaded Files**
   - Once the task is created, you'll see it in the task list
   - Tasks with attachments show a 📎 icon with the count
   - Click on any file to view/download it

4. **Supported File Types**
   - **Images**: PNG, JPG, GIF, etc. (Max 4MB each, up to 5 files)
   - **PDFs**: Documents (Max 8MB each, up to 5 files)
   - **Videos**: MP4, etc. (Max 16MB each, up to 2 files)
   - **Text**: TXT, CSV, etc. (Max 2MB each, up to 5 files)

---

## 📋 File Upload Limits (Free Tier)

| File Type | Max Size | Max Files |
|-----------|----------|-----------|
| Images    | 4MB      | 5         |
| PDFs      | 8MB      | 5         |
| Videos    | 16MB     | 2         |
| Text      | 2MB      | 5         |

**Total Storage**: 2GB free with unlimited uploads

---

## 🔧 How It Works

1. **Upload Process**:
   - Files are uploaded to Uploadthing CDN
   - Uploaded files get a permanent URL
   - File metadata is saved to your database
   - Files are automatically CDN-hosted (fast access worldwide)

2. **Security**:
   - Only logged-in users can upload files
   - Authentication is checked on every upload
   - File types and sizes are validated

3. **Database Storage**:
   - File URLs, names, sizes, and types are stored in `task_attachments` table
   - Each attachment is linked to a specific task
   - You can query and display attachments anytime

---

## 🎯 Testing Steps

### **Test 1: Create Task with Files**
1. Go to http://localhost:3001/admin-console
2. Click "Create New Task"
3. Fill in required fields
4. Upload 1-3 test files (images or PDFs work best)
5. Click "Create Task"
6. Verify task appears with attachment count

### **Test 2: View and Download Files**
1. Find the task you just created
2. Look for the 📎 icon showing attachment count
3. Click on any file link
4. Verify file opens in a new tab

### **Test 3: Upload Different File Types**
1. Create another task
2. Try uploading:
   - An image (JPG/PNG)
   - A PDF document
   - A text file
3. Verify all upload successfully

---

## 🌐 Files Are Accessible to Everyone

Once uploaded, files can be:
- ✅ Viewed by anyone with the task link
- ✅ Downloaded by clicking the file name
- ✅ Opened in a new browser tab
- ✅ Shared with team members

**Note**: Files are hosted on Uploadthing's CDN, so they're fast and reliable!

---

## 📁 Where Files are Integrated

### **Admin Console** (`/admin-console`)
- ✅ File upload in task creation form
- ✅ Attachment display in task list
- ✅ Download links for all files

### **Other Consoles** (Future Integration)
You can integrate the same feature in:
- Account Manager Console
- Project Manager Console
- Client Console
- Team Console

Just follow the same pattern used in the admin console.

---

## 🔌 API Endpoints

### **Upload Files (via Uploadthing)**
- Endpoint: `POST /api/uploadthing`
- Handled automatically by the FileUploadButton component

### **Save Attachment Metadata**
- Endpoint: `POST /api/tasks/[taskId]/attachments`
- Body:
```json
{
  "fileName": "document.pdf",
  "fileUrl": "https://utfs.io/f/...",
  "fileSize": 123456,
  "fileType": "application/pdf"
}
```

### **Get Task Attachments**
- Endpoint: `GET /api/tasks/[taskId]/attachments`
- Returns: Array of attachments

### **Delete Attachment**
- Endpoint: `DELETE /api/tasks/[taskId]/attachments?attachmentId=xxx`

---

## 🎨 Reusable Components

### **FileUploadButton Component**
Located at: `components/ui/file-upload-button.tsx`

Usage in any page:
```tsx
import { FileUploadButton } from '@/components/ui/file-upload-button';

<FileUploadButton
  endpoint="taskAttachment"
  onUploadComplete={(files) => {
    console.log('Uploaded files:', files);
    // Save to database here
  }}
  maxFiles={5}
/>
```

---

## 💡 Tips

1. **File Names**: Use descriptive names for easier identification
2. **Multiple Files**: You can upload multiple files at once
3. **Remove Before Upload**: Click the X button to remove files before uploading
4. **Browser Support**: Works on all modern browsers
5. **Mobile**: Fully responsive and works on mobile devices

---

## 🐛 Troubleshooting

### "Upload failed" error
- Check your internet connection
- Verify file size doesn't exceed limits
- Make sure you're logged in

### Files not showing
- Refresh the page
- Check if the task was created successfully
- Look in the database to verify attachment records

### "Unauthorized" error
- Make sure you're logged in
- Check your Uploadthing API keys in `.env`

---

## ✨ What's Next?

You can now:
1. ✅ Upload files when creating tasks
2. ✅ View and download attachments
3. ✅ Share files with team members
4. ✅ Track all uploaded files in the database

**Enjoy your new file upload feature! 🎉**
