# Smart Issue Board

A modern, production-ready issue tracking application built with React, Firebase, and TailwindCSS.

## 🚀 Live Demo

[View Live Demo](#) _(Deploy to Vercel and add link here)_

## 📋 Features

- **User Authentication**: Email & Password authentication via Firebase Auth
- **Issue Management**: Create, view, update, and filter issues
- **Smart Duplicate Detection**: AI-powered similar issue detection using Jaccard similarity algorithm
- **Status Management**: Enforced status transition rules (Open → In Progress → Done)
- **Advanced Filtering**: Filter issues by status and priority
- **Real-time Updates**: Powered by Firebase Firestore
- **Modern UI**: Beautiful, responsive interface built with TailwindCSS

## 🛠️ Tech Stack

### Frontend
- **React** with **Vite**: Fast, modern development experience
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icon library
- **date-fns**: Lightweight date formatting

### Backend/Database
- **Firebase Firestore**: NoSQL cloud database
- **Firebase Authentication**: Secure user authentication

### Why This Stack?

#### React + Vite
I chose React with Vite because:
- **Performance**: Vite offers lightning-fast HMR (Hot Module Replacement) and optimized builds
- **Developer Experience**: Instant server start and efficient bundling
- **Modern**: ES modules support out of the box
- **Community**: Massive ecosystem and excellent documentation

#### TailwindCSS
- **Rapid Development**: Utility classes allow quick prototyping
- **Consistency**: Design system built-in with consistent spacing, colors
- **Production-Ready**: Automatic purging of unused CSS for optimal bundle size
- **Customization**: Easy to extend and customize

#### Firebase
- **Simplicity**: No backend server setup required
- **Scalability**: Automatically scales with usage
- **Real-time**: Built-in real-time capabilities
- **Security**: Built-in security rules and authentication

## 📊 Firestore Data Structure

### Collection: `issues`

```javascript
{
  id: "auto-generated-id",           // Firestore document ID
  title: "Fix login bug",            // Issue title
  description: "Detailed desc...",   // Issue description
  priority: "High",                  // Low | Medium | High
  status: "Open",                    // Open | In Progress | Done
  assignedTo: "user@example.com",    // Assigned user
  createdBy: "creator@example.com",  // Creator email
  createdAt: Timestamp               // Firestore Timestamp
}
```

### Why This Structure?

1. **Simple & Scalable**: Flat structure is easy to query and maintain
2. **Indexed Fields**: Status and priority are indexed for fast filtering
3. **Temporal Ordering**: `createdAt` timestamp enables chronological sorting
4. **User Tracking**: Both creator and assignee are tracked for accountability

### Query Optimization
- Default query: `orderBy('createdAt', 'desc')` - newest first
- Filtered queries: `where('status', '==', status)` combined with ordering
- Firestore composite indexes are automatically created when needed

## 🔍 Similar Issue Detection

### Algorithm: Jaccard Similarity

The application uses **Jaccard similarity** to detect duplicate or similar issues:

```javascript
similarity = (intersection of word sets) / (union of word sets)
```

### How It Works

1. **Normalization**: Convert text to lowercase, remove punctuation, split into words
2. **Set Creation**: Create word sets from title and description
3. **Comparison**: Calculate Jaccard index between new issue and existing issues
4. **Weighted Scoring**: 
   - Title similarity: 70% weight
   - Description similarity: 30% weight
5. **Threshold**: Issues with >50% similarity are flagged

### Why This Approach?

- **Simplicity**: Easy to understand and debug
- **Effectiveness**: Catches obvious duplicates without over-engineering
- **Performance**: Fast computation, suitable for client-side processing
- **No External Dependencies**: No ML models or APIs required
- **Explainable**: Similarity score is transparent to users

### Example

```
Issue 1: "Login button not working on mobile"
Issue 2: "Mobile login button broken"
→ High similarity (many shared keywords: login, button, mobile)
```

## ⚠️ Status Transition Rules

The application enforces logical status progression:

- ✅ **Open → In Progress** (allowed)
- ✅ **In Progress → Done** (allowed)
- ✅ **In Progress → Open** (allowed, for reopening)
- ❌ **Open → Done** (blocked with user-friendly message)

This prevents issues from being marked as complete without proper review.

## 🚧 Challenges & Learning

### Confusing Aspects

1. **Firebase Security Rules**: Initially struggled with Firestore permission errors. Learned to set up proper read/write rules in Firebase Console.

2. **Similar Issue Detection Timing**: Deciding when to check (on submit vs. on blur) was tricky. Went with pre-submit check to avoid unnecessary API calls.

3. **Status Transition Logic**: Had to think carefully about edge cases (e.g., what if someone wants to reopen an issue?). Settled on preventing only Open→Done direct transition.

### Solutions

- **Security Rules**: Set Firestore rules to allow authenticated users full access during development
- **User Experience**: Added clear warning modal for similar issues with "Create Anyway" option
- **Status Enforcement**: Client-side validation with clear error messages

## 🎯 Future Improvements

If I had more time, I would add:

1. **Comments & Collaboration**
   - Add comment threads to issues
   - Real-time notifications for updates
   - @mentions for team members

2. **Advanced Search**
   - Full-text search across all issues
   - Search by date range
   - Search by assignee/creator

3. **Analytics Dashboard**
   - Visualize issue distribution (pie charts, bar graphs)
   - Track resolution time
   - Team performance metrics

4. **Email Notifications**
   - Notify assignee when issue is created
   - Remind about overdue issues
   - Daily digest emails

5. **Issue Templates**
   - Pre-defined templates for bug reports, feature requests
   - Custom fields based on issue type

6. **Better Duplicate Detection**
   - Use embeddings (OpenAI, Cohere) for semantic similarity
   - Consider issue metadata (priority, assignee)
   - ML-based duplicate prediction

7. **Drag & Drop**
   - Kanban board view
   - Drag issues between status columns

8. **Attachments**
   - Upload screenshots/files to issues
   - Firebase Storage integration

9. **Issue Dependencies**
   - Link related issues
   - Block/blocker relationships
   - Visualize dependency graph

10. **Mobile App**
    - React Native version
    - Push notifications

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore & Auth enabled

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firestore Security Rules**
   
   In Firebase Console > Firestore > Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /issues/{issue} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Deployment (Vercel)

### Option 1: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Using Vercel Dashboard

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables in Vercel

Add all `VITE_` prefixed variables from your `.env` file in:
**Project Settings → Environment Variables**

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up with new email
- [ ] Log in with existing account
- [ ] Create new issue
- [ ] Try creating duplicate issue (should show warning)
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Change issue status (Open → In Progress → Done)
- [ ] Try invalid transition (Open → Done, should block)
- [ ] Log out and verify redirect

## 📄 License

MIT License - feel free to use for your own projects!

## 👨‍💻 Author

Built with devesh tyagi 

---

**Note**: This is a demo project built for learning purposes. For production use, implement proper error handling, testing, and monitoring.
