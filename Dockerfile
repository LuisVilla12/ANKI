#Usar un contenedor con la imagen de python
FROM python:3.11
#Establece el directorio de trabajo
WORKDIR /app
#Copia todo al contenedor
COPY . .
#Ejecuta e instala todas las librerias
RUN pip install --no-cache-dir -r requirements.txt
#escuchara el puerto 8000
EXPOSE 8000
#Ejecuta el servicio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000","--reload"]
