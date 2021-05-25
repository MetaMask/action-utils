describe('Main entry file', () => {
  it('can be imported', async () => {
    const module = await import('.');
    expect(Object.keys(module).length).toBeGreaterThan(0);
  });
});
