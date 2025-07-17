import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { Main, Navbar, WallPaper } from './page-wrapper.styles';

const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <WallPaper>
      <Navbar>
        <Link href="/">Home</Link>
        <Link href="/products">Produtos</Link>
        <Link href="/clients">Clientes</Link>
        <Link href="/orders">Pedidos</Link>
      </Navbar>
      <Main>{children}</Main>
    </WallPaper>
  );
};

export { PageWrapper };
