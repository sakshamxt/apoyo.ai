# Use the official lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Cloud Run dynamically assigns a port via the $PORT environment variable. 
# We default to 8000 if it's not set.
ENV PORT=8000

# Command to run the FastAPI server, binding to 0.0.0.0 so Cloud Run can route traffic to it
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]