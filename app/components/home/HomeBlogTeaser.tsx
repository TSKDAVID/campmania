import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

export type BlogTeaserArticle = {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  excerpt?: string | null;
  blogHandle: string;
};

export function HomeBlogTeaser({articles}: {articles: BlogTeaserArticle[]}) {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  if (!articles.length) return null;

  return (
    <section className="cm-home-section" aria-labelledby="home-blog-heading">
      <div className="cm-container">
        <h2 id="home-blog-heading" className="cm-section-heading__title" style={{marginBottom: 'var(--space-4)'}}>
          {isKa ? 'ბლოგი' : 'Blog'}
        </h2>
        <div className="cm-blog-teaser">
          {articles.map((article) => (
            <article key={article.id} className="cm-blog-teaser__item">
              <p className="cm-blog-teaser__date">
                {new Date(article.publishedAt).toLocaleDateString(
                  isKa ? 'ka-GE' : 'en-GB',
                  {year: 'numeric', month: 'short', day: 'numeric'},
                )}
              </p>
              <h3 className="cm-blog-teaser__title">{article.title}</h3>
              {article.excerpt ? (
                <p className="cm-blog-teaser__excerpt">{article.excerpt}</p>
              ) : null}
              <Link
                to={`/blogs/${article.blogHandle}/${article.handle}`}
                className="cm-blog-teaser__read"
              >
                {isKa ? 'წაიკითხე' : 'read'} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
