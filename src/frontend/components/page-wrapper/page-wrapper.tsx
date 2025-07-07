import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { Masrcme, Navbar, WallPaper } from './page-wrapper.styles';

const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <WallPaper>
      <Navbar>
        <Link href="/">Home</Link>
        <Link href="/products">Produtos</Link>
        <Link href="/clients">Clientes</Link>
      </Navbar>
      <Masrcme>{children}</Masrcme>
    </WallPaper>
  );
};

export { PageWrapper };
