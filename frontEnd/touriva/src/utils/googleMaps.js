/**
 * Google Maps / Places API Configuration Utility
 * Centralizes access to Google Maps API keys from environment variables.
 * Prevents hardcoding or committing credentials in client bundles.
 */

export const getGoogleMapsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_API_KEY || ''
}

export const getPlacePhotoUrl = (photoName, maxWidthPx = 800) => {
  const key = getGoogleMapsApiKey()
  if (!photoName) return ''
  return key 
    ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${key}`
    : ''
}
