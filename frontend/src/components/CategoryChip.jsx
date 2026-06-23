const CLASS_MAP = {
  Product: 'chip-product',
  Support: 'chip-support',
  Billing: 'chip-billing',
  'Feature Request': 'chip-feature-request',
  Bug: 'chip-bug',
  Other: 'chip-other',
};

export default function CategoryChip({ category }) {
  return <span className={`chip ${CLASS_MAP[category] || 'chip-other'}`}>{category}</span>;
}
