import type {Route} from './+types/pages.contact';
import {Form} from 'react-router';
import {Input, Textarea} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Contact'},
];

export default function ContactPage() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <>
      <header className="cm-page-banner">
        <h1 className="cm-page-banner__title">
          {isKa ? 'დაგვიკავშირდით' : 'Contact'}
        </h1>
      </header>

      <div className="cm-contact-grid">
        <div>
          <h2 className="text-lg" style={{marginBottom: 'var(--space-3)'}}>
            {isKa ? 'საკონტაქტო' : 'Details'}
          </h2>
          <div className="cm-contact-row">
            <span className="text-muted">{isKa ? 'მისამართი' : 'Address'}</span>
            <br />
            Tbilisi, Georgia
          </div>
          <div className="cm-contact-row">
            <span className="text-muted">{isKa ? 'ელფოსტა' : 'Email'}</span>
            <br />
            <a href="mailto:hello@campmania.ge">hello@campmania.ge</a>
          </div>
          <div className="cm-contact-row">
            <span className="text-muted">{isKa ? 'ტელეფონი' : 'Phone'}</span>
            <br />
            <a href="tel:+995555000000">+995 555 00 00 00</a>
          </div>
          <div className="cm-contact-row">
            <span className="text-muted">Instagram</span>
            <br />
            <a
              href="https://instagram.com/campmania"
              target="_blank"
              rel="noopener noreferrer"
            >
              @campmania
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-lg" style={{marginBottom: 'var(--space-3)'}}>
            {isKa ? 'შეტყობინება' : 'Send a message'}
          </h2>
          <Form method="post" action="/pages/contact">
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-2)'}}>
              <Input
                name="contact[name]"
                label={isKa ? 'სახელი' : 'Name'}
                required
                autoComplete="name"
              />
              <Input
                name="contact[email]"
                type="email"
                label={isKa ? 'ელფოსტა' : 'Email'}
                required
                autoComplete="email"
              />
              <Textarea
                name="contact[body]"
                label={isKa ? 'შეტყობინება' : 'Message'}
                required
                rows={5}
              />
              <Button type="submit" variant="primary" fullWidth>
                {isKa ? 'გაგზავნა' : 'Send'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
