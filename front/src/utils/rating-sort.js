export default function sortByRating(ra, rb) {
  if (ra.position && rb.position) return rb.position - ra.position;
  return ra.tier - rb.tier;
}
