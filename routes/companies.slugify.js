function slugify(term, state=null) {
  return state ? _slugify(term) + '-' + hash(state) : _slugify(term)
}

/**
 * 
 * @param {string} term 
 * @returns 
 */
function _slugify(term) {
  return term.toLowerCase()
    .replace(/^[.,;!\s]+/g, '')
    .replace(/[.,;\s!]+$/g, '')
    .replace(/[\s.,;!]+/g, '-')
}

/**
 * 
 * @param {string} str 
 */
function hash(str) {
  const seed = 1
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

module.exports = {
  slugify
}

