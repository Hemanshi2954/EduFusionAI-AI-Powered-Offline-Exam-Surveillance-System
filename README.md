# EduFusionAI – AI-Powered Offline Exam Surveillance System

EduFusionAI is an intelligent offline exam surveillance solution built using AI, computer vision, and web technologies to monitor student behavior during exams such as NEET, JEE, and university-level assessments. It detects suspicious activities without requiring an internet connection, ensuring fairness and integrity in offline environments.

## 🧠 Key Features

- 🎥 Face detection & recognition
- 🧍 Pose estimation (head tilt, movement)
- 👀 Eye-gaze tracking
- 📱 Object detection (e.g., mobiles, cheat slips)
- 🔊 Audio analysis for whispering or noise (planned)
- ⚠️ Real-time cheating alerts and logs
- 🗂️ Student-wise activity reports
- 🖥️ Future-ready Admin Dashboard (EduProtor)

## 🛠️ Technologies Used

| Component       | Tech Stack                                      |
|----------------|--------------------------------------------------|
| Frontend (Web)  | React.js, Tailwind CSS                          |
| Backend (Web)   | Django, Django REST Framework                   |
| ML Models       | Python, OpenCV, TensorFlow, YOLOv8, MediaPipe   |
| Audio Analysis  | PyDub, PyAudio, SpeechRecognition (Planned)     |
| Database        | SQLite (Local)                                  |

## 🚀 How It Works

1. **Face Registration**: Student details and face data are captured and stored.
2. **Real-Time Monitoring**: During exams, webcam feed is analyzed offline.
3. **Detection Modules**: ML models detect faces, objects, poses, and eye movement.
4. **Cheating Alerts**: Logs are generated per student for suspicious activities.
5. **Admin Dashboard** *(future scope)*: Web UI for managing users and reviewing activity logs.

## 📦 Project Structure

- `/Backend_Model`: Python ML modules for surveillance logic
- `/EduFusionAI`: Web app for future integration of admin controls
- `/dataset`: Training images for face/object detection
- `/logs`: Activity logs and flagged alerts

## 🧪 Testing

- ✅ White-box tests for ML model accuracy
- ✅ Black-box tests for user scenarios
- ✅ SQLite data integrity and logging validation

## ⚙️ Setup Instructions

1. Clone this repo:
   ```bash
   git clone https://github.com/Hemanshi2954/EduFusionAI-AI-Powered-Offline-Exam-Surveillance-System.git
   cd EduFusionAI-AI-Powered-Offline-Exam-Surveillance-System

2. Install dependencies (Python, React, etc.)

3. Run ML backend:
   ```bash
   cd Backend_Model
   python main.py

4. (Optional) Run the frontend:
    ```bash
   cd EduProtor
   npm install
   npm start
