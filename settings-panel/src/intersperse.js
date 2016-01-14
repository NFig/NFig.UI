export default function intersperse(arr, sep) {
    return arr && arr.slice(1).reduce((xs, x, i) => xs.concat([sep,x]), [arr[0]]) || [];
}
