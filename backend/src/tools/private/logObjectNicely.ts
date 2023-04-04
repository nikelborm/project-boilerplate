// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function logObjectNicely(item: any): void {
  console.dir(item, {
    colors: true,
    compact: false,
    depth: null,
  });
}
