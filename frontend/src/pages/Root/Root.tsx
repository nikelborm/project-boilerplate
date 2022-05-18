export function Root() {
  const asd = () => {
    debugger;
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
