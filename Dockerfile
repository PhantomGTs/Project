# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle your app source code
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Define environment variable
ENV NODE_ENV production

# Run your application
CMD ["node", "index.js"] 