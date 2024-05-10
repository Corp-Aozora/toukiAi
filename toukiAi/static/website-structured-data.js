const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "株式会社あおぞら",
    "url": "https://www.aozoratouki.com"
  };
  
  const websiteDataScript = document.createElement("script");
  websiteDataScript.type = "application/ld+json";
  websiteDataScript.text = JSON.stringify(websiteData);
  document.head.appendChild(websiteDataScript);
  