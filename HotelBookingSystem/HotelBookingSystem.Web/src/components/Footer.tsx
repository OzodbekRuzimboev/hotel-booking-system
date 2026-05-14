export function Footer() {
  return (
    <footer className="site-footer">
      <span>&copy; {new Date().getFullYear()} StayFinder</span>
      <span className="footer-separator" aria-hidden="true">
        |
      </span>
      <span>Simple stays, easier planning.</span>
      <span className="footer-separator" aria-hidden="true">
        |
      </span>
      <a href="mailto:support@stayfinder.com">support@stayfinder.com</a>
    </footer>
  );
}
