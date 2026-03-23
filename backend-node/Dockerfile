# Use the official lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port (Cloud Run sets this dynamically, but we document it here)
EXPOSE 5000

# Start the server using the standard Node command (not nodemon for production)
CMD ["node", "index.js"]