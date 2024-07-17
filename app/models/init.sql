
CREATE SEQUENCE IF NOT EXISTS my_sequence START 100000;


CREATE TABLE IF NOT EXISTS programs(
  program_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  image TEXT,
  title TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- how many user registered for which program 
CREATE TABLE IF NOT EXISTS req_programs(
  req_programs_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  user_id TEXT,
  program_id TEXT,
  package_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_videos(
  product_videos_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  thumbnail TEXT,
  package_id TEXT,
  video_url TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS homepage_video(
  homepage_video_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS webinar_video(
  webinar_video_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS webinar_btn(
  webinar_btn_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS review(
  review_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  name TEXT,
  review TEXT,
  rating TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS users(
  user_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  user_name TEXT,
  email  TEXT UNIQUE NOT NULL,
  type TEXT,
  password TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
 
);
CREATE TABLE IF NOT EXISTS packages(
  package_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  package_name TEXT,
  image TEXT,
  -- title TEXT,
  -- program_id TEXT,
  package_price TEXT,
  package_offer_price TEXT,
  total_students TEXT,
  feature TEXT,
  status TEXT,
  -- description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS website_content(
  website_content_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  heading TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS faq(
  faq_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  heading TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress(
  user_progress_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  course_id TEXT,
  user_id TEXT,
  video_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
 
);
CREATE TABLE IF NOT EXISTS contact_us(
  contact_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT,
  phone_number TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
 
);
CREATE TABLE IF NOT EXISTS blogs(
  blog_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  title TEXT,
  image TEXT,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
 
);
CREATE TABLE IF NOT EXISTS payment_request(
  payment_request_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  whatsapp_number TEXT,
  screenshot TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
 
);


-- Check if a user with type 'admin' exists
SELECT COUNT(*) FROM users WHERE type = 'admin';

-- If no user with type 'admin' exists, insert a new user
INSERT INTO users (user_id,user_name, type, email,password,status)
SELECT nextval('my_sequence'), 'admin', 'Admin', 'admin@gmail.com','mtechub123','active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE type = 'Admin');
--  website content 
INSERT INTO website_content (name, heading, description)
SELECT 'Hero', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'Hero');

INSERT INTO website_content (name, heading, description)
SELECT 'BUNDLE', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'BUNDLE');

INSERT INTO website_content (name, heading, description)
SELECT 'ENROLLSINGLE', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'ENROLLSINGLE');

INSERT INTO website_content (name, heading, description)
SELECT 'FOOTER', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'FOOTER');

INSERT INTO website_content (name, heading, description)
SELECT 'Number', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'Number');

INSERT INTO website_content (name, heading, description)
SELECT 'Email', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'Email');

INSERT INTO website_content (name, heading, description)
SELECT 'Location', 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'Location');


INSERT INTO website_content (name, heading, description)
SELECT 'Contact Us', 'Contact Us', 'Fill up the form and our Team will get back to you within 24 hours.'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'Contact Us');

-- PopUpModal
INSERT INTO website_content (name, heading, description)
SELECT 'PopUpModal', 'Bundle Offer', 'Limited Time Offer!Get the complete Educator Empowerment Program bundle under TSM Academy for just ₹3500! Dont miss out on this incredible opportunity to transform your teaching skills and impact the lives of your students.Buy now and get instant access to all courses!Hurry! Offer valid for a limited time only! ⏰Feel free to adjust as needed!.'
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE name = 'PopUpModal');

-- If the faq table is empty, insert a new faq
INSERT INTO faq (faq_id, heading, description)
SELECT nextval('my_sequence'), 'Dummy Heading', 'Dummy Description'
WHERE NOT EXISTS (SELECT 1 FROM faq);

