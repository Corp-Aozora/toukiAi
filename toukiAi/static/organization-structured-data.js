const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "株式会社あおぞら",
    "url": "https://www.aozoratouki.com",
    "logo": "https://www.aozoratouki.com/static/toukiApp/img/会社ロゴ.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+81-800-805-1528",
      "contactType": "customer service",
      "areaServed": "JP",
      "availableLanguage": ["Japanese"]
    }
  };
  
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(organizationData);
  document.head.appendChild(script);
  