@echo off
echo ========================================
echo Building Enterprise AI Platform
echo ========================================

echo.
echo [1/3] Building Backend...
cd backend
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Backend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building Frontend...
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Build completed successfully!
echo.
echo Backend JAR: backend\target\*.jar
echo Frontend Build: frontend\dist\

echo.
echo ========================================
echo Build Complete!
echo ========================================
pause
