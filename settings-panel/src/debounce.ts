export default function<TFunc extends Function>(
  func: TFunc,
  delay: number,
): TFunc {
  let timeout;

  return function(this: any, ...args: any[]) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, delay);
  } as any;
}
