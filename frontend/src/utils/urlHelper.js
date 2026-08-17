// URL formatting and domain helper

export const formatDomain = (urlString) => {
  if (!urlString) return 'Recipe Source';
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    let host = url.hostname.replace(/^www\./, '');
    
    // Friendly branding for major sites
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('tiktok.com')) return 'TikTok';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
    if (host.includes('pinterest.com')) return 'Pinterest';
    if (host.includes('nytimes.com')) return 'NYT Cooking';
    if (host.includes('allrecipes.com')) return 'Allrecipes';
    if (host.includes('seriouseats.com')) return 'Serious Eats';
    if (host.includes('bonappetit.com')) return 'Bon Appétit';
    if (host.includes('food52.com')) return 'Food52';
    if (host.includes('tasty.co')) return 'Tasty';
    if (host.includes('epicurious.com')) return 'Epicurious';
    if (host.includes('sallysbakingaddiction.com')) return "Sally's Baking";

    return host;
  } catch (err) {
    return 'Website';
  }
};

export const sanitizeUrl = (urlString) => {
  if (!urlString) return '#';
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  return `https://${urlString}`;
};
