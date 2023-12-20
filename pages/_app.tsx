import '../styles/globals.css';
import type { AppProps } from 'next/app';

function DependaballApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default DependaballApp;
