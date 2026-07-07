export function searchAndFilter(list, q, status, key='name') {
  const qq = (q || '').toLowerCase().trim();
  return list.filter(item => {
    const text = (item[key] || '').toLowerCase();
    const matchQ = !qq || text.includes(qq);
    const matchStatus = status === 'all' || item.status === status;
    return matchQ && matchStatus;
  });
}
