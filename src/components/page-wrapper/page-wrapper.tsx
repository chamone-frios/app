import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { MainFrame, Navbar, WallPaper } from './page-wrapper.styles';

const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <WallPaper>
      <Navbar>
        <Link href="/">Home</Link>
        <Link href="/products">Produtos</Link>
      </Navbar>
      <MainFrame>{children}</MainFrame>
    </WallPaper>
  );
};

export { PageWrapper };
