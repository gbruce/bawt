class ObjectUtil {

  // Retrieves key for given value (if any) in object
  public static KeyByValue(object: any, target: any) {
    if (!('lookup' in object)) {
      const lookup: any = {};
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          const value = object[key];
          lookup[value] = key;
        }
      }
      object.lookup = lookup;
    }

    return object.lookup[target];
  }

}

export default ObjectUtil;
