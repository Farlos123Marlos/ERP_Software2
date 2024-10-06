@echo off

:: Iniciar o backend em segundo plano, sem mostrar a janela
echo Iniciando o backend em segundo plano...
start /b npm start --prefix back >nul 2>&1

:: Salvar o PID do processo do backend
set /A backPID=%errorlevel%

:: Iniciar o frontend no mesmo terminal
echo Iniciando o frontend...
cd meufront
npm start

:: Após o frontend ser encerrado, finalizar o backend
echo Finalizando o backend...
taskkill /PID %backPID% /F
