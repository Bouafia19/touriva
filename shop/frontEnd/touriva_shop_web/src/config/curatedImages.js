/**
 * Touriva Shop Curated Product & Artisanal Photography Engine
 * Provides authentic, high-resolution Algerian artisanal goods, handicrafts,
 * textiles, pottery, and travel gear photography.
 */

export const CURATED_SHOP_PHOTOGRAPHY = {
  heroSlides: [
    {
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=85',
      title: 'Maroquinerie d’Exception & Cuirs Sahariens',
      subtitle: 'Sacs de voyage, besaces d’expédition et maroquinerie façonnée à la main par les maîtres tanneurs.',
      ctaText: 'Explorer la Collection',
      link: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1600&q=85',
      title: 'Art de Vivre & Traditions de l’Hospitalité',
      subtitle: 'Services à thé ciselés en laiton, dinanderie de la Casbah et pièces authentiques de collection.',
      ctaText: 'Découvrir les Pièces',
      link: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=85',
      title: 'Céramiques & Poteries Ancestrales',
      subtitle: 'Poteries berbères façonnées à la main et objets d’art inspirés par les terroirs d’Algérie.',
      ctaText: 'Voir le Catalogue',
      link: '/products'
    }
  ],

  products: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', // Handcrafted leather bag
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', // Traditional tea set
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', // Traditional ceramics
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', // Leather travel backpack
    'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80', // Artisanal copper
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80', // Natural desert cosmetic oils
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'  // Vintage travel equipment
  ],

  fallbackProduct: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
}

export function isValidShopImage(url) {
  if (!url || typeof url !== 'string') return false
  const lower = url.trim().toLowerCase()
  if (
    lower.startsWith('data:image/') ||
    lower.includes('javascript') ||
    lower.includes('online-shop') ||
    lower.includes('placeholder') ||
    lower.includes('null') ||
    lower.includes('undefined')
  ) {
    return false
  }
  return lower.startsWith('http://') || lower.startsWith('https://')
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getResolvedProductImage(product, index = 0) {
  if (!product) return CURATED_SHOP_PHOTOGRAPHY.fallbackProduct

  if (isValidShopImage(product.img)) return product.img
  if (Array.isArray(product.images) && product.images.length > 0 && isValidShopImage(product.images[0])) {
    return product.images[0]
  }

  const idStr = product._id || product.id || product.name || product.code || String(index)
  const hash = hashString(idStr)
  const pool = CURATED_SHOP_PHOTOGRAPHY.products
  return pool[hash % pool.length]
}

export default CURATED_SHOP_PHOTOGRAPHY
