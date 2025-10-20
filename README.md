# 🎓 Unibell - University Facility Booking System

## ✅ System Status: FULLY OPERATIONAL

**Live URL:** https://unibell.lindy.site

---

## 📋 Features Implemented & Tested

### 1. **Authentication System** ✓
- **Student Login:** `student1` / `student123`
- **Admin Login:** `admin@unibell` / `Admin@123`
- **Registration:** New account creation with password strength indicator
- **Session Management:** JWT tokens with localStorage persistence
- **Auto-fill Demo Credentials:** Click demo credentials to auto-populate login form

### 2. **Improved Login Page** ✓
- Beautiful gradient background (purple/blue)
- Modern card-based design with animations
- Form validation with helpful error messages
- Password strength indicator
- Demo credentials display with click-to-fill functionality
- Responsive design for mobile devices
- Loading state with spinner animation

### 3. **Improved Register Page** ✓
- Account type selection (Student/Admin)
- Password confirmation validation
- Password strength meter
- Optional phone number field
- Form validation with error messages
- Responsive design

### 4. **Student Dashboard** ✓
- **Gym Booking:**
  - Select from 4 fixed time slots (05:00-06:00, 06:00-07:00, 17:00-18:00, 18:00-19:00)
  - Max 10 students per slot
  - Admin confirmation workflow (Pending → Confirmed/Rejected)
  - One booking per day limit
  - View booking history with tokens and status

- **Laundry Booking:**
  - 50-minute slots from 6 AM to midnight
  - 10 machines total
  - Weekly restriction: 1 booking per student per week
  - 1-3 loads per session
  - 10-minute early arrival time
  - Auto-confirmed bookings
  - View booking history with arrival times and tokens

- **Enquiries:**
  - Send questions to admin
  - View pending and replied enquiries
  - Admin responses displayed inline

- **Reports:**
  - Report facility issues
  - Track report status (Pending/Resolved)
  - View admin responses

- **Announcements:**
  - View latest announcements from admin
  - Timestamped entries

### 5. **Admin Dashboard** ✓
- **Gym Booking Management:**
  - View all student gym bookings
  - Confirm or reject pending bookings
  - See booking tokens and timestamps
  - Color-coded status badges (Pending/Confirmed/Rejected)

- **Enquiry Management:**
  - View all student enquiries
  - Reply to pending enquiries
  - Track replied enquiries
  - Inline reply text areas

- **Report Management:**
  - View all student reports
  - Respond to pending reports
  - Track resolved reports
  - Inline response text areas

### 6. **5 Theme System** ✓
All themes fully functional with localStorage persistence:

1. **🌙 Dark Theme** (Default)
   - Blue gradient background
   - Professional dark cards
   - White text on dark backgrounds

2. **☀️ Light Theme**
   - Clean white background
   - Light gray cards
   - Dark text for readability

3. **✨ Animation Theme**
   - Purple/pink gradient
   - Floating animations
   - Button pulse effects
   - Enhanced visual feedback

4. **🏙️ Urban Theme**
   - Orange/black industrial style
   - Accent borders
   - Bold typography

5. **🎓 UWC Theme**
   - University colors (blue/gold)
   - Background images from Unsplash
   - Professional academic look

### 7. **User Interface Improvements** ✓
- **Modern Design:**
  - Gradient navbar with user info
  - Card-based layout
  - Responsive grid system
  - Smooth animations and transitions

- **Alert System:**
  - Success alerts (green)
  - Error alerts (red)
  - Info alerts (blue)
  - Auto-dismiss after 5 seconds

- **Booking Display:**
  - Color-coded status badges
  - Booking tokens displayed
  - Timestamps for all entries
  - Organized by type (Gym/Laundry)

- **Form Validation:**
  - Real-time validation
  - Helpful error messages
  - Focus management
  - Disabled states for buttons

### 8. **Data Persistence** ✓
- File-based JSON storage (no MongoDB required)
- Automatic data saving
- Data directory: `/home/code/unibell/data/`
- Files: users.json, bookings.json, enquiries.json, reports.json, announcements.json

---

## 🧪 Testing Results

### Student Workflow ✓
1. ✓ Login as student1
2. ✓ Book gym slot (shows Pending status)
3. ✓ Book laundry slot (shows Confirmed status)
4. ✓ Send enquiry (shows Pending status)
5. ✓ Send report (shows Pending status)
6. ✓ View announcements
7. ✓ Switch themes (all 5 themes working)
8. ✓ Logout

### Admin Workflow ✓
1. ✓ Login as admin@unibell
2. ✓ View all gym bookings
3. ✓ Confirm gym booking (status changes to Confirmed)
4. ✓ Reject gym booking (status changes to Rejected)
5. ✓ View all enquiries
6. ✓ Reply to enquiry (status changes to Replied)
7. ✓ View all reports
8. ✓ Respond to report (status changes to Resolved)
9. ✓ Switch themes
10. ✓ Logout

### Validation Tests ✓
1. ✓ Cannot book gym twice on same day
2. ✓ Cannot book laundry twice in same week
3. ✓ Cannot submit empty enquiry
4. ✓ Cannot submit empty report
5. ✓ Cannot reply with empty text
6. ✓ Password validation on registration
7. ✓ Login validation

