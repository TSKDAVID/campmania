import {Link} from 'react-router';
import {Pagination} from '@shopify/hydrogen';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {IconArrowRight, IconSearch} from '~/components/trailrent/Icons';
import {useLocale} from '~/providers/LocaleProvider';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;
SearchResults.Prompt = SearchResultsPrompt;

function SearchResultsPrompt() {
  const {translations: tr} = useLocale();

  return (
    <div className="cm-search-empty">
      <span className="cm-search-empty-icon" aria-hidden>
        <IconSearch size={28} />
      </span>
      <h2 className="cm-search-empty-title">{tr.searchPage.promptTitle}</h2>
      <p className="cm-search-empty-hint">{tr.searchPage.promptHint}</p>
    </div>
  );
}

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  const {translations: tr} = useLocale();

  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="cm-search-section">
      <h2 className="cm-search-section-title">{tr.searchPage.articles}</h2>
      <ul className="cm-search-link-list">
        {articles.nodes.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <li key={article.id}>
              <Link prefetch="intent" to={articleUrl} className="cm-search-link-item">
                <span>{article.title}</span>
                <IconArrowRight size={16} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  const {translations: tr} = useLocale();

  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="cm-search-section">
      <h2 className="cm-search-section-title">{tr.searchPage.pages}</h2>
      <ul className="cm-search-link-list">
        {pages.nodes.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <li key={page.id}>
              <Link prefetch="intent" to={pageUrl} className="cm-search-link-item">
                <span>{page.title}</span>
                <IconArrowRight size={16} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  const {translations: tr} = useLocale();

  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="cm-search-section">
      <h2 className="cm-search-section-title">{tr.searchPage.products}</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => (
          <>
            <div className="cm-catalog-grid cm-catalog-grid--gear cm-search-product-grid">
              {nodes.map((product, index) => {
                const productUrl = urlWithTrackingParams({
                  baseUrl: `/products/${product.handle}`,
                  trackingParams: product.trackingParameters,
                  term,
                });

                const price = product.selectedOrFirstAvailableVariant?.price;
                const compareAtPrice =
                  product.selectedOrFirstAvailableVariant?.compareAtPrice;
                const image = product.selectedOrFirstAvailableVariant?.image;
                const amount = price ? Number(price.amount) : 0;
                const compareAt = compareAtPrice
                  ? Number(compareAtPrice.amount)
                  : undefined;
                const priceLabel =
                  amount > 0 ? (
                    <PriceWithCompare
                      amount={amount}
                      compareAtAmount={compareAt}
                      suffix={
                        <>
                          {' '}
                          {tr.searchPage.perDay}
                        </>
                      }
                    />
                  ) : (
                    '—'
                  );

                return (
                  <CatalogProductCard
                    key={product.id}
                    to={productUrl}
                    title={product.title}
                    imageUrl={image?.url}
                    imageAlt={image?.altText ?? product.title}
                    price={priceLabel}
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />
                );
              })}
            </div>

            <div className="cm-search-pagination cm-search-pagination--bottom">
              <PreviousLink className="cm-search-pagination-btn">
                {isLoading ? tr.searchPage.loading : tr.searchPage.loadPrevious}
              </PreviousLink>
              <NextLink className="cm-search-pagination-btn">
                {isLoading ? tr.searchPage.loading : tr.searchPage.loadMore}
              </NextLink>
            </div>
          </>
        )}
      </Pagination>
    </section>
  );
}

function SearchResultsEmpty({term}: {term?: string}) {
  const {translations: tr} = useLocale();

  return (
    <div className="cm-search-empty">
      <span className="cm-search-empty-icon" aria-hidden>
        <IconSearch size={28} />
      </span>
      <h2 className="cm-search-empty-title">{tr.searchPage.emptyTitle}</h2>
      {term ? (
        <p className="cm-search-empty-term">
          {tr.searchPage.resultsFor.replace('{term}', term)}
        </p>
      ) : null}
      <p className="cm-search-empty-hint">{tr.searchPage.emptyHint}</p>
    </div>
  );
}
