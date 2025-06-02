Here's a polished English documentation file based on everything you've shared:

---

# 📄 Project Documentation

## ✅ Status

**It's Done.**
This project is fully functional and has been developed using the following technologies:

* **Frontend:** ReactJS, TypeScript, Vite, TailwindCSS, ShadCN UI
* **Backend:** Node.js, Express
* **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
* **Auth:** Google Login
* **File Handling:** Multer (for media uploads)

---

## 🚀 Features

### ✅ Authentication & Authorization

* **Google Login** is implemented.
* The **first page is protected**—users **cannot access any route unless authenticated**.
* On login:

  * The app checks the backend for the user.
  * If the user exists (by email), it proceeds.
  * If not, a **new user entry is created** in the database.
* New users are always assigned the **Editor** role.
* Only **admins can assign the Admin role**. Currently, that’s **just me**.

---

## 📊 Dashboard

Once logged in, you’ll be redirected to the **Dashboard** which displays:

* **Logs**
* **Total Artists**
* **Total Content**
* **Total Users**

---

## 🧭 Navigation & Pages

### Sidebar Pages

1. **Artist**

   * Fields: Name, Bio, Genre, Image
2. **Content**

   * Fields: Title, Content Type, File
   * Backend handles file uploads (audio/image), and the file links are stored in the DB.
3. **Users**

   * Admin-only access.
   * Non-admins will see a **fallback screen** if they try to access it.

---

## 🔍 Features in Listing Pages

All major listing pages have:

* **Pagination**
* **Backend-powered Filters**
* **Search**
* **Batch Delete** (with checkboxes)

---

## 🛠 Backend Overview

* **Express** server handles routes.
* **Multer** is used for handling file uploads.
* **PostgreSQL (via Neon)** is used for the database.
* **Tables are created directly in Neon using SQL queries**.
* **Middleware:**

  * Currently used for **authentication only**.
  * All other endpoints are **public** for now, but they can be secured using **Bearer tokens** later.

---

## 🎨 UI & UX

* **ShadCN UI** used for rapid UI development.
* **Basic UX improvements**: loading indicators, form validations.
* **Responsiveness is minimal**, but it works **smoothly on PC**.
* **No advanced animations** implemented.

---

## 📂 Media Handling

* Media is stored **locally**.
* **Only media links are stored in the database**.
* `.env` files are included **separately**, not pushed to GitHub.

---

## 🧾 Table Actions

Each table includes specific actions:

* **Edit / Delete** for Artists and Content
* **Download** for Content
* **Ban / Unban** for Users

  * **Banned users appear in red** in the user table.

---

## 🔜 Bonus / Good-to-Have Features Implemented

Implemented all bonus features **except**:

> “View user activity: playlists created, tracks liked”
> (This was skipped as it required new tables.)

---

## ⚙️ Dev Environment

* Both **Frontend** and **Backend** have been run and tested in **development mode**.

---

## ❓ Need Help?

If you have any questions related to this project, feel free to reach out.