---

## 🏗️ Technical Architecture

### Backend (Node.js/Express)
- **Server:** `server.js` (CommonJS format)
- **Port:** 4000
- **Database:** File-based JSON storage
- **Authentication:** Bearer token in Authorization header
- **API Endpoints:**
  - `/api/register` - User registration
  - `/api/login` - User authentication
  - `/api/profile` - User profile management
  - `/api/slots` - Available booking slots
  - `/api/book/gym` - Book gym slot
  - `/api/book/laundry` - Book laundry slot
  - `/api/bookings` - Get user bookings
  - `/api/admin/gym/:id/:action` - Confirm/reject gym booking
  - `/api/enquiry` - Submit enquiry
  - `/api/enquiries/user` - Get user enquiries
  - `/api/admin/enquiries` - Get all enquiries
  - `/api/admin/enquiry/:id/reply` - Reply to enquiry
  - `/api/report` - Submit report
  - `/api/reports/user` - Get user reports
  - `/api/admin/reports` - Get all reports
  - `/api/admin/report/:id/reply` - Reply to report
  - `/api/admin/announcement` - Create announcement
  - `/api/announcements` - Get announcements
  - `/api/qr` - Generate QR code
  - `/api/admin/bookings/export` - Export bookings as CSV

### Frontend (HTML/CSS/JavaScript)
- **Login Page:** `login.html` - Beautiful gradient UI with form validation
- **Register Page:** `register.html` - Account creation with password strength
- **Dashboard:** `index.html` - Main application interface
- **Styles:** `style.css` - Multi-theme CSS with animations
- **Responsive Design:** Mobile-first approach with media queries

### Key Technologies
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **File System** - Data persistence
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No dependencies required

---

## 📊 System Specifications

### Gym Booking
- **Capacity:** 10 students per slot
- **Slots:** 4 fixed times (05:00-06:00, 06:00-07:00, 17:00-18:00, 18:00-19:00)
- **Booking Limit:** 1 per student per day
- **Confirmation:** Admin approval required
- **Status:** Pending → Confirmed/Rejected

### Laundry Booking
- **Capacity:** 10 machines
- **Slot Duration:** 50 minutes
- **Operating Hours:** 6 AM to midnight
- **Loads per Session:** 1-3
- **Early Arrival:** 10 minutes before slot
- **Booking Limit:** 1 per student per week
- **Status:** Auto-confirmed

### Enquiries & Reports
- **Submission:** Students can submit anytime
- **Admin Response:** Text-based replies
- **Status Tracking:** Pending → Replied/Resolved
- **History:** All submissions stored with timestamps

---

## 🚀 Deployment

### Running the Server
```bash
cd /home/code/unibell
node server.js
```

### Accessing the Application
- **URL:** https://unibell.lindy.site
- **Login Page:** https://unibell.lindy.site/login.html
- **Register Page:** https://unibell.lindy.site/register.html
- **Dashboard:** https://unibell.lindy.site/index.html

### Demo Accounts
- **Student:** student1 / student123
- **Admin:** admin@unibell / Admin@123

---

## 📁 File Structure
```
/home/code/unibell/
├── server.js              # Node.js/Express backend
├── index.html             # Main dashboard
├── login.html             # Login page
├── register.html          # Registration page
├── style.css              # Multi-theme styles
├── package.json           # Dependencies
├── .env                   # Environment variables
├── data/                  # JSON data storage
│   ├── users.json
│   ├── bookings.json
│   ├── enquiries.json
│   ├── reports.json
│   └── announcements.json
└── README.md              # This file
```

---

## ✨ Key Improvements Made

1. **Enhanced Login UI**
   - Gradient background with animations
   - Auto-fill demo credentials
   - Real-time form validation
   - Loading state with spinner
   - Error messages with animations

2. **Improved Dashboard**
   - Modern navbar with user info
   - Responsive grid layout
   - Color-coded status badges
   - Alert system with auto-dismiss
   - Better form organization

3. **Better Admin Panel**
   - Clear section headers
   - Inline reply functionality
   - Confirm/reject buttons for bookings
   - Status tracking with visual indicators
   - Organized enquiries and reports

4. **Theme System**
   - 5 complete themes
   - localStorage persistence
   - Smooth transitions
   - Consistent styling across all pages

5. **Data Persistence**
   - File-based storage (no database required)
   - Automatic data saving
   - JSON format for easy inspection
   - Backup-friendly structure

---

## 🎯 Future Enhancements

- Email notifications for booking confirmations
- SMS notifications via Twilio
- QR code generation for check-in
- CSV export for admin reports
- Advanced analytics dashboard
- Recurring bookings
- Booking cancellation
- User profile pictures
- Real-time notifications with Socket.io
- Mobile app version

---

## 📞 Support

For issues or questions, please contact the admin at admin@unibell

---

**Last Updated:** October 20, 2025
**Version:** 2.0 (Enhanced UI & Functionality)
**Status:** Production Ready ✓
