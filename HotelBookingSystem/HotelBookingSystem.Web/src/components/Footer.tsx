export function Footer() {
  return (
    <footer className="site-footer">
      <span>&copy; {new Date().getFullYear()} StayFinder</span>
      <span className="footer-separator" aria-hidden="true">
        |
      </span>
      <span>Простое бронирование и удобное планирование.</span>
      <span className="footer-separator" aria-hidden="true">
        |
      </span>
      <a href="mailto:support@stayfinder.com">support@stayfinder.com</a>
    </footer>
  );
}
