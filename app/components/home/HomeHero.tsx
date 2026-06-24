import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';
import {useLocale} from '~/providers/LocaleProvider';
import type {HomepagePromoSlide} from '~/lib/trailrent/homepagePromo';

type HomeHeroProps = {
  promoSlides: HomepagePromoSlide[];
};

export function HomeHero({promoSlides}: HomeHeroProps) {
  const {locale, translations: tr} = useLocale();
  const isKa = locale === 'ka';
  const heroImage = promoSlides[0]?.imageUrl;

  return (
    <section className="cm-home-hero" aria-labelledby="home-hero-title">
      <div className="cm-home-hero__inner">
        <div className="cm-home-hero__text">
          <h1 id="home-hero-title" className="cm-home-hero__title">
            {isKa
              ? 'შენი შემდეგი თავგადასავალი იწყება აქ.'
              : 'Your next adventure starts here.'}
          </h1>
          <p className="cm-home-hero__sub">
            {isKa
              ? 'პრემიუმ კემპინგის აღჭურვილობის ქირა თბილისში — მეტროდან მიღება ან ბინაზე მიწოდება.'
              : 'Premium camping gear rental in Tbilisi — metro pickup or door delivery.'}
          </p>
          <Button to="/packages" variant="outline">
            {tr.hero.ctaPackages}
          </Button>
        </div>
        <div className="cm-home-hero__media">
          {heroImage ? (
            <img
              src={heroImage.includes('?') ? `${heroImage}&width=800` : `${heroImage}?width=800`}
              alt={promoSlides[0]?.title ?? 'Campmania gear'}
              loading="eager"
            />
          ) : (
            <div className="cm-img-placeholder" style={{minHeight: '100%'}} aria-hidden />
          )}
        </div>
      </div>
    </section>
  );
}
