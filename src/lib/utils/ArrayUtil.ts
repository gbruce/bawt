class ArrayUtil {

  // Generates array from given hex string
  public static FromHex(hex: string) {
    const array = [];
    for (let i = 0; i < hex.length; i += 2) {
      array.push(parseInt(hex.slice(i, i + 2), 16));
    }
    return array;
  }

}

export default ArrayUtil;
