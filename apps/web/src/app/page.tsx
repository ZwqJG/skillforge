import { Suspense } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { SkillCard } from '@/components/skill/skill-card';
import { getHotSkills } from '@/lib/skills';

export default async function HomePage() {
  const hotSkills = await getHotSkills(6);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero 区域 */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          安全可信的 Skill 精选平台
        </h1>
        <p className="text-lg text-[var(--gray-500)] mb-8 max-w-2xl mx-auto">
          发现、安装和使用高质量的 AI Agent Skills。
          安全审核、一键安装、多平台支持。
        </p>
        <div className="flex justify-center">
          <Suspense fallback={<div className="w-full max-w-xl h-12 bg-[var(--gray-100)] rounded-lg animate-pulse" />}>
            <SearchBar placeholder="搜索 Skill，如 React、SEO、调试..." />
          </Suspense>
        </div>
      </section>

      {/* 热门 Skills */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">热门 Skills</h2>
          <a
            href="/search"
            className="text-sm text-[var(--gray-500)] hover:text-[var(--foreground)]"
          >
            查看全部 →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      {/* 分类入口 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">按分类浏览</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: '开发', slug: 'development', icon: '💻' },
            { name: '运营', slug: 'operations', icon: '📊' },
            { name: '设计', slug: 'design', icon: '🎨' },
            { name: '办公', slug: 'office', icon: '📝' },
            { name: '营销', slug: 'marketing', icon: '📢' },
            { name: '创意', slug: 'creative', icon: '✨' },
          ].map((category) => (
            <a
              key={category.slug}
              href={`/search?category=${category.slug}`}
              className="flex flex-col items-center gap-2 p-4 border border-[var(--gray-200)] rounded-lg hover:border-[var(--foreground)] transition-colors"
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
