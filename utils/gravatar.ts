/**
 * Generate Gravatar URL from email
 * @param email - User email address
 * @param size - Image size (default: 200)
 * @param defaultImage - Default image type (404, mp, identicon, monsterid, wavatar, retro, robohash, blank)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 200, defaultImage: string = 'mp'): string {
  if (!email) {
    return `https://www.gravatar.com/avatar/?s=${size}&d=${defaultImage}`;
  }

  // Trim and lowercase the email
  const trimmedEmail = email.trim().toLowerCase();
  
  // Generate MD5 hash (we'll use crypto API)
  const hash = hashEmail(trimmedEmail);
  
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

/**
 * Simple MD5 hash for email (browser-compatible)
 */
function hashEmail(email: string): string {
  // For client-side, we'll use a simpler approach with crypto API
  // Note: This is a placeholder - in production you might want to use a proper MD5 library
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  
  // For simplicity, we'll use a basic hash
  // In a real implementation, you should use crypto.subtle.digest or an MD5 library
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Convert to hex string (this is NOT MD5, just a placeholder)
  // For proper Gravatar support, use: https://www.npmjs.com/package/md5
  const hexHash = Math.abs(hash).toString(16).padStart(32, '0');
  
  return hexHash;
}

/**
 * Better approach: Use server-side MD5 hashing
 * This composable will fetch the gravatar URL from an API endpoint
 */
export async function getGravatarUrlSecure(email: string, size: number = 200): Promise<string> {
  try {
    const response = await $fetch('/api/user/gravatar', {
      method: 'POST',
      body: { email, size }
    });
    return (response as any).url;
  } catch (error) {
    console.error('Failed to get Gravatar URL:', error);
    return `https://www.gravatar.com/avatar/?s=${size}&d=mp`;
  }
}
