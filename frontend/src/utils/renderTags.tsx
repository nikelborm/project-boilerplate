import { Tag } from 'antd';

export function renderTags(keywords: string | string[]) {
  const stringArray = Array.isArray(keywords)
    ? keywords
    : [...new Set(keywords?.split(','))];

  return stringArray.map((keyword) => <Tag key={keyword}>{keyword}</Tag>);
}
