FROM library/node:slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy source code
COPY . /usr/src/app

# Install app dependencies
RUN cd /usr/src/app
RUN npm install

# Expose the default 3000 port to run the application
EXPOSE 3000
CMD [ "npm", "start" ]
