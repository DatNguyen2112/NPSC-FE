export const getRelativeTime = (dateString: string, statusCode: string) => {
  const now = new Date();
  const date = new Date(dateString);

  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 3 || diffInDays === 1 || (diffInDays === 2 && statusCode !== 'COMPLETED')) {
    return {
      type: 'warning',
      message: 'Sắp đến hạn',
      days: diffInDays,
    };
  }

  if (diffInDays === 0 && statusCode !== 'COMPLETED') {
    return {
      type: 'error',
      message: 'Đến hạn',
      days: 0,
    };
  }

  if (diffInDays < 0 && statusCode !== 'COMPLETED') {
    return {
      type: 'error',
      message: `Quá hạn ${Math.abs(diffInDays)} ngày`,
      days: diffInDays,
    };
  }

  return null;
};

export const getRelativeTimeReference = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);

  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'TODAY';
  }

  return null;
};

export const stripPTags = (html: string) => html?.replace(/^<p>/, '').replace(/<\/p>$/, '');

export const formatCurrency = (amount: number | string | undefined): string => {
  if (!amount) return '0 VND';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' VND';
};
