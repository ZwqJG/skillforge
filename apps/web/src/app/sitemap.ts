import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getSkills } from '@/lib/skills';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
    },
  ];

  const pageSize = 200;
  let page = 1;
  let total = 0;

  for (;;) {
    const result = await getSkills({ page, page_size: pageSize, sort: 'recent' });
    const { skills } = result;
    total = result.total;

    for (const skill of skills) {
      urls.push({
        url: `${SITE_URL}/skill/${skill.slug}`,
        lastModified: skill.updated_at ? new Date(skill.updated_at) : new Date(),
      });
    }

    if (page * pageSize >= total || skills.length < pageSize) {
      break;
    }
    page += 1;
  }

  return urls;
}
