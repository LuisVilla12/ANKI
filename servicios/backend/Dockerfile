# Usamos la imagen oficial de Python
FROM python:3.11

# Instalamos gcc para compilar algunas dependencias si hace falta
RUN apt-get update && apt-get install -y gcc

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos del backend al contenedor
COPY . .

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Exponemos el puerto que usará la app
EXPOSE 8000

# Comando para arrancar la app con uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
