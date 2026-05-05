import React from 'react';
import { MathRenderer } from './components/MathRenderer';

export const TestMath = () => {
  return (
    <div className="p-10">
      <h1>Test Math</h1>
      <MathRenderer content="Inline math: $x^2 + y^2 = z^2$" />
      <MathRenderer content="Block math: $$E = mc^2$$" />
    </div>
  );
};
