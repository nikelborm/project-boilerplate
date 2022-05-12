export function Root() {
  const asd = () => {
    let sdff = 234;
    debugger;

    sdff = 2321234;
    console.log(123);

    sdff = 2342342;
    console.log(234);
    sdff = 23434535;
    console.log(1233);
    sdff = 234567567;
  };
  return (
    <div>
      <div>Root pasge</div>
      <button onClick={asd} type="button">
        Test debugger
      </button>
    </div>
  );
}
