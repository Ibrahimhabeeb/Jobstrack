FROM node:18 AS nodeapi-build
WORKDIR /usr/src/app
COPY ./ ./backend/
RUN cd backend && npm install
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your Node.js app
CMD ["npm", "start"]