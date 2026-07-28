import { ComputeAttributes } from '@turbopuffer/turbopuffer/resources';

// Exercises every variant of the `ComputeAttributes` union. The values are typed
// as `ComputeAttributes` (compile-time coverage) and asserted after serialization
// into a `compute_attributes` map (runtime / wire-form coverage).
describe('ComputeAttributes serialization', () => {
  const variants: Array<{ name: string; value: ComputeAttributes; expected: string }> = [
    {
      name: 'VectorDist',
      value: ['vec', 'VectorDist', [0.5]],
      expected: '["vec","VectorDist",[0.5]]',
    },
    {
      name: 'Highlight',
      value: ['Highlight', 'body'],
      expected: '["Highlight","body"]',
    },
    {
      name: 'HighlightWithConfig',
      value: ['Highlight', 'body', {}],
      expected: '["Highlight","body",{}]',
    },
    {
      name: 'RankBy (ANN)',
      value: ['vec', 'ANN', [0.5]],
      expected: '["vec","ANN",[0.5]]',
    },
  ];

  it.each(variants)('serializes the $name variant', ({ value, expected }) => {
    const body: { compute_attributes: { [key: string]: ComputeAttributes } } = {
      compute_attributes: { my_attr: value },
    };

    expect(JSON.stringify(value)).toBe(expected);
    expect(JSON.stringify(body)).toBe(`{"compute_attributes":{"my_attr":${expected}}}`);
  });
});
