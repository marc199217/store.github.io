FROM ruby:3.2

RUN apt-get update -qq && apt-get install -y nodejs npm build-essential libpq-dev
RUN gem install "jekyll:4.4.1" "bundler"

WORKDIR /srv/jekyll

COPY Gemfile* ./
RUN bundle install

COPY package*.json ./
RUN npm install 

COPY . .

RUN npm run build:sass && echo "SCSS compiled!"

# Run Jekyll build
CMD ["jekyll", "build"]