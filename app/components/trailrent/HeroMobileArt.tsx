import {motion, useScroll, useTransform} from 'framer-motion';
import {useRef} from 'react';
import {
  DEFAULT_GEAR_KEYS,
  GEAR_LINE_ART,
  type GearArtKey,
} from '~/components/trailrent/gearLineArt';

const MOBILE_LAYOUT: Array<{key: GearArtKey; className: string}> = [
  {key: 'tent', className: 'cm-hero-mobile-art__item--a'},
  {key: 'sleepingBag', className: 'cm-hero-mobile-art__item--b'},
  {key: 'cookSet', className: 'cm-hero-mobile-art__item--c'},
  {key: 'snowboard', className: 'cm-hero-mobile-art__item--d'},
];

type HeroMobileArtProps = {
  packageImageUrls?: string[];
};

export function HeroMobileArt({packageImageUrls = []}: HeroMobileArtProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const yA = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const yD = useTransform(scrollYProgress, [0, 1], [0, -22]);
  const transforms = [yA, yB, yC, yD];

  return (
    <div ref={ref} className="cm-hero-mobile-art" aria-hidden>
      {MOBILE_LAYOUT.map((slot, index) => {
        const packageUrl = packageImageUrls[index];
        const gearKey = DEFAULT_GEAR_KEYS[index] ?? slot.key;

        return (
          <motion.div
            key={slot.key}
            className={`cm-hero-mobile-art__item ${slot.className}`}
            style={{y: transforms[index]}}
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1]}}
          >
            {packageUrl ? (
              <img
                src={packageUrl}
                alt=""
                className="cm-hero-mobile-art__photo"
                loading="eager"
              />
            ) : (
              GEAR_LINE_ART[gearKey]
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
