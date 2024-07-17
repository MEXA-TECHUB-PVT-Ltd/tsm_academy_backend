// urls.js
const ApiUrl = 'http://tsm.academy'//website url
const ApiUrl_Admin = 'http://admin.tsm.academy' //admin url 
const ApiUrl_User = 'https://portal.tsm.academy' //admin url 

const urls = {
  email_verification_url: `${ApiUrl}/verifyEmail`,
  login_url: `${ApiUrl}/login`,
  login_url_admin: `${ApiUrl_Admin}/login`,
  login_url_user: `${ApiUrl_User}/login`,

  // Add more URLs here if needed
};

module.exports = urls;

