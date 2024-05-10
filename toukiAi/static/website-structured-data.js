const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "株式会社あおぞら",
    "url": "https://www.aozoratouki.com"
  };
  
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(websiteData);
  document.head.appendChild(script);
  