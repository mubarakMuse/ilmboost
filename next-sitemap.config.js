module.exports = {
  // REQUIRED: add your own domain name here
  siteUrl: process.env.SITE_URL || "https://ilmboost.com",
  generateRobotsTxt: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: [
    "/twitter-image.*", 
    "/opengraph-image.*", 
    "/icon.*", 
    "/account", 
    "/dashboard",
    "/admin/*"
  ],
};
