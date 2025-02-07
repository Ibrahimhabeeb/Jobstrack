# Use Node.js image to build and run the app
FROM node:18 AS web-build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy both backend and client (React) to the container
COPY . .

# Install dependencies for both backend and frontend
RUN npm install && cd client && npm install && npm run build

# Expose the port for the backend server
EXPOSE 3000

# Command to run the backend (which will also serve the React app)
CMD ["npm", "start"]

