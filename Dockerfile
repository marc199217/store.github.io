FROM ruby:3.2
RUN apt-get update && apt-get install -y nodejs npm
RUN gem install "jekyll:4.4.1" "bundler"
WORKDIR /srv/jekyll

# Copy the current directory contents into the container at /srv/jekyll
COPY . .

# Install any needed packages specified in Gemfile
RUN bundle install

# Run Jekyll build
CMD ["jekyll", "build"]