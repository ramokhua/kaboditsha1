@echo off
echo 🚀 Starting KaboDitsha full environment...
echo.

echo 📡 Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo 🎨 Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo 🗄️  Starting Prisma Studio...
start "Prisma Studio" cmd /k "cd backend && npx prisma studio"

echo.
echo ✅ All services starting!
echo 📊 Backend: http://localhost:5000
echo 🎨 Frontend: http://localhost:5173
echo 🗄️  Prisma Studio: http://localhost:5555
echo.
echo 💡 Close the windows to stop services
