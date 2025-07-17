import { Fragment, ReactNode } from 'react';

type IntersperseProps = {
  elements: ReactNode[];
  inBetween: ReactNode;
};

const Intersperse = ({ elements, inBetween }: IntersperseProps) => {
  if (!elements.length) return <></>;

  const interspersedElements = elements.flatMap((element, index) =>
    index < elements.length - 1 ? [element, inBetween] : [element]
  );

  return interspersedElements.map((element, index) => (
    <Fragment key={index}>{element}</Fragment>
  ));
};

export { Intersperse };
